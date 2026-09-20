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

  const credentials = {
    name: 'Prof. E2E',
    email: 'teacher.e2e@example.com',
    secret: randomUUID(),
  };

  await prisma.teacher.create({
    data: {
      name: credentials.name,
      email: credentials.email,
      passwordHash: await bcrypt.hash(credentials.secret, 4),
    },
  });

  writeFileSync('.e2e-teacher.json', JSON.stringify(credentials), 'utf8');
  await prisma.$disconnect();
}
