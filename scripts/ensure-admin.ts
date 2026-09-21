import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, TeacherRole } from '../server/src/generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL não configurada.');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const email = (process.env.ADMIN_EMAIL || 'administrador@adm.com').trim().toLowerCase();
  const isProduction = process.env.NODE_ENV === 'production';
  const password = process.env.ADMIN_PASSWORD || (isProduction ? '' : 'admin123');

  if (!password) {
    throw new Error(
      'ADMIN_PASSWORD não configurada. Em produção, defina uma senha segura antes de executar npm run admin:ensure.',
    );
  }

  if (password.length < 8) {
    throw new Error('A senha do administrador precisa ter pelo menos 8 caracteres.');
  }

  const passwordHash = await bcrypt.hash(password, 12);

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
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  console.log('Administrador garantido com sucesso:');
  console.log(admin);
  if (!isProduction && !process.env.ADMIN_PASSWORD) {
    console.log('Credenciais de desenvolvimento: administrador@adm.com / admin123');
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
