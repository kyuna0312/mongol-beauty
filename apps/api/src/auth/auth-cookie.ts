import type { Request } from 'express';

const ACCESS_COOKIE = 'mb_access_token';

export function getAccessTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers?.authorization as string | undefined;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  const cookieHeader = req.headers?.cookie as string | undefined;
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';');
  for (const raw of parts) {
    const [key, ...valueParts] = raw.trim().split('=');
    if (key === ACCESS_COOKIE) {
      return decodeURIComponent(valueParts.join('=') || '');
    }
  }
  return null;
}

export function getAccessCookieName(): string {
  return ACCESS_COOKIE;
}
