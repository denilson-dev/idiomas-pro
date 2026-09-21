import type { Request } from 'express';
import { prisma } from './prisma.js';

export async function getSessionFromRequest(req: Request) {
  const token = req.header('x-session-token');
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) return null;
  if (session.user && !session.user.isActive) return null;
  return session;
}
