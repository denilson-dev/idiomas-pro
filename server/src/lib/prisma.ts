import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

config({ path: fileURLToPath(new URL('../../../.env', import.meta.url)) });

const connectionString =
  process.env.DATABASE_URL ??
  'postgresql://invalid:invalid@127.0.0.1:5432/idiomas_pro?schema=public';

const adapter = new PrismaPg({
  connectionString,
  max: 5,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 10000,
});

export const prisma = new PrismaClient({ adapter });
