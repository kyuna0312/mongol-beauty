import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Order, OrderStatus } from './order.entity';
import { OrderService } from './order.service';
import { CreateOrderInput } from './dto/create-order.input';

@Resolver(() => Order)
export class OrderResolver {
  constructor(private orderService: OrderService) {}

  @Mutation(() => Order)
  async createOrder(@Args('input') input: CreateOrderInput): Promise<Order> {
    return this.orderService.create(input);
  }

  @Query(() => [Order])
  async orders(): Promise<Order[]> {
    return this.orderService.findAll();
  }

  @Query(() => Order, { nullable: true })
  async order(@Args('id', { type: () => ID }) id: string): Promise<Order> {
    return this.orderService.findOne(id);
  }

  @Mutation(() => Order)
  async updateOrderStatus(
    @Args('orderId', { type: () => ID }) orderId: string,
    @Args('status') status: OrderStatus,
  ): Promise<Order> {
    return this.orderService.updateStatus(orderId, status);
  }
}
