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

  it('permite editar apenas os dados administrativos da prova', async () => {
    const response = await request(app)
      .patch(`/api/teacher/attempts/${attemptId}`)
      .set('x-teacher-token', teacherToken)
      .send({
        studentName: 'Aluno Atualizado',
        studentEmail: 'aluno.atualizado@example.com',
      });

    expect(response.status).toBe(200);
    expect(response.body.attempt).toEqual(
      expect.objectContaining({
        id: attemptId,
        studentName: 'Aluno Atualizado',
        studentEmail: 'aluno.atualizado@example.com',
      }),
    );

    const persisted = await prisma.testAttempt.findUnique({ where: { id: attemptId } });
    expect(persisted?.studentName).toBe('Aluno Atualizado');
  });

  it('isola leitura, edição e exclusão entre professores', async () => {
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

    const detail = await request(app)
      .get(`/api/teacher/attempts/${attemptId}`)
      .set('x-teacher-token', otherSession.token);

    expect(detail.status).toBe(404);

    const update = await request(app)
      .patch(`/api/teacher/attempts/${attemptId}`)
      .set('x-teacher-token', otherSession.token)
      .send({
        studentName: 'Tentativa indevida',
        studentEmail: '',
      });

    expect(update.status).toBe(404);

    const removal = await request(app)
      .delete(`/api/teacher/attempts/${attemptId}`)
      .set('x-teacher-token', otherSession.token);

    expect(removal.status).toBe(404);
  });


  it('restringe a gestão de contas ao administrador', async () => {
    const forbidden = await request(app)
      .get('/api/teacher/admin/accounts')
      .set('x-teacher-token', teacherToken);

    expect(forbidden.status).toBe(403);

    const admin = await prisma.teacher.create({
      data: {
        name: 'Administrador Integração',
        email: 'admin.integration@example.com',
        passwordHash: randomUUID(),
        role: 'ADMIN',
      },
    });

    const adminSession = await prisma.teacherSession.create({
      data: {
        token: randomUUID(),
        teacherId: admin.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const list = await request(app)
      .get('/api/teacher/admin/accounts')
      .set('x-teacher-token', adminSession.token);

    expect(list.status).toBe(200);
    expect(list.body.currentAdminId).toBe(admin.id);
    expect(list.body.teachers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: admin.id,
          role: 'ADMIN',
        }),
      ]),
    );

    const createdUser = await request(app)
      .post('/api/teacher/admin/users')
      .set('x-teacher-token', adminSession.token)
      .send({
        name: 'Usuário Gerenciado',
        email: 'managed.user@example.com',
        password: 'Senha123!',
      });

    expect(createdUser.status).toBe(201);
    expect(createdUser.body.user.isActive).toBe(true);

    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'managed.user@example.com', password: 'Senha123!' });

    expect(studentLogin.status).toBe(200);

    const disabledUser = await request(app)
      .patch(`/api/teacher/admin/users/${createdUser.body.user.id}`)
      .set('x-teacher-token', adminSession.token)
      .send({ name: 'Usuário Atualizado', isActive: false });

    expect(disabledUser.status).toBe(200);
    expect(disabledUser.body.user.name).toBe('Usuário Atualizado');
    expect(disabledUser.body.user.isActive).toBe(false);

    const invalidatedSession = await request(app)
      .get('/api/auth/me')
      .set('x-session-token', studentLogin.body.token);

    expect(invalidatedSession.status).toBe(401);

    const blockedLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'managed.user@example.com', password: 'Senha123!' });

    expect(blockedLogin.status).toBe(401);

    const reactivatedUser = await request(app)
      .patch(`/api/teacher/admin/users/${createdUser.body.user.id}`)
      .set('x-teacher-token', adminSession.token)
      .send({ isActive: true, password: 'NovaSenha123!' });

    expect(reactivatedUser.status).toBe(200);
    expect(reactivatedUser.body.user.isActive).toBe(true);

    const newLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'managed.user@example.com', password: 'NovaSenha123!' });

    expect(newLogin.status).toBe(200);

    const createdTeacher = await request(app)
      .post('/api/teacher/admin/teachers')
      .set('x-teacher-token', adminSession.token)
      .send({
        name: 'Professor Gerenciado',
        email: 'managed.teacher@example.com',
        password: 'Senha123!',
      });

    expect(createdTeacher.status).toBe(201);
    expect(createdTeacher.body.teacher.role).toBe('TEACHER');

    const disabledTeacher = await request(app)
      .patch(`/api/teacher/admin/teachers/${createdTeacher.body.teacher.id}`)
      .set('x-teacher-token', adminSession.token)
      .send({ isActive: false });

    expect(disabledTeacher.status).toBe(200);
    expect(disabledTeacher.body.teacher.isActive).toBe(false);

    const disabledTeacherLogin = await request(app)
      .post('/api/teacher/auth/login')
      .send({ email: 'managed.teacher@example.com', password: 'Senha123!' });

    expect(disabledTeacherLogin.status).toBe(401);

    const reactivatedTeacher = await request(app)
      .patch(`/api/teacher/admin/teachers/${createdTeacher.body.teacher.id}`)
      .set('x-teacher-token', adminSession.token)
      .send({ isActive: true, password: 'NovaSenha123!' });

    expect(reactivatedTeacher.status).toBe(200);
    expect(reactivatedTeacher.body.teacher.isActive).toBe(true);

    const teacherLoginAfterReset = await request(app)
      .post('/api/teacher/auth/login')
      .send({ email: 'managed.teacher@example.com', password: 'NovaSenha123!' });

    expect(teacherLoginAfterReset.status).toBe(200);

    const cannotDeleteSelf = await request(app)
      .delete(`/api/teacher/admin/teachers/${admin.id}`)
      .set('x-teacher-token', adminSession.token);

    expect(cannotDeleteSelf.status).toBe(400);

    expect(
      (
        await request(app)
          .delete(`/api/teacher/admin/users/${createdUser.body.user.id}`)
          .set('x-teacher-token', adminSession.token)
      ).status,
    ).toBe(204);

    expect(
      (
        await request(app)
          .delete(`/api/teacher/admin/teachers/${createdTeacher.body.teacher.id}`)
          .set('x-teacher-token', adminSession.token)
      ).status,
    ).toBe(204);
  });

  it('permite excluir uma prova individual', async () => {
    const response = await request(app)
      .delete(`/api/teacher/attempts/${attemptId}`)
      .set('x-teacher-token', teacherToken);

    expect(response.status).toBe(204);
    expect(await prisma.testAttempt.findUnique({ where: { id: attemptId } })).toBeNull();
  });

  it('permite limpar todas as provas listadas do professor', async () => {
    const studentSession = await prisma.session.findUnique({ where: { token: studentToken } });
    expect(studentSession).not.toBeNull();

    await prisma.testAttempt.createMany({
      data: [
        {
          sessionId: studentSession!.id,
          teacherId,
          studentName: 'Aluno Limpeza 1',
          studentEmail: 'limpeza1@example.com',
          status: 'COMPLETED',
          totalQuestions: 0,
          questionIds: [],
          score: 0,
          cefrLevel: 'A1',
          breakdown: [],
          completedAt: new Date(),
        },
        {
          sessionId: studentSession!.id,
          teacherId,
          studentName: 'Aluno Limpeza 2',
          studentEmail: 'limpeza2@example.com',
          status: 'COMPLETED',
          totalQuestions: 0,
          questionIds: [],
          score: 100,
          cefrLevel: 'C2',
          breakdown: [],
          completedAt: new Date(),
        },
      ],
    });

    const response = await request(app)
      .delete('/api/teacher/attempts')
      .set('x-teacher-token', teacherToken);

    expect(response.status).toBe(200);
    expect(response.body.deleted).toBe(2);

    const remaining = await prisma.testAttempt.count({
      where: { teacherId, status: 'COMPLETED' },
    });
    expect(remaining).toBe(0);
  });
});
