import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { prisma } from '../lib/prisma.js';

describe.sequential('Premium API integration', () => {
  const studentEmail = 'premium.profile.integration@example.com';
  const teacherEmail = 'premium.teacher.integration@example.com';
  const initialStudentPassword = 'StudentPass123!';
  const nextStudentPassword = 'StudentPass456!';
  const initialTeacherPassword = 'TeacherPass123!';
  const nextTeacherPassword = 'TeacherPass456!';

  let studentToken = '';
  let teacherToken = '';
  let teacherId = '';

  beforeAll(async () => {
    await prisma.session.deleteMany({
      where: { user: { email: studentEmail } },
    });
    await prisma.teacherSession.deleteMany({
      where: { teacher: { email: teacherEmail } },
    });
    await prisma.user.deleteMany({ where: { email: studentEmail } });
    await prisma.teacher.deleteMany({ where: { email: teacherEmail } });

    const register = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Aluno Premium',
        email: studentEmail,
        password: initialStudentPassword,
      });

    if (register.status !== 201) {
      throw new Error('Não foi possível preparar o aluno do teste premium.');
    }

    studentToken = register.body.token;

    const teacher = await prisma.teacher.create({
      data: {
        name: 'Professor Premium',
        email: teacherEmail,
        passwordHash: await bcrypt.hash(initialTeacherPassword, 12),
      },
    });

    teacherId = teacher.id;

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
    await prisma.session.deleteMany({
      where: { user: { email: studentEmail } },
    });
    await prisma.teacherSession.deleteMany({
      where: { teacher: { email: teacherEmail } },
    });
    await prisma.user.deleteMany({ where: { email: studentEmail } });
    await prisma.teacher.deleteMany({ where: { email: teacherEmail } });
  });

  it('permite ao aluno gerenciar perfil, preferências e senha', async () => {
    const profile = await request(app)
      .get('/api/auth/profile')
      .set('x-session-token', studentToken);

    expect(profile.status).toBe(200);
    expect(profile.body.user).toEqual(
      expect.objectContaining({
        name: 'Aluno Premium',
        email: studentEmail,
        notificationsEnabled: true,
      }),
    );

    const updated = await request(app)
      .patch('/api/auth/profile')
      .set('x-session-token', studentToken)
      .send({
        name: 'Aluno Premium Atualizado',
        email: studentEmail,
      });

    expect(updated.status).toBe(200);
    expect(updated.body.user.name).toBe('Aluno Premium Atualizado');

    const preferences = await request(app)
      .patch('/api/auth/preferences')
      .set('x-session-token', studentToken)
      .send({ notificationsEnabled: false });

    expect(preferences.status).toBe(200);
    expect(preferences.body.preferences.notificationsEnabled).toBe(false);

    const password = await request(app)
      .patch('/api/auth/password')
      .set('x-session-token', studentToken)
      .send({
        currentPassword: initialStudentPassword,
        newPassword: nextStudentPassword,
      });

    expect(password.status).toBe(204);

    const login = await request(app)
      .post('/api/auth/login')
      .send({
        email: studentEmail,
        password: nextStudentPassword,
      });

    expect(login.status).toBe(200);
  });

  it('permite ao professor gerenciar perfil, preferências, senha e relatórios', async () => {
    const profile = await request(app)
      .get('/api/teacher/profile')
      .set('x-teacher-token', teacherToken);

    expect(profile.status).toBe(200);
    expect(profile.body.teacher).toEqual(
      expect.objectContaining({
        id: teacherId,
        compactMode: false,
        rememberFilters: true,
      }),
    );

    const updated = await request(app)
      .patch('/api/teacher/profile')
      .set('x-teacher-token', teacherToken)
      .send({
        name: 'Professor Premium Atualizado',
        email: teacherEmail,
      });

    expect(updated.status).toBe(200);
    expect(updated.body.teacher.name).toBe('Professor Premium Atualizado');

    const preferences = await request(app)
      .patch('/api/teacher/preferences')
      .set('x-teacher-token', teacherToken)
      .send({
        compactMode: true,
        rememberFilters: false,
      });

    expect(preferences.status).toBe(200);
    expect(preferences.body.preferences).toEqual({
      compactMode: true,
      rememberFilters: false,
    });

    const reports = await request(app)
      .get('/api/teacher/reports')
      .set('x-teacher-token', teacherToken);

    expect(reports.status).toBe(200);
    expect(reports.body.levelDistribution).toHaveLength(6);
    expect(reports.body.categoryAverages).toHaveLength(3);
    expect(reports.body.trend).toHaveLength(6);

    const csv = await request(app)
      .get('/api/teacher/export.csv')
      .set('x-teacher-token', teacherToken);

    expect(csv.status).toBe(200);
    expect(csv.headers['content-type']).toContain('text/csv');
    expect(csv.text).toContain('Aluno');

    const password = await request(app)
      .patch('/api/teacher/password')
      .set('x-teacher-token', teacherToken)
      .send({
        currentPassword: initialTeacherPassword,
        newPassword: nextTeacherPassword,
      });

    expect(password.status).toBe(204);

    const login = await request(app)
      .post('/api/teacher/auth/login')
      .send({
        email: teacherEmail,
        password: nextTeacherPassword,
      });

    expect(login.status).toBe(200);
  });
});
