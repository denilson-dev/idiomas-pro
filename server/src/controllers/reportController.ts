import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { getTeacherSessionFromRequest } from '../lib/teacherSession.js';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
const CATEGORIES = ['GRAMMAR', 'VOCABULARY', 'LISTENING'] as const;

type Breakdown = Array<{
  category: 'GRAMMAR' | 'VOCABULARY' | 'LISTENING';
  label: string;
  correct: number;
  total: number;
  percentage: number;
}>;

function csv(value: unknown) {
  const text = String(value ?? '');
  return '"' + text.replaceAll('"', '""') + '"';
}

function scopeWhere(session: Awaited<ReturnType<typeof getTeacherSessionFromRequest>>) {
  if (!session) return { status: 'COMPLETED' as const };
  return session.teacher.role === 'ADMIN'
    ? { status: 'COMPLETED' as const }
    : { status: 'COMPLETED' as const, teacherId: session.teacherId };
}

export async function teacherReports(req: Request, res: Response) {
  const session = await getTeacherSessionFromRequest(req);
  if (!session) return res.status(401).json({ message: 'Sessão de professor inválida ou expirada.' });

  const attempts = await prisma.testAttempt.findMany({
    where: scopeWhere(session),
    orderBy: { completedAt: 'asc' },
    select: {
      id: true,
      studentName: true,
      studentEmail: true,
      score: true,
      cefrLevel: true,
      breakdown: true,
      completedAt: true,
      teacher: { select: { id: true, name: true } },
    },
  });

  const scores = attempts.map((item) => item.score ?? 0);
  const averageScore = scores.length
    ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length)
    : 0;

  const uniqueStudents = new Set(
    attempts
      .map((item) => (item.studentEmail || item.studentName || '').trim().toLowerCase())
      .filter(Boolean),
  ).size;

  const levelDistribution = LEVELS.map((level) => ({
    level,
    count: attempts.filter((item) => item.cefrLevel === level).length,
  }));

  const categoryAverages = CATEGORIES.map((category) => {
    const values = attempts
      .flatMap((item) => ((item.breakdown as Breakdown | null) ?? []))
      .filter((item) => item.category === category)
      .map((item) => item.percentage);

    return {
      category,
      average: values.length
        ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
        : 0,
    };
  });

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));
    return {
      key: date.toISOString().slice(0, 7),
      label: date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
    };
  });

  const trend = months.map(({ key, label }) => {
    const monthAttempts = attempts.filter((item) => item.completedAt?.toISOString().startsWith(key));
    const monthScores = monthAttempts.map((item) => item.score ?? 0);
    return {
      key,
      label,
      assessments: monthAttempts.length,
      averageScore: monthScores.length
        ? Math.round(monthScores.reduce((sum, value) => sum + value, 0) / monthScores.length)
        : 0,
    };
  });

  return res.json({
    scope: session.teacher.role === 'ADMIN' ? 'ALL' : 'TEACHER',
    metrics: {
      totalAssessments: attempts.length,
      uniqueStudents,
      averageScore,
      completionRate: 100,
    },
    levelDistribution,
    categoryAverages,
    trend,
  });
}

export async function exportTeacherCsv(req: Request, res: Response) {
  const session = await getTeacherSessionFromRequest(req);
  if (!session) return res.status(401).json({ message: 'Sessão de professor inválida ou expirada.' });

  const attempts = await prisma.testAttempt.findMany({
    where: scopeWhere(session),
    orderBy: { completedAt: 'desc' },
    select: {
      studentName: true,
      studentEmail: true,
      language: true,
      score: true,
      cefrLevel: true,
      completedAt: true,
      teacher: { select: { name: true } },
    },
  });

  const rows = [
    ['Aluno', 'E-mail', 'Professor', 'Idioma', 'Nível', 'Nota', 'Concluída em'],
    ...attempts.map((item) => [
      item.studentName ?? '',
      item.studentEmail ?? '',
      item.teacher?.name ?? '',
      item.language,
      item.cefrLevel ?? '',
      item.score ?? '',
      item.completedAt?.toISOString() ?? '',
    ]),
  ];

  const body = '\uFEFF' + rows.map((row) => row.map(csv).join(';')).join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="idiomas-pro-${session.teacher.role === 'ADMIN' ? 'admin' : 'professor'}-${new Date().toISOString().slice(0, 10)}.csv"`,
  );
  return res.send(body);
}
