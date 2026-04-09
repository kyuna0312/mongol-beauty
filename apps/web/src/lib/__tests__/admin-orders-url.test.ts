import { describe, expect, it } from 'vitest';
import { ordersListUrl } from '../admin-orders-url';

describe('ordersListUrl', () => {
  it('returns base path when no options', () => {
    expect(ordersListUrl({})).toBe('/admin/orders');
  });

  it('adds status only', () => {
    expect(ordersListUrl({ status: 'WAITING_PAYMENT' })).toBe('/admin/orders?status=WAITING_PAYMENT');
  });

  it('adds page when greater than 1', () => {
    expect(ordersListUrl({ page: 2 })).toBe('/admin/orders?page=2');
    expect(ordersListUrl({ page: 1 })).toBe('/admin/orders');
  });

  it('sorts query keys alphabetically via URLSearchParams', () => {
    const url = ordersListUrl({ page: 3, status: 'PAID_CONFIRMED' });
    expect(url).toContain('page=3');
    expect(url).toContain('status=PAID_CONFIRMED');
  });
});
