import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { prisma } from '../lib/prisma.js';

describe.sequential('Profile API integration', () => {
  const studentPassword = randomUUID();
  const studentNewPassword = randomUUID();
  const teacherPassword = randomUUID();
  const teacherNewPassword = randomUUID();

  let studentToken = '';
  let teacherToken = '';

  beforeAll(async () => {
    const student = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Aluno Perfil',
        email: 'profile.student@example.com',
        password: studentPassword,
      });

    expect(student.status).toBe(201);
    studentToken = student.body.token;

    const passwordHash = await import('bcryptjs').then(({ default: bcrypt }) =>
      bcrypt.hash(teacherPassword, 12),
    );

    const teacher = await prisma.teacher.create({
      data: {
        name: 'Prof. Perfil',
        email: 'profile.teacher@example.com',
        passwordHash,
      },
    });

    const session = await prisma.teacherSession.create({
      data: {
        token: randomUUID(),
        teacherId: teacher.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    teacherToken = session.token;
  });

  afterAll(async () => {
    await prisma.teacherSession.deleteMany({
      where: { teacher: { email: 'profile.teacher.updated@example.com' } },
    });
    await prisma.teacher.deleteMany({
      where: { email: 'profile.teacher.updated@example.com' },
    });
    await prisma.session.deleteMany({
      where: { user: { email: 'profile.student.updated@example.com' } },
    });
    await prisma.user.deleteMany({
      where: { email: 'profile.student.updated@example.com' },
    });
  });

  it('permite ao aluno editar perfil, preferências e senha', async () => {
    const profile = await request(app)
      .patch('/api/auth/profile')
      .set('x-session-token', studentToken)
      .send({
        name: 'Aluno Perfil Atualizado',
        email: 'profile.student.updated@example.com',
      });

    expect(profile.status).toBe(200);
    expect(profile.body.user.name).toBe('Aluno Perfil Atualizado');

    const preferences = await request(app)
      .patch('/api/auth/preferences')
      .set('x-session-token', studentToken)
      .send({ notifications: true, reducedMotion: true });

    expect(preferences.status).toBe(200);
    expect(preferences.body.preferences.notifications).toBe(true);

    const password = await request(app)
      .patch('/api/auth/password')
      .set('x-session-token', studentToken)
      .send({
        currentPassword: studentPassword,
        newPassword: studentNewPassword,
      });

    expect(password.status).toBe(204);

    const login = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'profile.student.updated@example.com',
        password: studentNewPassword,
      });

    expect(login.status).toBe(200);
  });

  it('permite ao professor editar perfil, preferências e senha', async () => {
    const profile = await request(app)
      .patch('/api/teacher/auth/profile')
      .set('x-teacher-token', teacherToken)
      .send({
        name: 'Prof. Perfil Atualizado',
        email: 'profile.teacher.updated@example.com',
      });

    expect(profile.status).toBe(200);
    expect(profile.body.teacher.name).toBe('Prof. Perfil Atualizado');

    const preferences = await request(app)
      .patch('/api/teacher/auth/preferences')
      .set('x-teacher-token', teacherToken)
      .send({ compactTables: true, rememberFilters: true });

    expect(preferences.status).toBe(200);
    expect(preferences.body.preferences.compactTables).toBe(true);

    const password = await request(app)
      .patch('/api/teacher/auth/password')
      .set('x-teacher-token', teacherToken)
      .send({
        currentPassword: teacherPassword,
        newPassword: teacherNewPassword,
      });

    expect(password.status).toBe(204);

    const login = await request(app)
      .post('/api/teacher/auth/login')
      .send({
        email: 'profile.teacher.updated@example.com',
        password: teacherNewPassword,
      });

    expect(login.status).toBe(200);
  });
});
