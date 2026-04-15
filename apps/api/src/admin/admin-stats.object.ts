import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Order } from '../order/order.entity';

@ObjectType()
export class AdminStatsResult {
  @Field(() => Int)
  totalOrders: number;

  @Field(() => Int)
  completedRevenue: number;

  @Field(() => Int)
  pendingOrders: number;

  @Field(() => Int)
  totalProducts: number;

  @Field(() => Int)
  lowStockProducts: number;

  @Field(() => [Order])
  recentOrders: Order[];
}
