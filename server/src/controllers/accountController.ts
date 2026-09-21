import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { getSessionFromRequest } from '../lib/session.js';
import { getTeacherSessionFromRequest } from '../lib/teacherSession.js';

const email = z.string().email().transform((value) => value.trim().toLowerCase());

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email,
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6).max(100),
  newPassword: z.string().min(8).max(100),
});

const studentPreferencesSchema = z.object({
  notificationsEnabled: z.boolean(),
});

const teacherPreferencesSchema = z.object({
  compactMode: z.boolean().optional(),
  rememberFilters: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0, 'Informe ao menos uma preferência.');

export async function studentProfile(req: Request, res: Response) {
  const session = await getSessionFromRequest(req);
  if (!session || !session.userId || !session.user) {
    return res.status(401).json({ message: 'Entre em uma conta para acessar seu perfil.' });
  }

  return res.json({
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      isActive: session.user.isActive,
      notificationsEnabled: session.user.notificationsEnabled,
    },
  });
}

export async function updateStudentProfile(req: Request, res: Response) {
  const session = await getSessionFromRequest(req);
  if (!session || !session.userId || !session.user) {
    return res.status(401).json({ message: 'Entre em uma conta para editar seu perfil.' });
  }

  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Dados de perfil inválidos.', issues: parsed.error.flatten() });
  }

  if (parsed.data.email !== session.user.email) {
    const duplicate = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (duplicate) return res.status(409).json({ message: 'Este e-mail já está cadastrado.' });
  }

  const user = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: session.userId! },
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        notificationsEnabled: true,
      },
    });

    if (parsed.data.email !== session.user!.email) {
      await tx.session.deleteMany({
        where: {
          userId: session.userId!,
          token: { not: session.token },
        },
      });
    }

    return updated;
  });

  return res.json({ user });
}

export async function changeStudentPassword(req: Request, res: Response) {
  const session = await getSessionFromRequest(req);
  if (!session || !session.userId || !session.user) {
    return res.status(401).json({ message: 'Entre em uma conta para alterar sua senha.' });
  }

  const parsed = passwordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Dados de senha inválidos.', issues: parsed.error.flatten() });
  }

  const current = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!current || !(await bcrypt.compare(parsed.data.currentPassword, current.passwordHash))) {
    return res.status(400).json({ message: 'A senha atual está incorreta.' });
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.userId },
      data: { passwordHash },
    }),
    prisma.session.deleteMany({
      where: {
        userId: session.userId,
        token: { not: session.token },
      },
    }),
  ]);

  return res.status(204).send();
}

export async function updateStudentPreferences(req: Request, res: Response) {
  const session = await getSessionFromRequest(req);
  if (!session || !session.userId || !session.user) {
    return res.status(401).json({ message: 'Entre em uma conta para alterar preferências.' });
  }

  const parsed = studentPreferencesSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Preferências inválidas.', issues: parsed.error.flatten() });
  }

  const user = await prisma.user.update({
    where: { id: session.userId },
    data: { notificationsEnabled: parsed.data.notificationsEnabled },
    select: { notificationsEnabled: true },
  });

  return res.json({ preferences: user });
}

export async function teacherProfile(req: Request, res: Response) {
  const session = await getTeacherSessionFromRequest(req);
  if (!session) return res.status(401).json({ message: 'Sessão de professor inválida ou expirada.' });

  return res.json({
    teacher: {
      id: session.teacher.id,
      name: session.teacher.name,
      email: session.teacher.email,
      role: session.teacher.role,
      isActive: session.teacher.isActive,
      compactMode: session.teacher.compactMode,
      rememberFilters: session.teacher.rememberFilters,
    },
  });
}

export async function updateTeacherProfile(req: Request, res: Response) {
  const session = await getTeacherSessionFromRequest(req);
  if (!session) return res.status(401).json({ message: 'Sessão de professor inválida ou expirada.' });

  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Dados de perfil inválidos.', issues: parsed.error.flatten() });
  }

  if (parsed.data.email !== session.teacher.email) {
    const duplicate = await prisma.teacher.findUnique({ where: { email: parsed.data.email } });
    if (duplicate) return res.status(409).json({ message: 'Este e-mail já está cadastrado.' });
  }

  const teacher = await prisma.$transaction(async (tx) => {
    const updated = await tx.teacher.update({
      where: { id: session.teacherId },
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        compactMode: true,
        rememberFilters: true,
      },
    });

    if (parsed.data.email !== session.teacher.email) {
      await tx.teacherSession.deleteMany({
        where: {
          teacherId: session.teacherId,
          token: { not: session.token },
        },
      });
    }

    return updated;
  });

  return res.json({ teacher });
}

export async function changeTeacherPassword(req: Request, res: Response) {
  const session = await getTeacherSessionFromRequest(req);
  if (!session) return res.status(401).json({ message: 'Sessão de professor inválida ou expirada.' });

  const parsed = passwordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Dados de senha inválidos.', issues: parsed.error.flatten() });
  }

  const current = await prisma.teacher.findUnique({ where: { id: session.teacherId } });
  if (!current || !(await bcrypt.compare(parsed.data.currentPassword, current.passwordHash))) {
    return res.status(400).json({ message: 'A senha atual está incorreta.' });
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);

  await prisma.$transaction([
    prisma.teacher.update({
      where: { id: session.teacherId },
      data: { passwordHash },
    }),
    prisma.teacherSession.deleteMany({
      where: {
        teacherId: session.teacherId,
        token: { not: session.token },
      },
    }),
  ]);

  return res.status(204).send();
}

export async function updateTeacherPreferences(req: Request, res: Response) {
  const session = await getTeacherSessionFromRequest(req);
  if (!session) return res.status(401).json({ message: 'Sessão de professor inválida ou expirada.' });

  const parsed = teacherPreferencesSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Preferências inválidas.', issues: parsed.error.flatten() });
  }

  const preferences = await prisma.teacher.update({
    where: { id: session.teacherId },
    data: parsed.data,
    select: {
      compactMode: true,
      rememberFilters: true,
    },
  });

  return res.json({ preferences });
}
