import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { getTeacherSessionFromRequest } from '../lib/teacherSession.js';

const credentialsSchema = z.object({
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(6).max(100),
});

const bootstrapSchema = credentialsSchema.extend({
  name: z.string().trim().min(2).max(80),
});

const updateAttemptSchema = z.object({
  studentName: z.string().trim().min(2).max(80),
  studentEmail: z.union([z.string().email(), z.literal('')]).optional(),
});

function expiry(days = 30) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function listTeachers(_req: Request, res: Response) {
  const teachers = await prisma.teacher.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });

  return res.json({ teachers });
}

export async function teacherBootstrapStatus(_req: Request, res: Response) {
  const count = await prisma.teacher.count();
  return res.json({ canCreateFirstTeacher: count === 0 });
}

export async function bootstrapTeacher(req: Request, res: Response) {
  const parsed = bootstrapSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Dados inválidos.', issues: parsed.error.flatten() });
  }

  const count = await prisma.teacher.count();
  if (count > 0) {
    return res.status(403).json({ message: 'O acesso inicial da escola já foi criado.' });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const teacher = await prisma.teacher.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
    },
  });

  const session = await prisma.teacherSession.create({
    data: {
      token: randomUUID(),
      teacherId: teacher.id,
      expiresAt: expiry(),
    },
  });

  return res.status(201).json({
    token: session.token,
    expiresAt: session.expiresAt,
    teacher: { id: teacher.id, name: teacher.name, email: teacher.email, role: teacher.role },
  });
}

export async function teacherLogin(req: Request, res: Response) {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'E-mail ou senha inválidos.' });

  const teacher = await prisma.teacher.findUnique({ where: { email: parsed.data.email } });
  if (!teacher || !teacher.isActive || !(await bcrypt.compare(parsed.data.password, teacher.passwordHash))) {
    return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
  }

  const session = await prisma.teacherSession.create({
    data: {
      token: randomUUID(),
      teacherId: teacher.id,
      expiresAt: expiry(),
    },
  });

  return res.json({
    token: session.token,
    expiresAt: session.expiresAt,
    teacher: { id: teacher.id, name: teacher.name, email: teacher.email, role: teacher.role },
  });
}

export async function teacherMe(req: Request, res: Response) {
  const session = await getTeacherSessionFromRequest(req);
  if (!session) return res.status(401).json({ message: 'Sessão de professor inválida ou expirada.' });

  return res.json({
    teacher: {
      id: session.teacher.id,
      name: session.teacher.name,
      email: session.teacher.email,
      role: session.teacher.role,
    },
    expiresAt: session.expiresAt,
  });
}

export async function teacherLogout(req: Request, res: Response) {
  const token = req.header('x-teacher-token');
  if (token) await prisma.teacherSession.deleteMany({ where: { token } });
  return res.status(204).send();
}

export async function teacherDashboard(req: Request, res: Response) {
  const session = await getTeacherSessionFromRequest(req);
  if (!session) return res.status(401).json({ message: 'Sessão de professor inválida ou expirada.' });

  const attempts = await prisma.testAttempt.findMany({
    where: { teacherId: session.teacherId, status: 'COMPLETED' },
    orderBy: { completedAt: 'desc' },
    select: {
      id: true,
      studentName: true,
      studentEmail: true,
      language: true,
      score: true,
      cefrLevel: true,
      breakdown: true,
      totalQuestions: true,
      completedAt: true,
    },
  });

  const scores = attempts.map((item) => item.score ?? 0);
  const averageScore = scores.length ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length) : 0;
  const uniqueStudents = new Set(
    attempts.map((item) => (item.studentEmail || item.studentName || '').trim().toLowerCase()).filter(Boolean),
  ).size;

  const levelDistribution = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => ({
    level,
    count: attempts.filter((item) => item.cefrLevel === level).length,
  }));

  return res.json({
    teacher: { id: session.teacher.id, name: session.teacher.name, email: session.teacher.email, role: session.teacher.role },
    metrics: {
      totalAssessments: attempts.length,
      uniqueStudents,
      averageScore,
      latestLevel: attempts[0]?.cefrLevel ?? null,
    },
    levelDistribution,
    attempts,
  });
}

