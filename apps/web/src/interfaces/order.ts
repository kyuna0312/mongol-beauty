export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    images?: string[];
    isKoreanProduct?: boolean;
  };
}

export interface OrderData {
  id: string;
  totalPrice: number;
  status: 'WAITING_PAYMENT' | 'PAID_CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
  paymentReceiptUrl?: string | null;
  supplierName?: string | null;
  koreaTrackingId?: string | null;
  estimatedDays?: string | null;
  createdAt: string;
  items: OrderItem[];
}
