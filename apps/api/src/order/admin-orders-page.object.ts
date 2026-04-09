import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Order } from './order.entity';

@ObjectType()
export class AdminOrdersPage {
  @Field(() => [Order])
  items: Order[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  offset: number;
}
