export enum OrderStatus {
  WAITING_PAYMENT = 'WAITING_PAYMENT',
  // Keep persisted value as CONFIRMED for API/DB compatibility.
  PAID_CONFIRMED = 'CONFIRMED',
  SHIPPING = 'SHIPPING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum SkinType {
  OILY = 'OILY',
  DRY = 'DRY',
  COMBINATION = 'COMBINATION',
  SENSITIVE = 'SENSITIVE',
  NORMAL = 'NORMAL',
}

export enum Feature {
  ANTI_AGING = 'ANTI_AGING',
  HYDRATING = 'HYDRATING',
  BRIGHTENING = 'BRIGHTENING',
  ACNE_FIGHTING = 'ACNE_FIGHTING',
  SUNSCREEN = 'SUNSCREEN',
  ORGANIC = 'ORGANIC',
}

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderInput {
  items: CreateOrderItemInput[];
  phone?: string;
  name?: string;
}
