type Req = {
  method?: string;
  url?: string;
  query?: Record<string, string | string[] | undefined>;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
};

type Res = {
  status: (code: number) => Res;
  send: (body?: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

const DEFAULT_BACKEND_API_URL = 'https://idiomas-pro.onrender.com/api';

function pathOf(req: Req) {
  const raw = req.query?.path;
  const path = Array.isArray(raw) ? raw.join('/') : raw ?? '';
  return String(path).replace(/^\/+|\/+$/g, '');
}

function backendBaseUrl() {
  return (process.env.BACKEND_API_URL || DEFAULT_BACKEND_API_URL).replace(/\/+$/, '');
}

function requestBody(req: Req) {
  if (req.body === undefined || req.body === null) return undefined;
  if (typeof req.body === 'string' || req.body instanceof Buffer) return req.body;
  return JSON.stringify(req.body);
}

function forwardedHeaders(req: Req) {
  const headers = new Headers();

  for (const name of ['content-type', 'accept', 'x-session-token', 'x-teacher-token', 'x-client-id']) {
    const value = req.headers[name];
    if (typeof value === 'string') headers.set(name, value);
  }

  if (!headers.has('accept')) headers.set('accept', '*/*');
  return headers;
}

export default async function handler(req: Req, res: Res) {
  const path = pathOf(req);
  const method = (req.method || 'GET').toUpperCase();
  const target = new URL(`${backendBaseUrl()}/${path}`);

  for (const [key, value] of Object.entries(req.query ?? {})) {
    if (key === 'path' || value === undefined) continue;
    if (Array.isArray(value)) {
      value.forEach((item) => target.searchParams.append(key, item));
    } else {
      target.searchParams.set(key, value);
    }
  }

  try {
    const upstream = await fetch(target, {
      method,
      headers: forwardedHeaders(req),
      body: ['GET', 'HEAD'].includes(method) ? undefined : requestBody(req),
      redirect: 'manual',
    });

    const contentType = upstream.headers.get('content-type');
    const cacheControl = upstream.headers.get('cache-control');

    if (contentType) res.setHeader('Content-Type', contentType);
    if (cacheControl) res.setHeader('Cache-Control', cacheControl);

    if (upstream.status === 204 || method === 'HEAD') {
      return res.status(upstream.status).send();
    }

    const payload = Buffer.from(await upstream.arrayBuffer());
    return res.status(upstream.status).send(payload);
  } catch (error) {
    console.error('Backend proxy error', error);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(502).send(
      JSON.stringify({
        message: 'O backend está temporariamente indisponível. Tente novamente em instantes.',
      }),
    );
  }
}
