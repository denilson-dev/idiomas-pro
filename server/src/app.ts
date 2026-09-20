import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import api from './routes/api.js';

const app = express();
const allowedOrigin = process.env.CLIENT_ORIGIN;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: allowedOrigin ? allowedOrigin.split(',').map((value) => value.trim()) : true,
  credentials: false,
}));
app.use(express.json({ limit: '1mb' }));

app.get(['/health', '/api/health'], (_req, res) => {
  res.json({ status: 'ok', service: 'idiomas-pro-api' });
});

app.use('/api', api);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Erro interno do servidor.' });
});

export default app;
