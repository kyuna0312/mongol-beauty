import { InputType, Field, ID, Int } from '@nestjs/graphql';

@InputType()
export class CreateProductInput {
  @Field()
  name: string;

  @Field(() => ID)
  categoryId: string;

  @Field(() => Int)
  price: number;

  @Field(() => Int, { defaultValue: 0 })
  stock: number;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String], { defaultValue: [] })
  skinType: string[];

  @Field(() => [String], { defaultValue: [] })
  features: string[];

  @Field(() => [String], { defaultValue: [] })
  images: string[];
}

@InputType()
export class UpdateProductInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field(() => ID, { nullable: true })
  categoryId?: string;

  @Field(() => Int, { nullable: true })
  price?: number;

  @Field(() => Int, { nullable: true })
  stock?: number;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String], { nullable: true })
  skinType?: string[];

  @Field(() => [String], { nullable: true })
  features?: string[];

  @Field(() => [String], { nullable: true })
  images?: string[];
}
