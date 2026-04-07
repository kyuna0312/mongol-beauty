import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Order, OrderStatus } from './order.entity';
import { OrderService } from './order.service';
import { CreateOrderInput } from './dto/create-order.input';
import { GqlOptionalAuthGuard } from '../common/guards/gql-optional-auth.guard';
import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { User } from '../user/user.entity';

@Resolver(() => Order)
export class OrderResolver {
  constructor(private orderService: OrderService) {}

  @Mutation(() => Order)
  @UseGuards(GqlOptionalAuthGuard)
  async createOrder(@Args('input') input: CreateOrderInput, @Context() ctx: any): Promise<Order> {
    const user = ctx.req?.user as User | null | undefined;
    return this.orderService.create(input, user?.id);
  }

  @Query(() => [Order])
  @UseGuards(GqlJwtAuthGuard)
  async orders(@Context() ctx: any): Promise<Order[]> {
    const user = ctx.req.user as User;
    return this.orderService.findAllForUser(user.id);
  }

  @Query(() => Order, { nullable: true })
  @UseGuards(GqlOptionalAuthGuard)
  async order(@Args('id', { type: () => ID }) id: string, @Context() ctx: any): Promise<Order> {
    const user = ctx.req?.user as User | null | undefined;
    return this.orderService.findOneForRequester(id, user ?? null);
  }
}
