import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Order, OrderStatus } from '../order/order.entity';
import { Product } from '../product/product.entity';
import { OrderGatewayService } from '../order/order.gateway.service';
import { AdminStatsResult } from './admin-stats.object';

@Injectable()
export class AdminService {
  constructor(
    private readonly orderGatewayService: OrderGatewayService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getAdminOrders(params: { limit: number; offset: number; status?: OrderStatus }) {
    return this.orderGatewayService.findAllAdminPaginated(params);
  }

  async confirmPayment(orderId: string) {
    return this.orderGatewayService.updateStatus(orderId, OrderStatus.PAID_CONFIRMED);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    return this.orderGatewayService.updateStatus(orderId, status);
  }

  async updateKoreaOrderFields(
    orderId: string,
    fields: { supplierName?: string; koreaTrackingId?: string; estimatedDays?: string },
  ) {
    await this.orderRepository.update(orderId, {
      ...(fields.supplierName !== undefined && { supplierName: fields.supplierName }),
      ...(fields.koreaTrackingId !== undefined && { koreaTrackingId: fields.koreaTrackingId }),
      ...(fields.estimatedDays !== undefined && { estimatedDays: fields.estimatedDays }),
    });
    return this.orderGatewayService.findOneForRequester(orderId, null);
  }

  async getAdminStats(): Promise<AdminStatsResult> {
    const [
      totalOrders,
      revenueRow,
      pendingOrders,
      totalProducts,
      lowStockProducts,
      recentOrders,
    ] = await Promise.all([
      this.orderRepository.count(),
      this.orderRepository
        .createQueryBuilder('o')
        .select('COALESCE(SUM(o."totalPrice"), 0)', 'revenue')
        .where('o.status = :status', { status: OrderStatus.COMPLETED })
        .getRawOne<{ revenue: string }>(),
      this.orderRepository.count({ where: { status: OrderStatus.WAITING_PAYMENT } }),
      this.productRepository.count(),
      this.productRepository.count({ where: { stock: LessThan(10) } }),
      this.orderRepository.find({
        order: { createdAt: 'DESC' },
        take: 5,
      }),
    ]);

    return {
      totalOrders,
      completedRevenue: Math.round(Number(revenueRow?.revenue ?? 0)),
      pendingOrders,
      totalProducts,
      lowStockProducts,
      recentOrders,
    };
  }
}
