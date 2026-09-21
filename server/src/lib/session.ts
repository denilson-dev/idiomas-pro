import type { Request } from 'express';
import { prisma } from './prisma.js';
import { getClientIdFromRequest } from './clientIdentity.js';

export async function getSessionFromRequest(req: Request) {
  const token = req.header('x-session-token');
  const clientId = getClientIdFromRequest(req);

  if (!token || !clientId) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) return null;
  if (session.user && !session.user.isActive) return null;

  const clientMatches =
    session.clientId === clientId ||
    (process.env.NODE_ENV === 'test' && session.clientId === null);

  if (!clientMatches) return null;

  return session;
}
