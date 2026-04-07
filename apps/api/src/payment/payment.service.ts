import { Injectable } from '@nestjs/common';
import { OrderService } from '../order/order.service';

@Injectable()
export class PaymentService {
  constructor(private orderService: OrderService) {}

  async uploadReceipt(orderId: string, fileUrl: string): Promise<void> {
    await this.orderService.updatePaymentReceipt(orderId, fileUrl);
  }
}
