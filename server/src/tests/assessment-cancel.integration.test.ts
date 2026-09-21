import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { prisma } from '../lib/prisma.js';

describe.sequential('Assessment cancellation API', () => {
  let token = '';
  let teacherId = '';
  let attemptId = '';

  beforeAll(async () => {
    const teacher = await prisma.teacher.create({
      data: {
        name: 'Prof. Cancelamento',
        email: `cancel.teacher.${randomUUID()}@example.com`,
        passwordHash: randomUUID(),
        role: 'TEACHER',
        isActive: true,
      },
    });
    teacherId = teacher.id;

    const session = await request(app).post('/api/auth/anonymous');
    expect(session.status).toBe(201);
    token = session.body.token;
  });

  afterAll(async () => {
    await prisma.testAttempt.deleteMany({ where: { teacherId } });
    await prisma.teacher.deleteMany({ where: { id: teacherId } });
    await prisma.session.deleteMany({ where: { token } });
  });

  it('remove somente uma tentativa em andamento da própria sessão', async () => {
    const started = await request(app)
      .post('/api/test/start')
      .set('x-session-token', token)
      .send({
        count: 15,
        studentName: 'Aluno Cancelamento',
        studentEmail: 'cancel.student@example.com',
        teacherId,
        language: 'ES',
      });

    expect(started.status).toBe(201);
    attemptId = started.body.attemptId;

    const cancellation = await request(app)
      .delete(`/api/test/${attemptId}`)
      .set('x-session-token', token);

    expect(cancellation.status).toBe(204);
    expect(await prisma.testAttempt.findUnique({ where: { id: attemptId } })).toBeNull();
  });

  it('não trata tentativa inexistente como cancelamento válido', async () => {
    const response = await request(app)
      .delete(`/api/test/${attemptId}`)
      .set('x-session-token', token);

    expect(response.status).toBe(404);
  });
});
