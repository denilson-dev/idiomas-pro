import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { getSessionFromRequest } from '../lib/session.js';
import { getRecommendations, type CefrLevel } from '../services/placementEngine.js';

export async function getResult(req: Request, res: Response) {
  const session = await getSessionFromRequest(req);
  if (!session) return res.status(401).json({ message: 'Sessão inválida ou expirada.' });

  const attempt = await prisma.testAttempt.findFirst({
    where: {
      id: req.params.attemptId,
      ...(session.userId ? { userId: session.userId } : { sessionId: session.id }),
      status: 'COMPLETED',
    },
    select: {
      id: true,
      score: true,
      cefrLevel: true,
      breakdown: true,
      totalQuestions: true,
      completedAt: true,
    },
  });

  if (!attempt || !attempt.cefrLevel) return res.status(404).json({ message: 'Resultado não encontrado.' });

  return res.json({
    ...attempt,
    recommendations: getRecommendations(attempt.cefrLevel as CefrLevel),
  });
}

export async function getHistory(req: Request, res: Response) {
  const session = await getSessionFromRequest(req);
  if (!session) return res.status(401).json({ message: 'Sessão inválida ou expirada.' });

  const attempts = await prisma.testAttempt.findMany({
    where: {
      status: 'COMPLETED',
      ...(session.userId ? { userId: session.userId } : { sessionId: session.id }),
    },
    orderBy: { completedAt: 'desc' },
    select: {
      id: true,
      score: true,
      cefrLevel: true,
      breakdown: true,
      totalQuestions: true,
      completedAt: true,
    },
  });

  return res.json({ attempts });
}
