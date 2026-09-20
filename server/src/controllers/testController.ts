import type { Request, Response } from 'express';
import { z } from 'zod';
import type { Prisma } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import { getSessionFromRequest } from '../lib/session.js';
import { calculatePlacement, getRecommendations } from '../services/placementEngine.js';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

type PublicQuestion = {
  id: string;
  prompt: string;
  options: string[];
  category: string;
  mediaType: string | null;
  mediaUrl: string | null;
};

const startSchema = z.object({
  count: z.number().int().min(15).max(20).default(18),
  studentName: z.string().trim().min(2).max(80),
  studentEmail: z.union([z.string().email(), z.literal('')]).optional(),
  teacherId: z.string().uuid(),
  language: z.enum(['ES']).default('ES'),
});

const submitSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().uuid(),
    selectedAnswer: z.string().min(1),
  })).min(1),
});

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function pickMixedQuestions<T extends { id: string; level: string; category: string }>(questions: T[], count: number) {
  const wanted = Math.max(15, Math.min(20, count));
  const selected: T[] = [];
  const used = new Set<string>();

  const listening = shuffle(questions.filter((q) => q.category === 'LISTENING'))[0];
  if (listening) {
    selected.push(listening);
    used.add(listening.id);
  }

  const buckets = Object.fromEntries(
    LEVELS.map((level) => [level, shuffle(questions.filter((q) => q.level === level && !used.has(q.id)))])
  ) as Record<(typeof LEVELS)[number], T[]>;

  let cursor = 0;
  while (selected.length < wanted) {
    const level = LEVELS[cursor % LEVELS.length];
    const bucket = buckets[level];
    const next = bucket.shift();
    if (next && !used.has(next.id)) {
      selected.push(next);
      used.add(next.id);
    }

    cursor += 1;
    if (cursor > wanted * LEVELS.length * 3) break;
  }

  if (selected.length < wanted) {
    const remainder = shuffle(questions.filter((q) => !used.has(q.id)));
    for (const question of remainder) {
      selected.push(question);
      used.add(question.id);
      if (selected.length >= wanted) break;
    }
  }

  return shuffle(selected).slice(0, wanted);
}

export async function startTest(req: Request, res: Response) {
  const session = await getSessionFromRequest(req);
  if (!session) return res.status(401).json({ message: 'Sessão inválida ou expirada.' });

  const parsed = startSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: 'Preencha seu nome e selecione um professor antes de iniciar.',
      issues: parsed.error.flatten(),
    });
  }

  const teacher = await prisma.teacher.findFirst({
    where: { id: parsed.data.teacherId, isActive: true },
    select: { id: true, name: true },
  });

  if (!teacher) return res.status(400).json({ message: 'Professor selecionado não está disponível.' });

  const questions = await prisma.question.findMany({ where: { isActive: true } });
  if (questions.length < 15) {
    return res.status(503).json({ message: 'Banco de questões insuficiente. Execute o seed.' });
  }

  const picked = pickMixedQuestions(questions, parsed.data.count);
  const attempt = await prisma.testAttempt.create({
    data: {
      sessionId: session.id,
      userId: session.userId,
      teacherId: teacher.id,
      studentName: parsed.data.studentName,
      studentEmail: parsed.data.studentEmail?.trim().toLowerCase() || session.user?.email || null,
      language: parsed.data.language,
      totalQuestions: picked.length,
      questionIds: picked.map((question) => question.id),
    },
  });

  const publicQuestions: PublicQuestion[] = picked.map((question) => ({
    id: question.id,
    prompt: question.prompt,
    options: question.options as string[],
    category: question.category,
    mediaType: question.mediaType,
    mediaUrl: question.category === 'LISTENING' ? `/api/tts/${question.id}` : question.mediaUrl,
  }));

  return res.status(201).json({
    attemptId: attempt.id,
    totalQuestions: picked.length,
    studentName: attempt.studentName,
    teacher,
    questions: publicQuestions,
  });
}

export async function submitTest(req: Request, res: Response) {
  const session = await getSessionFromRequest(req);
  if (!session) return res.status(401).json({ message: 'Sessão inválida ou expirada.' });

  const attemptId = firstParam(req.params.attemptId);
  if (!attemptId) return res.status(400).json({ message: 'Identificador da tentativa inválido.' });

  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Respostas inválidas.', issues: parsed.error.flatten() });

  const attempt = await prisma.testAttempt.findFirst({
    where: { id: attemptId, sessionId: session.id },
  });

  if (!attempt) return res.status(404).json({ message: 'Tentativa não encontrada.' });
  if (attempt.status === 'COMPLETED') return res.status(409).json({ message: 'Este teste já foi finalizado.' });

  const uniqueAnswers = Array.from(new Map(parsed.data.answers.map((a) => [a.questionId, a])).values());
  const questionIds = uniqueAnswers.map((answer) => answer.questionId);
  const expectedQuestionIds = attempt.questionIds as string[];
  const expectedSet = new Set(expectedQuestionIds);
  const matchesAttempt = questionIds.length === expectedQuestionIds.length && questionIds.every((id) => expectedSet.has(id));

  if (!matchesAttempt) {
    return res.status(400).json({ message: `Envie exatamente as ${attempt.totalQuestions} questões desta tentativa.` });
  }

  const questions = await prisma.question.findMany({ where: { id: { in: questionIds } } });
  if (questions.length !== uniqueAnswers.length) {
    return res.status(400).json({ message: 'Uma ou mais questões não são válidas.' });
  }

  const questionMap = new Map(questions.map((question) => [question.id, question]));
  const scored = uniqueAnswers.map((answer) => {
    const question = questionMap.get(answer.questionId)!;
    return {
      questionId: question.id,
      selectedAnswer: answer.selectedAnswer,
      isCorrect: answer.selectedAnswer === question.correctAnswer,
      category: question.category,
      questionLevel: question.level,
    };
  });

  const result = calculatePlacement(scored.map(({ category, isCorrect }) => ({ category, isCorrect })));

  await prisma.$transaction([
    prisma.attemptAnswer.createMany({
      data: scored.map((answer) => ({
        attemptId: attempt.id,
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect: answer.isCorrect,
        category: answer.category,
        questionLevel: answer.questionLevel,
      })),
    }),
    prisma.testAttempt.update({
      where: { id: attempt.id },
      data: {
        status: 'COMPLETED',
        score: result.score,
        cefrLevel: result.cefrLevel,
        breakdown: result.breakdown as unknown as Prisma.InputJsonValue,
        completedAt: new Date(),
      },
    }),
  ]);

  return res.json({
    attemptId: attempt.id,
    studentName: attempt.studentName,
    teacherId: attempt.teacherId,
    ...result,
    recommendations: getRecommendations(result.cefrLevel),
  });
}
