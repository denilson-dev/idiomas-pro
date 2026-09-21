import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import app from './app.js';

config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

const rawPort = process.env.PORT ?? (process.env.RENDER ? '10000' : '3333');
const port = Number.parseInt(rawPort, 10);
const host = '0.0.0.0';

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  throw new Error(`PORT inválida: ${rawPort}`);
}

const server = app.listen(port, host, () => {
  const address = server.address();

  if (address && typeof address === 'object') {
    console.log(
      `Idiomas Pro ouvindo em http://${address.address}:${address.port} (PORT=${process.env.PORT ?? 'não definida'})`,
    );
  } else {
    console.log(`Idiomas Pro ouvindo em http://${host}:${port}`);
  }
});

server.on('error', (error) => {
  console.error('Falha ao abrir a porta HTTP:', error);
  process.exitCode = 1;
});

function shutdown(signal: string) {
  console.log(`${signal} recebido. Encerrando servidor HTTP...`);
  server.close((error) => {
    if (error) {
      console.error('Erro ao encerrar servidor:', error);
      process.exit(1);
    }
    process.exit(0);
  });
}

process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));