export async function teacherAttemptDetail(req: Request, res: Response) {
  const session = await getTeacherSessionFromRequest(req);
  if (!session) return res.status(401).json({ message: 'Sessão de professor inválida ou expirada.' });

  const attemptId = firstParam(req.params.attemptId);
  if (!attemptId) return res.status(400).json({ message: 'Identificador inválido.' });

  const attempt = await prisma.testAttempt.findFirst({
    where: { id: attemptId, teacherId: session.teacherId, status: 'COMPLETED' },
    include: {
      answers: {
        include: {
          question: {
            select: {
              prompt: true,
              correctAnswer: true,
              category: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!attempt) return res.status(404).json({ message: 'Resultado do aluno não encontrado.' });

  return res.json({
    id: attempt.id,
    studentName: attempt.studentName,
    studentEmail: attempt.studentEmail,
    language: attempt.language,
    score: attempt.score,
    cefrLevel: attempt.cefrLevel,
    breakdown: attempt.breakdown,
    totalQuestions: attempt.totalQuestions,
    completedAt: attempt.completedAt,
    answers: attempt.answers.map((answer) => ({
      question: answer.question.prompt,
      category: answer.category,
      selectedAnswer: answer.selectedAnswer,
      correctAnswer: answer.question.correctAnswer,
      isCorrect: answer.isCorrect,
    })),
  });
}


export async function updateTeacherAttempt(req: Request, res: Response) {
  const session = await getTeacherSessionFromRequest(req);
  if (!session) return res.status(401).json({ message: 'Sessão de professor inválida ou expirada.' });

  const attemptId = firstParam(req.params.attemptId);
  if (!attemptId) return res.status(400).json({ message: 'Identificador inválido.' });

  const parsed = updateAttemptSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Dados do aluno inválidos.', issues: parsed.error.flatten() });
  }

  const attempt = await prisma.testAttempt.findFirst({
    where: { id: attemptId, teacherId: session.teacherId, status: 'COMPLETED' },
    select: { id: true },
  });

  if (!attempt) return res.status(404).json({ message: 'Prova não encontrada.' });

  const updated = await prisma.testAttempt.update({
    where: { id: attempt.id },
    data: {
      studentName: parsed.data.studentName,
      studentEmail: parsed.data.studentEmail?.trim().toLowerCase() || null,
    },
    select: {
      id: true,
      studentName: true,
      studentEmail: true,
      language: true,
      score: true,
      cefrLevel: true,
      breakdown: true,
      totalQuestions: true,
      completedAt: true,
    },
  });

  return res.json({ attempt: updated });
}

export async function deleteTeacherAttempt(req: Request, res: Response) {
  const session = await getTeacherSessionFromRequest(req);
  if (!session) return res.status(401).json({ message: 'Sessão de professor inválida ou expirada.' });

  const attemptId = firstParam(req.params.attemptId);
  if (!attemptId) return res.status(400).json({ message: 'Identificador inválido.' });

  const attempt = await prisma.testAttempt.findFirst({
    where: { id: attemptId, teacherId: session.teacherId, status: 'COMPLETED' },
    select: { id: true },
  });

  if (!attempt) return res.status(404).json({ message: 'Prova não encontrada.' });

  await prisma.testAttempt.delete({ where: { id: attempt.id } });
  return res.status(204).send();
}

export async function clearTeacherAttempts(req: Request, res: Response) {
  const session = await getTeacherSessionFromRequest(req);
  if (!session) return res.status(401).json({ message: 'Sessão de professor inválida ou expirada.' });

  const result = await prisma.testAttempt.deleteMany({
    where: {
      teacherId: session.teacherId,
      status: 'COMPLETED',
    },
  });

  return res.json({
    deleted: result.count,
    message: result.count === 1
      ? '1 prova foi removida.'
      : `${result.count} provas foram removidas.`,
  });
}
