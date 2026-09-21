import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { getTeacherSessionFromRequest } from '../lib/teacherSession.js';

const email = z.string().email().transform((value) => value.trim().toLowerCase());
const password = z.string().min(8).max(100);

const createUserSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email,
  password,
  isActive: z.boolean().optional().default(true),
});

const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: email.optional(),
  password: password.optional(),
  isActive: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0, 'Informe ao menos um campo.');

const createTeacherSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email,
  password,
  isActive: z.boolean().optional().default(true),
});

const updateTeacherSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: email.optional(),
  password: password.optional(),
  isActive: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0, 'Informe ao menos um campo.');

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function requireAdmin(req: Request, res: Response) {
  const session = await getTeacherSessionFromRequest(req);

  if (!session) {
    res.status(401).json({ message: 'Sessão de professor inválida ou expirada.' });
    return null;
  }

  if (session.teacher.role !== 'ADMIN') {
    res.status(403).json({ message: 'Acesso restrito ao administrador.' });
    return null;
  }

  return session;
}

export async function adminAccounts(req: Request, res: Response) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  const [users, teachers] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { attempts: true } },
      },
    }),
    prisma.teacher.findMany({
      orderBy: [{ role: 'desc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { attempts: true } },
      },
    }),
  ]);

  return res.json({
    currentAdminId: session.teacherId,
    summary: {
      students: users.length,
      activeStudents: users.filter((item) => item.isActive).length,
      teachers: teachers.filter((item) => item.role === 'TEACHER').length,
      activeTeachers: teachers.filter((item) => item.role === 'TEACHER' && item.isActive).length,
      administrators: teachers.filter((item) => item.role === 'ADMIN').length,
    },
    users: users.map(({ _count, ...item }) => ({
      ...item,
      assessmentCount: _count.attempts,
    })),
    teachers: teachers.map(({ _count, ...item }) => ({
      ...item,
      assessmentCount: _count.attempts,
    })),
  });
}

export async function adminCreateUser(req: Request, res: Response) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Dados do aluno inválidos.', issues: parsed.error.flatten() });
  }

  if (await prisma.user.findUnique({ where: { email: parsed.data.email } })) {
    return res.status(409).json({ message: 'Já existe um aluno com este e-mail.' });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      isActive: parsed.data.isActive,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res.status(201).json({ user: { ...user, assessmentCount: 0 } });
}

export async function adminUpdateUser(req: Request, res: Response) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  const userId = firstParam(req.params.userId);
  if (!userId) return res.status(400).json({ message: 'Identificador inválido.' });

  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Dados do aluno inválidos.', issues: parsed.error.flatten() });
  }

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) return res.status(404).json({ message: 'Aluno não encontrado.' });

  if (parsed.data.email && parsed.data.email !== existing.email) {
    const duplicate = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (duplicate) return res.status(409).json({ message: 'Já existe um aluno com este e-mail.' });
  }

  const data: {
    name?: string;
    email?: string;
    passwordHash?: string;
    isActive?: boolean;
  } = {};

  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.email !== undefined) data.email = parsed.data.email;
  if (parsed.data.password !== undefined) data.passwordHash = await bcrypt.hash(parsed.data.password, 12);
  if (parsed.data.isActive !== undefined) data.isActive = parsed.data.isActive;

  const shouldRevokeSessions =
    parsed.data.password !== undefined ||
    parsed.data.email !== undefined ||
    parsed.data.isActive === false;

  const user = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (shouldRevokeSessions) {
      await tx.session.deleteMany({ where: { userId } });
    }

    return updated;
  });

  const assessmentCount = await prisma.testAttempt.count({ where: { userId } });
  return res.json({ user: { ...user, assessmentCount } });
}

export async function adminDeleteUser(req: Request, res: Response) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  const userId = firstParam(req.params.userId);
  if (!userId) return res.status(400).json({ message: 'Identificador inválido.' });

  const existing = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!existing) return res.status(404).json({ message: 'Aluno não encontrado.' });

  await prisma.user.delete({ where: { id: userId } });
  return res.status(204).send();
}

export async function adminCreateTeacher(req: Request, res: Response) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  const parsed = createTeacherSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Dados do professor inválidos.', issues: parsed.error.flatten() });
  }

  if (await prisma.teacher.findUnique({ where: { email: parsed.data.email } })) {
    return res.status(409).json({ message: 'Já existe um professor com este e-mail.' });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const teacher = await prisma.teacher.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: 'TEACHER',
      isActive: parsed.data.isActive,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res.status(201).json({ teacher: { ...teacher, assessmentCount: 0 } });
}

export async function adminUpdateTeacher(req: Request, res: Response) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  const teacherId = firstParam(req.params.teacherId);
  if (!teacherId) return res.status(400).json({ message: 'Identificador inválido.' });

  const parsed = updateTeacherSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Dados do professor inválidos.', issues: parsed.error.flatten() });
  }

  const existing = await prisma.teacher.findUnique({ where: { id: teacherId } });
  if (!existing) return res.status(404).json({ message: 'Professor não encontrado.' });

  if (existing.role === 'ADMIN' && teacherId === session.teacherId && parsed.data.isActive === false) {
    return res.status(400).json({ message: 'O administrador não pode desativar a própria conta.' });
  }

  if (parsed.data.email && parsed.data.email !== existing.email) {
    const duplicate = await prisma.teacher.findUnique({ where: { email: parsed.data.email } });
    if (duplicate) return res.status(409).json({ message: 'Já existe um professor com este e-mail.' });
  }

  const data: {
    name?: string;
    email?: string;
    passwordHash?: string;
    isActive?: boolean;
  } = {};

  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.email !== undefined) data.email = parsed.data.email;
  if (parsed.data.password !== undefined) data.passwordHash = await bcrypt.hash(parsed.data.password, 12);
  if (parsed.data.isActive !== undefined) data.isActive = parsed.data.isActive;

  const shouldRevokeOtherSessions =
    parsed.data.password !== undefined ||
    parsed.data.email !== undefined ||
    parsed.data.isActive === false;

  const teacher = await prisma.$transaction(async (tx) => {
    const updated = await tx.teacher.update({
      where: { id: teacherId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (shouldRevokeOtherSessions) {
      await tx.teacherSession.deleteMany({
        where: {
          teacherId,
          ...(teacherId === session.teacherId ? { token: { not: session.token } } : {}),
        },
      });
    }

    return updated;
  });

  const assessmentCount = await prisma.testAttempt.count({ where: { teacherId } });
  return res.json({ teacher: { ...teacher, assessmentCount } });
}

export async function adminDeleteTeacher(req: Request, res: Response) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  const teacherId = firstParam(req.params.teacherId);
  if (!teacherId) return res.status(400).json({ message: 'Identificador inválido.' });

  if (teacherId === session.teacherId) {
    return res.status(400).json({ message: 'O administrador não pode remover a própria conta.' });
  }

  const existing = await prisma.teacher.findUnique({
    where: { id: teacherId },
    select: { id: true },
  });

  if (!existing) return res.status(404).json({ message: 'Professor não encontrado.' });

  await prisma.teacher.delete({ where: { id: teacherId } });
  return res.status(204).send();
}
