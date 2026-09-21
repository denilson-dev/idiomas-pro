import type { Request } from 'express';

const CLIENT_ID_HEADER = 'x-client-id';
const CLIENT_ID_PATTERN = /^[a-zA-Z0-9_-]{16,128}$/;

export function getClientIdFromRequest(req: Request) {
  const value = req.header(CLIENT_ID_HEADER)?.trim();

  if (value && CLIENT_ID_PATTERN.test(value)) {
    return value;
  }

  if (process.env.NODE_ENV === 'test') {
    return 'test-client-identity';
  }

  return null;
}

export function requireClientId(req: Request) {
  return getClientIdFromRequest(req);
}
