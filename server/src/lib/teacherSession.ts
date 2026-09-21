import type { Request } from 'express';
import { prisma } from './prisma.js';
import { getClientIdFromRequest } from './clientIdentity.js';

export async function getTeacherSessionFromRequest(req: Request) {
  const token = req.header('x-teacher-token');
  const clientId = getClientIdFromRequest(req);

  if (!token || !clientId) return null;

  const session = await prisma.teacherSession.findUnique({
    where: { token },
    include: { teacher: true },
  });

  if (!session || session.expiresAt < new Date() || !session.teacher.isActive) return null;

  const clientMatches =
    session.clientId === clientId ||
    (process.env.NODE_ENV === 'test' && session.clientId === null);

  if (!clientMatches) return null;

  return session;
}
