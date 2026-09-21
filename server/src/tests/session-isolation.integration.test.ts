import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { prisma } from '../lib/prisma.js';

describe.sequential('Browser-bound session isolation', () => {
  const clientA = 'browser-client-alpha-0001';
  const clientB = 'browser-client-bravo-0002';
  const studentEmail = `isolated.student.${randomUUID()}@example.com`;
  const adminEmail = `isolated.admin.${randomUUID()}@example.com`;
  const studentPassword = randomUUID();
  const adminPassword = randomUUID();

  beforeAll(async () => {
    await prisma.teacher.create({
      data: {
        name: 'Admin Isolado',
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, 4),
        role: 'ADMIN',
        isActive: true,
      },
    });
  });

  afterAll(async () => {
    await prisma.session.deleteMany({ where: { user: { email: studentEmail } } });
    await prisma.user.deleteMany({ where: { email: studentEmail } });
    await prisma.teacherSession.deleteMany({ where: { teacher: { email: adminEmail } } });
    await prisma.teacher.deleteMany({ where: { email: adminEmail } });
  });

  it('não aceita token do aluno em outro navegador', async () => {
    const register = await request(app)
      .post('/api/auth/register')
      .set('x-client-id', clientA)
      .send({
        name: 'Aluno Isolado',
        email: studentEmail,
        password: studentPassword,
      });

    expect(register.status).toBe(201);
    const token = register.body.token;

    const sameBrowser = await request(app)
      .get('/api/auth/me')
      .set('x-session-token', token)
      .set('x-client-id', clientA);

    expect(sameBrowser.status).toBe(200);

    const otherBrowser = await request(app)
      .get('/api/auth/me')
      .set('x-session-token', token)
      .set('x-client-id', clientB);

    expect(otherBrowser.status).toBe(401);
  });

  it('isola a sessão administrativa entre navegadores', async () => {
    const loginA = await request(app)
      .post('/api/teacher/auth/login')
      .set('x-client-id', clientA)
      .send({ email: adminEmail, password: adminPassword });

    expect(loginA.status).toBe(200);
    const tokenA = loginA.body.token;

    const sameBrowser = await request(app)
      .get('/api/teacher/auth/me')
      .set('x-teacher-token', tokenA)
      .set('x-client-id', clientA);

    expect(sameBrowser.status).toBe(200);
    expect(sameBrowser.body.teacher.role).toBe('ADMIN');

    const stolenAcrossBrowser = await request(app)
      .get('/api/teacher/auth/me')
      .set('x-teacher-token', tokenA)
      .set('x-client-id', clientB);

    expect(stolenAcrossBrowser.status).toBe(401);

    const loginB = await request(app)
      .post('/api/teacher/auth/login')
      .set('x-client-id', clientB)
      .send({ email: adminEmail, password: adminPassword });

    expect(loginB.status).toBe(200);
    expect(loginB.body.token).not.toBe(tokenA);

    const browserBSession = await request(app)
      .get('/api/teacher/auth/me')
      .set('x-teacher-token', loginB.body.token)
      .set('x-client-id', clientB);

    expect(browserBSession.status).toBe(200);
  });
});
