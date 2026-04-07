import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { Min } from 'class-validator';

@InputType()
export class CartItemInput {
  @Field(() => ID)
  productId: string;

  @Field(() => Int)
  @Min(1)
  quantity: number;
}
