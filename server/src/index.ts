import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import app from './app.js';

config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

const port = Number(process.env.PORT ?? 3333);

app.listen(port, () => {
  console.log(`Idiomas Pro API disponível em http://localhost:${port}`);
});
