import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  clearLocalCart,
  hydrateLocalCartFromStorage,
  localCartVar,
  upsertLocalCartItem,
} from '../store';

function resetStorage() {
  try {
    localStorage.removeItem('cart');
  } catch {
    /* ignore */
  }
}

describe('local cart store', () => {
  beforeEach(() => {
    resetStorage();
    clearLocalCart();
  });

  afterEach(() => {
    resetStorage();
    clearLocalCart();
  });

  it('hydrates from localStorage', () => {
    localStorage.setItem(
      'cart',
      JSON.stringify([{ productId: 'p1', quantity: 2, price: 1000 }]),
    );
    const loaded = hydrateLocalCartFromStorage();
    expect(loaded).toHaveLength(1);
    expect(localCartVar()).toEqual([{ productId: 'p1', quantity: 2, price: 1000 }]);
  });

  it('upsertLocalCartItem adds and updates rows', () => {
    upsertLocalCartItem('a', 1, 10);
    expect(localCartVar()).toEqual([{ productId: 'a', quantity: 1, price: 10 }]);
    upsertLocalCartItem('a', 3, 10);
    expect(localCartVar()[0].quantity).toBe(3);
  });

  it('upsertLocalCartItem removes when quantity is 0', () => {
    upsertLocalCartItem('x', 2, 5);
    upsertLocalCartItem('x', 0, 5);
    expect(localCartVar()).toEqual([]);
  });
});
