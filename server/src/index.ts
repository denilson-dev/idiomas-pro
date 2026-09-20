import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import app from './app.js';

config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

const port = Number(process.env.PORT ?? 3333);
const host = process.env.HOST ?? '0.0.0.0';

app.listen(port, host, () => {
  console.log(`Idiomas Pro disponível em http://${host}:${port}`);
});
