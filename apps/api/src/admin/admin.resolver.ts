import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Order, OrderStatus } from '../order/order.entity';
import { AdminService } from './admin.service';
import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { GqlAdminGuard } from '../common/guards/gql-admin.guard';

@Resolver(() => Order)
@UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
export class AdminResolver {
  constructor(private adminService: AdminService) {}

  @Query(() => [Order])
  async adminOrders(): Promise<Order[]> {
    return this.adminService.getAllOrders();
  }

  @Mutation(() => Order)
  async confirmPayment(@Args('orderId', { type: () => ID }) orderId: string): Promise<Order> {
    return this.adminService.confirmPayment(orderId);
  }

  @Mutation(() => Order)
  async updateOrderStatus(
    @Args('orderId', { type: () => ID }) orderId: string,
    @Args('status') status: OrderStatus,
  ): Promise<Order> {
    return this.adminService.updateOrderStatus(orderId, status);
  }
}
