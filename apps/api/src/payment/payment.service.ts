import { Injectable } from '@nestjs/common';
import { OrderService } from '../order/order.service';
import { OrderStatus } from '../order/order.entity';

@Injectable()
export class PaymentService {
  constructor(private orderService: OrderService) {}

  async uploadReceipt(orderId: string, fileUrl: string): Promise<void> {
    await this.orderService.updatePaymentReceipt(orderId, fileUrl);
  }

  async confirmPayment(orderId: string): Promise<void> {
    await this.orderService.updateStatus(orderId, OrderStatus.CONFIRMED);
  }
}
