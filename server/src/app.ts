import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import api from './routes/api.js';

const app = express();
const allowedOrigin = process.env.CLIENT_ORIGIN;

const clientDist = fileURLToPath(new URL('../../client/dist', import.meta.url));
const clientIndex = fileURLToPath(new URL('../../client/dist/index.html', import.meta.url));

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
}));
app.use(cors({
  origin: allowedOrigin ? allowedOrigin.split(',').map((value) => value.trim()) : true,
  credentials: false,
}));
app.use(express.json({ limit: '1mb' }));

app.get(['/health', '/api/health'], (_req, res) => {
  res.json({
    status: 'ok',
    service: 'idiomas-pro-api',
    database: process.env.DATABASE_URL ? 'configured' : 'missing',
    runtime: process.env.RENDER ? 'render' : process.env.VERCEL ? 'vercel' : 'node',
  });
});

app.use('/api', (req, res, next) => {
  if (!process.env.DATABASE_URL) {
    return res.status(503).json({
      message: 'Banco de dados não configurado. Defina a variável DATABASE_URL no ambiente de hospedagem.',
      code: 'DATABASE_URL_MISSING',
    });
  }
  return next();
}, api);

app.use('/api', (_req, res) => {
  res.status(404).json({ message: 'Rota da API não encontrada.' });
});

if (existsSync(clientIndex)) {
  app.use(express.static(clientDist, {
    index: false,
    maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0,
  }));

  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
    return res.sendFile(clientIndex);
  });
}

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Erro interno do servidor.' });
});

export default app;
