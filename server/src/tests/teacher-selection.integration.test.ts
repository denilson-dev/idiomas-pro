import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { prisma } from '../lib/prisma.js';

describe.sequential('Teacher selection rules', () => {
  const suffix = randomUUID();
  const teacherEmail = `selectable.teacher.${suffix}@example.com`;
  const adminEmail = `hidden.admin.${suffix}@example.com`;

  let teacherId = '';
  let adminId = '';
  let studentToken = '';

  beforeAll(async () => {
    const teacher = await prisma.teacher.create({
      data: {
        name: 'Prof. Selecionável',
        email: teacherEmail,
        passwordHash: randomUUID(),
        role: 'TEACHER',
        isActive: true,
      },
    });

    const admin = await prisma.teacher.create({
      data: {
        name: 'Administrador Oculto',
        email: adminEmail,
        passwordHash: randomUUID(),
        role: 'ADMIN',
        isActive: true,
      },
    });

    teacherId = teacher.id;
    adminId = admin.id;

    const session = await request(app).post('/api/auth/anonymous');
    expect(session.status).toBe(201);
    studentToken = session.body.token;
  });

  afterAll(async () => {
    await prisma.session.deleteMany({ where: { token: studentToken } });
    await prisma.teacher.deleteMany({
      where: { id: { in: [teacherId, adminId] } },
    });
  });

  it('lista somente professores ativos para o aluno', async () => {
    const response = await request(app).get('/api/teachers');

    expect(response.status).toBe(200);
    expect(response.body.teachers).toContainEqual({
      id: teacherId,
      name: 'Prof. Selecionável',
      role: 'TEACHER',
    });

    expect(response.body.teachers).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: adminId,
        }),
      ]),
    );
  });

  it('recusa administrador mesmo quando o ID é enviado manualmente', async () => {
    const response = await request(app)
      .post('/api/test/start')
      .set('x-session-token', studentToken)
      .send({
        count: 18,
        studentName: 'Aluno Teste',
        studentEmail: 'aluno.teste@example.com',
        teacherId: adminId,
        language: 'ES',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/administrativas não podem receber avaliações/i);
  });
});
