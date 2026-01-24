import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Order, OrderStatus } from '../order/order.entity';
import { AdminService } from './admin.service';

@Resolver(() => Order)
export class AdminResolver {
  constructor(private adminService: AdminService) {}

  @Query(() => [Order])
  async adminOrders(): Promise<Order[]> {
    // In production, add admin auth check
    return this.adminService.getAllOrders();
  }

  @Mutation(() => Order)
  async confirmPayment(@Args('orderId', { type: () => ID }) orderId: string): Promise<Order> {
    // In production, add admin auth check
    return this.adminService.confirmPayment(orderId);
  }

  @Mutation(() => Order)
  async updateOrderStatus(
    @Args('orderId', { type: () => ID }) orderId: string,
    @Args('status') status: OrderStatus,
  ): Promise<Order> {
    // In production, add admin auth check
    return this.adminService.updateOrderStatus(orderId, status);
  }
}
