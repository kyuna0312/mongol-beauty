import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateOrderItemInput {
  @Field()
  productId: string;

  @Field(() => Int)
  quantity: number;
}

@InputType()
export class CreateOrderInput {
  @Field(() => [CreateOrderItemInput])
  items: CreateOrderItemInput[];

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  name?: string;
}
