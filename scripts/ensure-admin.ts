import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, TeacherRole } from '../server/src/generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL não configurada.');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const email = (process.env.ADMIN_EMAIL || 'administrador@adm.com').trim().toLowerCase();
  const configuredPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!configuredPassword || configuredPassword.length < 8) {
    throw new Error(
      'ADMIN_PASSWORD precisa estar configurada com pelo menos 8 caracteres.',
    );
  }

  const passwordHash = await bcrypt.hash(configuredPassword, 12);

  const admin = await prisma.teacher.upsert({
    where: { email },
    update: {
      name: 'Administrador',
      passwordHash,
      role: TeacherRole.ADMIN,
      isActive: true,
    },
    create: {
      name: 'Administrador',
      email,
      passwordHash,
      role: TeacherRole.ADMIN,
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  console.log('Administrador validado com sucesso:', admin);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
