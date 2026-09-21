import { randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import bcrypt from 'bcryptjs';
import { prisma } from '../server/src/lib/prisma.js';

export default async function globalSetup() {
  await prisma.attemptAnswer.deleteMany();
  await prisma.testAttempt.deleteMany();
  await prisma.teacherSession.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.session.deleteMany();

  if (await prisma.question.count() < 15) {
    throw new Error('Banco E2E sem questões. Execute npm run db:seed.');
  }

  const teacher = {
    name: 'Prof. E2E',
    email: 'teacher.e2e@example.com',
    secret: randomUUID(),
  };

  await prisma.teacher.create({
    data: {
      name: teacher.name,
      email: teacher.email,
      passwordHash: await bcrypt.hash(teacher.secret, 4),
      role: 'TEACHER',
    },
  });

  const admin = {
    name: 'Administrador E2E',
    email: 'admin.e2e@example.com',
    secret: 'AdminE2E123!',
  };

  await prisma.teacher.create({
    data: {
      name: admin.name,
      email: admin.email,
      passwordHash: await bcrypt.hash(admin.secret, 4),
      role: 'ADMIN',
    },
  });

  writeFileSync('.e2e-teacher.json', JSON.stringify(teacher), 'utf8');
  writeFileSync('.e2e-admin.json', JSON.stringify(admin), 'utf8');
  await prisma.$disconnect();
}
