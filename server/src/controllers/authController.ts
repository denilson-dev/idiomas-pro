import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { getSessionFromRequest } from '../lib/session.js';
import { requireClientId } from '../lib/clientIdentity.js';

const credentialsSchema = z.object({
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(6).max(100),
});

const registerSchema = credentialsSchema.extend({
  name: z.string().trim().min(2).max(80),
});

function sessionExpiry(days = 30) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export async function createAnonymousSession(req: Request, res: Response) {
  const clientId = requireClientId(req);
  if (!clientId) {
    return res.status(400).json({ message: 'Identificação segura do navegador ausente.' });
  }

  const session = await prisma.session.create({
    data: {
      token: randomUUID(),
      clientId,
      isAnonymous: true,
      expiresAt: sessionExpiry(1),
    },
  });

  res.status(201).json({
    token: session.token,
    expiresAt: session.expiresAt,
    user: null,
  });
}

export async function register(req: Request, res: Response) {
  const clientId = requireClientId(req);
  if (!clientId) {
    return res.status(400).json({ message: 'Identificação segura do navegador ausente.' });
  }

  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Dados inválidos.', issues: parsed.error.flatten() });
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return res.status(409).json({ message: 'Este e-mail já está cadastrado.' });

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
    },
  });

  const session = await prisma.session.create({
    data: {
      token: randomUUID(),
      clientId,
      userId: user.id,
      isAnonymous: false,
      expiresAt: sessionExpiry(),
    },
  });

  return res.status(201).json({
    token: session.token,
    expiresAt: session.expiresAt,
    user: { id: user.id, name: user.name, email: user.email, isActive: user.isActive },
  });
}

export async function login(req: Request, res: Response) {
  const clientId = requireClientId(req);
  if (!clientId) {
    return res.status(400).json({ message: 'Identificação segura do navegador ausente.' });
  }

  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'E-mail ou senha inválidos.' });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !user.isActive || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
  }

  const session = await prisma.session.create({
    data: {
      token: randomUUID(),
      clientId,
      userId: user.id,
      isAnonymous: false,
      expiresAt: sessionExpiry(),
    },
  });

  return res.json({
    token: session.token,
    expiresAt: session.expiresAt,
    user: { id: user.id, name: user.name, email: user.email, isActive: user.isActive },
  });
}

export async function me(req: Request, res: Response) {
  const session = await getSessionFromRequest(req);
  if (!session) return res.status(401).json({ message: 'Sessão inválida ou expirada.' });

  return res.json({
    isAnonymous: session.isAnonymous,
    expiresAt: session.expiresAt,
    user: session.user
      ? { id: session.user.id, name: session.user.name, email: session.user.email, isActive: session.user.isActive }
      : null,
  });
}

export async function logout(req: Request, res: Response) {
  const token = req.header('x-session-token');
  const clientId = requireClientId(req);

  if (token && clientId) {
    await prisma.session.deleteMany({ where: { token, clientId } });
  }

  return res.status(204).send();
}
