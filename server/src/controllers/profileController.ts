import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { getSessionFromRequest } from '../lib/session.js';
import { getTeacherSessionFromRequest } from '../lib/teacherSession.js';

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6).max(100),
  newPassword: z.string().min(8).max(100),
});

const preferencesSchema = z.object({
  notifications: z.boolean().optional(),
  compactTables: z.boolean().optional(),
  rememberFilters: z.boolean().optional(),
  reducedMotion: z.boolean().optional(),
  preferredTheme: z.enum(['system', 'light']).optional(),
}).strict();

export async function updateStudentProfile(req: Request, res: Response) {
  const session = await getSessionFromRequest(req);
  if (!session?.user) return res.status(401).json({ message: 'Sessão de aluno inválida ou expirada.' });

  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Dados inválidos.', issues: parsed.error.flatten() });
  }

  if (parsed.data.email !== session.user.email) {
    const duplicate = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (duplicate) return res.status(409).json({ message: 'Este e-mail já está em uso.' });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
    select: { id: true, name: true, email: true, isActive: true, preferences: true },
  });

  return res.json({ user });
}

export async function updateStudentPassword(req: Request, res: Response) {
  const session = await getSessionFromRequest(req);
  if (!session?.user) return res.status(401).json({ message: 'Sessão de aluno inválida ou expirada.' });

  const parsed = passwordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Dados de senha inválidos.' });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !(await bcrypt.compare(parsed.data.currentPassword, user.passwordHash))) {
    return res.status(401).json({ message: 'Senha atual incorreta.' });
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.session.deleteMany({
      where: { userId: user.id, token: { not: session.token } },
    }),
  ]);

  return res.status(204).send();
}

export async function studentPreferences(req: Request, res: Response) {
  const session = await getSessionFromRequest(req);
  if (!session?.user) return res.status(401).json({ message: 'Sessão de aluno inválida ou expirada.' });

  if (req.method === 'GET') {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferences: true },
    });
    return res.json({ preferences: user?.preferences ?? {} });
  }

  const parsed = preferencesSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Preferências inválidas.' });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { preferences: true },
  });

  const current =
    user?.preferences && typeof user.preferences === 'object' && !Array.isArray(user.preferences)
      ? user.preferences
      : {};

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { preferences: { ...current, ...parsed.data } },
    select: { preferences: true },
  });

  return res.json({ preferences: updated.preferences });
}

export async function updateTeacherProfile(req: Request, res: Response) {
  const session = await getTeacherSessionFromRequest(req);
  if (!session) return res.status(401).json({ message: 'Sessão de professor inválida ou expirada.' });

  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Dados inválidos.', issues: parsed.error.flatten() });
  }

  if (parsed.data.email !== session.teacher.email) {
    const duplicate = await prisma.teacher.findUnique({ where: { email: parsed.data.email } });
    if (duplicate) return res.status(409).json({ message: 'Este e-mail já está em uso.' });
  }

  const teacher = await prisma.teacher.update({
    where: { id: session.teacher.id },
    data: parsed.data,
    select: { id: true, name: true, email: true, role: true, isActive: true, preferences: true },
  });

  return res.json({ teacher });
}

export async function updateTeacherPassword(req: Request, res: Response) {
  const session = await getTeacherSessionFromRequest(req);
  if (!session) return res.status(401).json({ message: 'Sessão de professor inválida ou expirada.' });

  const parsed = passwordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Dados de senha inválidos.' });

  const teacher = await prisma.teacher.findUnique({ where: { id: session.teacher.id } });
  if (!teacher || !(await bcrypt.compare(parsed.data.currentPassword, teacher.passwordHash))) {
    return res.status(401).json({ message: 'Senha atual incorreta.' });
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.$transaction([
    prisma.teacher.update({ where: { id: teacher.id }, data: { passwordHash } }),
    prisma.teacherSession.deleteMany({
      where: { teacherId: teacher.id, token: { not: session.token } },
    }),
  ]);

  return res.status(204).send();
}

export async function teacherPreferences(req: Request, res: Response) {
  const session = await getTeacherSessionFromRequest(req);
  if (!session) return res.status(401).json({ message: 'Sessão de professor inválida ou expirada.' });

  if (req.method === 'GET') {
    const teacher = await prisma.teacher.findUnique({
      where: { id: session.teacher.id },
      select: { preferences: true },
    });
    return res.json({ preferences: teacher?.preferences ?? {} });
  }

  const parsed = preferencesSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Preferências inválidas.' });

  const teacher = await prisma.teacher.findUnique({
    where: { id: session.teacher.id },
    select: { preferences: true },
  });

  const current =
    teacher?.preferences && typeof teacher.preferences === 'object' && !Array.isArray(teacher.preferences)
      ? teacher.preferences
      : {};

  const updated = await prisma.teacher.update({
    where: { id: session.teacher.id },
    data: { preferences: { ...current, ...parsed.data } },
    select: { preferences: true },
  });

  return res.json({ preferences: updated.preferences });
}
