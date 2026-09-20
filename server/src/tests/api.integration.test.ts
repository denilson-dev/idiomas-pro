import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { prisma } from '../lib/prisma.js';

describe.sequential('API integration', () => {
  let studentToken = '';
  let teacherToken = '';
  let teacherId = '';
  let attemptId = '';
  let questions: Array<{
    id: string;
    options: string[];
    category: string;
    level?: string;
    correctAnswer?: string;
  }> = [];

  const teacherEmail = 'teacher.integration@example.com';
  const teacherSecret = randomUUID();

  beforeAll(async () => {
    await prisma.attemptAnswer.deleteMany();
    await prisma.testAttempt.deleteMany();
    await prisma.teacherSession.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.session.deleteMany();

    if (await prisma.question.count() < 15) {
      throw new Error('Banco de teste sem questões. Execute npm run db:seed antes dos testes de API.');
    }
  });

  afterAll(async () => {
    await prisma.attemptAnswer.deleteMany();
    await prisma.testAttempt.deleteMany();
    await prisma.teacherSession.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.session.deleteMany();
    await prisma.$disconnect();
  });

  it('responde ao healthcheck', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('cria uma sessão de visitante', async () => {
    const response = await request(app).post('/api/auth/anonymous');

    expect(response.status).toBe(201);
    expect(response.body.token).toEqual(expect.any(String));
    studentToken = response.body.token;
  });

  it('cria o primeiro professor e o torna selecionável', async () => {
    const bootstrap = await request(app)
      .post('/api/teacher/auth/bootstrap')
      .send({
        name: 'Prof. Integração',
        email: teacherEmail,
        password: teacherSecret,
      });

    expect(bootstrap.status).toBe(201);
    teacherToken = bootstrap.body.token;
    teacherId = bootstrap.body.teacher.id;

    const list = await request(app).get('/api/teachers');

    expect(list.status).toBe(200);
    expect(list.body.teachers).toContainEqual({
      id: teacherId,
      name: 'Prof. Integração',
    });
  });

  it('bloqueia o início do teste sem professor', async () => {
    const response = await request(app)
      .post('/api/test/start')
      .set('x-session-token', studentToken)
      .send({
        count: 15,
        studentName: 'Aluno Integração',
        studentEmail: 'aluno.integration@example.com',
        language: 'ES',
      });

    expect(response.status).toBe(400);
  });

  it('inicia teste sem expor nível nem resposta correta', async () => {
    const response = await request(app)
      .post('/api/test/start')
      .set('x-session-token', studentToken)
      .send({
        count: 15,
        studentName: 'Aluno Integração',
        studentEmail: 'aluno.integration@example.com',
        teacherId,
        language: 'ES',
      });

    expect(response.status).toBe(201);
    expect(response.body.totalQuestions).toBe(15);
    expect(response.body.teacher).toEqual({
      id: teacherId,
      name: 'Prof. Integração',
    });

    attemptId = response.body.attemptId;
    questions = response.body.questions;

    expect(questions).toHaveLength(15);
    expect(questions.some((question) => question.category === 'LISTENING')).toBe(true);

    for (const question of questions) {
      expect(question).not.toHaveProperty('level');
      expect(question).not.toHaveProperty('correctAnswer');
      expect(question.options.length).toBeGreaterThan(1);
    }
  });

  it('finaliza o teste e registra o aluno no painel do professor', async () => {
    const response = await request(app)
      .post(`/api/test/${attemptId}/submit`)
      .set('x-session-token', studentToken)
      .send({
        answers: questions.map((question) => ({
          questionId: question.id,
          selectedAnswer: question.options[0],
        })),
      });

    expect(response.status).toBe(200);
    expect(response.body.score).toBeGreaterThanOrEqual(0);
    expect(response.body.score).toBeLessThanOrEqual(100);
    expect(response.body.cefrLevel).toMatch(/^(A1|A2|B1|B2|C1|C2)$/);
    expect(response.body.breakdown).toHaveLength(3);

    const dashboard = await request(app)
      .get('/api/teacher/dashboard')
      .set('x-teacher-token', teacherToken);

    expect(dashboard.status).toBe(200);
    expect(dashboard.body.metrics.totalAssessments).toBe(1);
    expect(dashboard.body.attempts[0]).toEqual(
      expect.objectContaining({
        id: attemptId,
        studentName: 'Aluno Integração',
        studentEmail: 'aluno.integration@example.com',
      }),
    );
  });

  it('isola resultados entre professores', async () => {
    const otherTeacher = await prisma.teacher.create({
      data: {
        name: 'Prof. Isolado',
        email: 'teacher.isolated@example.com',
        passwordHash: randomUUID(),
      },
    });

    const otherSession = await prisma.teacherSession.create({
      data: {
        token: randomUUID(),
        teacherId: otherTeacher.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const response = await request(app)
      .get(`/api/teacher/attempts/${attemptId}`)
      .set('x-teacher-token', otherSession.token);

    expect(response.status).toBe(404);
  });
});
