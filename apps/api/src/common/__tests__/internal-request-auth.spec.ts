process.env.NODE_ENV = 'test';

import { buildInternalSignature, assertValidInternalSignature } from '../internal-request-auth';

describe('internal-request-auth', () => {
  describe('buildInternalSignature', () => {
    it('returns the same digest for identical inputs', () => {
      const a = buildInternalSignature({
        method: 'GET',
        path: '/internal/orders/admin',
        timestamp: '1000',
        body: '',
      });
      const b = buildInternalSignature({
        method: 'GET',
        path: '/internal/orders/admin',
        timestamp: '1000',
        body: '',
      });
      expect(a).toBe(b);
    });

    it('changes when path changes', () => {
      const t = String(Date.now());
      const a = buildInternalSignature({ method: 'GET', path: '/a', timestamp: t, body: '' });
      const b = buildInternalSignature({ method: 'GET', path: '/b', timestamp: t, body: '' });
      expect(a).not.toBe(b);
    });
  });

  describe('assertValidInternalSignature', () => {
    it('accepts a correctly signed request', () => {
      const ts = String(Date.now());
      const path = '/internal/orders';
      const sig = buildInternalSignature({
        method: 'GET',
        path,
        timestamp: ts,
        body: '',
      });
      expect(() =>
        assertValidInternalSignature({
          method: 'GET',
          path,
          timestamp: ts,
          signature: sig,
          body: '',
        }),
      ).not.toThrow();
    });

    it('rejects wrong signature', () => {
      const ts = String(Date.now());
      expect(() =>
        assertValidInternalSignature({
          method: 'GET',
          path: '/x',
          timestamp: ts,
          signature: 'deadbeef',
          body: '',
        }),
      ).toThrow();
    });
  });
});
