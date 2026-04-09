export interface LocalCartItem {
  productId: string;
  quantity: number;
  price?: number;
}

export interface CartItemLike {
  productId: string;
  quantity: number;
}

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  images?: string[];
  stock: number;
}

export interface CartLine extends CartItemLike {
  product?: CartProduct;
}

export interface CheckoutCartItem extends CartItemLike {
  price: number;
}
