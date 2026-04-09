import { Injectable } from '@nestjs/common';
import { OrderGatewayService } from '../order/order.gateway.service';
import { OrderStatus } from '../order/order.entity';

@Injectable()
export class AdminService {
  constructor(private readonly orderGatewayService: OrderGatewayService) {}

  async getAdminOrders(params: { limit: number; offset: number; status?: OrderStatus }) {
    return this.orderGatewayService.findAllAdminPaginated(params);
  }

  async confirmPayment(orderId: string) {
    return this.orderGatewayService.updateStatus(orderId, OrderStatus.CONFIRMED);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    return this.orderGatewayService.updateStatus(orderId, status);
  }
}
