/** Empty or exactly 8 digits (Mongolia-style local number). */
export function isValidCheckoutPhone(phone: string): boolean {
  const t = phone.trim();
  return t.length === 0 || /^[0-9]{8}$/.test(t);
}

export type CheckoutBlockReason = 'empty_cart' | 'invalid_phone';

export function getCheckoutCreateOrderBlock(
  hasCartItems: boolean,
  phone: string,
): CheckoutBlockReason | null {
  if (!hasCartItems) return 'empty_cart';
  if (!isValidCheckoutPhone(phone)) return 'invalid_phone';
  return null;
}
