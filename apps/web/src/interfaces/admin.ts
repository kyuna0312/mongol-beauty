export type OrderStatus = 'WAITING_PAYMENT' | 'PAID_CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
export type PaymentMethod = 'BANK_TRANSFER' | 'CASH';

export interface AdminOrderItem {
  id: string;
  quantity: number;
  price: number;
  product?: {
    name?: string;
  };
}

export interface AdminOrder {
  id: string;
  status: OrderStatus;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  paymentMethod: PaymentMethod;
  paymentReceiptUrl?: string | null;
  deliveryAddress?: string | null;
  deliveryNote?: string | null;
  deliveryFee?: number;
  notes?: string[];
  supplierName?: string | null;
  koreaTrackingId?: string | null;
  estimatedDays?: string | null;
  user?: {
    name?: string;
    phone?: string;
  };
  items?: AdminOrderItem[];
}

export interface AdminOrdersPageData {
  items: AdminOrder[];
  total: number;
  limit: number;
  offset: number;
}
