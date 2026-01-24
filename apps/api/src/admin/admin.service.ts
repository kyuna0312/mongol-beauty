import { Injectable } from '@nestjs/common';
import { OrderService } from '../order/order.service';
import { OrderStatus } from '../order/order.entity';

@Injectable()
export class AdminService {
  constructor(private orderService: OrderService) {}

  async getAllOrders() {
    return this.orderService.findAll();
  }

  async confirmPayment(orderId: string) {
    return this.orderService.updateStatus(orderId, OrderStatus.CONFIRMED);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    return this.orderService.updateStatus(orderId, status);
  }
}
