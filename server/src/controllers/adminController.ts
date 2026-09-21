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
});

const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: email.optional(),
  password: password.optional(),
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
        createdAt: true,
        updatedAt: true,
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
      },
    }),
  ]);

  return res.json({
    currentAdminId: session.teacherId,
    users,
    teachers,
  });
}

export async function adminCreateUser(req: Request, res: Response) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Dados do usuário inválidos.', issues: parsed.error.flatten() });
  }

  if (await prisma.user.findUnique({ where: { email: parsed.data.email } })) {
    return res.status(409).json({ message: 'Já existe um usuário com este e-mail.' });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
    },
    select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
  });

  return res.status(201).json({ user });
}

export async function adminUpdateUser(req: Request, res: Response) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  const userId = firstParam(req.params.userId);
  if (!userId) return res.status(400).json({ message: 'Identificador inválido.' });

  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Dados do usuário inválidos.', issues: parsed.error.flatten() });
  }

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) return res.status(404).json({ message: 'Usuário não encontrado.' });

  if (parsed.data.email && parsed.data.email !== existing.email) {
    const duplicate = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (duplicate) return res.status(409).json({ message: 'Já existe um usuário com este e-mail.' });
  }

  const data: { name?: string; email?: string; passwordHash?: string } = {};
  if (parsed.data.name) data.name = parsed.data.name;
  if (parsed.data.email) data.email = parsed.data.email;
  if (parsed.data.password) data.passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
  });

  return res.json({ user });
}

export async function adminDeleteUser(req: Request, res: Response) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  const userId = firstParam(req.params.userId);
  if (!userId) return res.status(400).json({ message: 'Identificador inválido.' });

  const existing = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!existing) return res.status(404).json({ message: 'Usuário não encontrado.' });

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

  return res.status(201).json({ teacher });
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

  if (existing.role === 'ADMIN' && parsed.data.isActive === false) {
    return res.status(400).json({ message: 'A conta administrativa não pode ser desativada.' });
  }

  if (parsed.data.email && parsed.data.email !== existing.email) {
    const duplicate = await prisma.teacher.findUnique({ where: { email: parsed.data.email } });
    if (duplicate) return res.status(409).json({ message: 'Já existe um professor com este e-mail.' });
  }

  const data: { name?: string; email?: string; passwordHash?: string; isActive?: boolean } = {};
  if (parsed.data.name) data.name = parsed.data.name;
  if (parsed.data.email) data.email = parsed.data.email;
  if (parsed.data.password) data.passwordHash = await bcrypt.hash(parsed.data.password, 12);
  if (parsed.data.isActive !== undefined) data.isActive = parsed.data.isActive;

  const teacher = await prisma.teacher.update({
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

  return res.json({ teacher });
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
    select: { id: true, role: true },
  });

  if (!existing) return res.status(404).json({ message: 'Professor não encontrado.' });
  if (existing.role === 'ADMIN') {
    return res.status(400).json({ message: 'Uma conta administrativa não pode ser removida por esta tela.' });
  }

  await prisma.teacher.delete({ where: { id: teacherId } });
  return res.status(204).send();
}
