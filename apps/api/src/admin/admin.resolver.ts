import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Order, OrderStatus } from '../order/order.entity';
import { AdminOrdersPage } from '../order/admin-orders-page.object';
import { AdminStatsResult } from './admin-stats.object';
import { AdminService } from './admin.service';
import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { GqlAdminGuard } from '../common/guards/gql-admin.guard';
import { UpdateKoreaOrderInput } from './dto/update-korea-order.input';

@Resolver(() => Order)
@UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
export class AdminResolver {
  constructor(private adminService: AdminService) {}

  @Query(() => AdminStatsResult)
  async adminStats(): Promise<AdminStatsResult> {
    return this.adminService.getAdminStats();
  }

  @Query(() => AdminOrdersPage)
  async adminOrders(
    @Args('limit', { type: () => Int, nullable: true }) limitArg?: number,
    @Args('offset', { type: () => Int, nullable: true }) offsetArg?: number,
    @Args('status', { type: () => OrderStatus, nullable: true }) status?: OrderStatus,
  ): Promise<AdminOrdersPage> {
    const limit = Math.min(100, Math.max(1, limitArg ?? 20));
    const offset = Math.max(0, offsetArg ?? 0);
    return this.adminService.getAdminOrders({ limit, offset, status });
  }

  @Mutation(() => Order)
  async confirmPayment(@Args('orderId', { type: () => ID }) orderId: string): Promise<Order> {
    return this.adminService.confirmPayment(orderId);
  }

  @Mutation(() => Order)
  async updateOrderStatus(
    @Args('orderId', { type: () => ID }) orderId: string,
    @Args('status', { type: () => OrderStatus }) status: OrderStatus,
  ): Promise<Order> {
    return this.adminService.updateOrderStatus(orderId, status);
  }

  @Mutation(() => Order)
  async updateKoreaOrderFields(
    @Args('input') input: UpdateKoreaOrderInput,
  ): Promise<Order> {
    return this.adminService.updateKoreaOrderFields(input.orderId, {
      supplierName: input.supplierName,
      koreaTrackingId: input.koreaTrackingId,
      estimatedDays: input.estimatedDays,
    });
  }
}
