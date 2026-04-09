import { describe, expect, it } from 'vitest';
import { getCheckoutCreateOrderBlock, isValidCheckoutPhone } from '../checkout-validation';

describe('isValidCheckoutPhone', () => {
  it('allows empty input (optional phone)', () => {
    expect(isValidCheckoutPhone('')).toBe(true);
    expect(isValidCheckoutPhone('   ')).toBe(true);
  });

  it('allows exactly 8 digits', () => {
    expect(isValidCheckoutPhone('99112233')).toBe(true);
  });

  it('rejects wrong length or non-digits', () => {
    expect(isValidCheckoutPhone('9911223')).toBe(false);
    expect(isValidCheckoutPhone('991122334')).toBe(false);
    expect(isValidCheckoutPhone('99a12233')).toBe(false);
  });
});

describe('getCheckoutCreateOrderBlock', () => {
  it('blocks empty cart first', () => {
    expect(getCheckoutCreateOrderBlock(false, '')).toBe('empty_cart');
    expect(getCheckoutCreateOrderBlock(false, '99112233')).toBe('empty_cart');
  });

  it('blocks invalid phone when cart has items', () => {
    expect(getCheckoutCreateOrderBlock(true, '123')).toBe('invalid_phone');
  });

  it('allows proceed when cart has items and phone is empty or valid', () => {
    expect(getCheckoutCreateOrderBlock(true, '')).toBe(null);
    expect(getCheckoutCreateOrderBlock(true, '99112233')).toBe(null);
  });
});
