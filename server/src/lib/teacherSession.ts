import type { Request } from 'express';
import { prisma } from './prisma.js';

export async function getTeacherSessionFromRequest(req: Request) {
  const token = req.header('x-teacher-token');
  if (!token) return null;

  const session = await prisma.teacherSession.findUnique({
    where: { token },
    include: { teacher: true },
  });

  if (!session || session.expiresAt < new Date() || !session.teacher.isActive) return null;
  return session;
}
