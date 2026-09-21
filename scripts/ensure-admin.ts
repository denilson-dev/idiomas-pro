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
  const isProduction = process.env.NODE_ENV === 'production';

  const existing = await prisma.teacher.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });

  if (!configuredPassword && isProduction && !existing) {
    throw new Error(
      'ADMIN_PASSWORD é obrigatória para criar o primeiro administrador em produção.',
    );
  }

  const password = configuredPassword || 'admin123';
  if (password.length < 8) {
    throw new Error('A senha do administrador precisa ter pelo menos 8 caracteres.');
  }

  const passwordHash =
    configuredPassword || !existing
      ? await bcrypt.hash(password, 12)
      : existing.passwordHash;

  const admin = await prisma.teacher.upsert({
    where: { email },
    update: {
      name: 'Administrador',
      ...(configuredPassword ? { passwordHash } : {}),
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
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  console.log('Administrador validado com sucesso:', {
    id: admin.id,
    email: admin.email,
    role: admin.role,
    isActive: admin.isActive,
  });

  if (!configuredPassword) {
    if (isProduction) {
      console.warn(
        'ADMIN_PASSWORD não configurada: a senha existente foi preservada. Configure o segredo no provedor de hospedagem para rotacioná-la.',
      );
    } else {
      console.warn(
        'Ambiente local sem ADMIN_PASSWORD: usando credencial padrão somente para desenvolvimento.',
      );
    }
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
