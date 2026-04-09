import crypto from 'crypto';
import { ForbiddenException } from '@nestjs/common';

const MAX_SKEW_MS = 60_000;

function getSecret(): string {
  const secret = (process.env.INTERNAL_SERVICE_SECRET || '').trim();
  if (!secret && process.env.NODE_ENV !== 'test') {
    throw new Error('INTERNAL_SERVICE_SECRET is required');
  }
  return secret || 'test-only-internal-service-secret';
}

export function buildInternalSignature(input: {
  method: string;
  path: string;
  timestamp: string;
  body?: string;
}): string {
  const payload = `${input.method.toUpperCase()}\n${input.path}\n${input.timestamp}\n${input.body || ''}`;
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
}

export function assertValidInternalSignature(input: {
  method: string;
  path: string;
  timestamp?: string;
  signature?: string;
  body?: string;
}) {
  if (!input.timestamp || !input.signature) {
    throw new ForbiddenException('Missing internal signature headers');
  }

  const ts = Number(input.timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > MAX_SKEW_MS) {
    throw new ForbiddenException('Internal signature timestamp is invalid or expired');
  }

  const expected = buildInternalSignature({
    method: input.method,
    path: input.path,
    timestamp: input.timestamp,
    body: input.body,
  });

  const provided = input.signature.toLowerCase();
  if (expected.length !== provided.length) {
    throw new ForbiddenException('Invalid internal signature');
  }

  const matches = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
  if (!matches) {
    throw new ForbiddenException('Invalid internal signature');
  }
}
