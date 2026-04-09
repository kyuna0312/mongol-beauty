export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    images?: string[];
  };
}

export interface OrderData {
  id: string;
  totalPrice: number;
  status: 'WAITING_PAYMENT' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
  paymentReceiptUrl?: string | null;
  createdAt: string;
  items: OrderItem[];
}
