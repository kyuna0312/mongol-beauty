import { makeVar, useReactiveVar } from '@apollo/client';
import { LocalCartItem } from '@/interfaces/cart';

export const localCartVar = makeVar<LocalCartItem[]>([]);
export const cartToastVar = makeVar<string | null>(null);

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function hydrateLocalCartFromStorage(): LocalCartItem[] {
  if (!isBrowser()) {
    localCartVar([]);
    return [];
  }
  const parsed = JSON.parse(localStorage.getItem('cart') || '[]') as LocalCartItem[];
  localCartVar(parsed);
  return parsed;
}

function persistLocalCart(items: LocalCartItem[]) {
  if (!isBrowser()) return;
  localStorage.setItem('cart', JSON.stringify(items));
}

export function setLocalCart(items: LocalCartItem[]) {
  localCartVar(items);
  persistLocalCart(items);
}

export function upsertLocalCartItem(productId: string, quantity: number, fallbackPrice = 0) {
  const current = localCartVar();
  const normalizedQty = Math.max(0, quantity);
  const idx = current.findIndex((item) => item.productId === productId);

  if (idx === -1) {
    if (normalizedQty <= 0) return;
    setLocalCart([...current, { productId, quantity: normalizedQty, price: fallbackPrice }]);
    return;
  }

  if (normalizedQty <= 0) {
    setLocalCart(current.filter((item) => item.productId !== productId));
    return;
  }

  const next = [...current];
  next[idx] = { ...next[idx], quantity: normalizedQty };
  setLocalCart(next);
}

export function removeLocalCartItem(productId: string) {
  const current = localCartVar();
  setLocalCart(current.filter((item) => item.productId !== productId));
}

export function clearLocalCart() {
  if (isBrowser()) {
    localStorage.removeItem('cart');
  }
  localCartVar([]);
}

export function showCartToast(message: string) {
  cartToastVar(message);
}

export function clearCartToast() {
  cartToastVar(null);
}

export function useCartToast() {
  const message = useReactiveVar(cartToastVar);
  return {
    message,
    showCartToast,
    clearCartToast,
  };
}
