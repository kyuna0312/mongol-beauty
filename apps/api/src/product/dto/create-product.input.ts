import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsString, IsUUID, IsInt, IsOptional, IsArray, Min, IsBoolean } from 'class-validator';

@InputType()
export class CreateProductInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => ID)
  @IsUUID()
  categoryId: string;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  price: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  @Min(0)
  stock: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  descriptionHtml?: string;

  @Field(() => [String], { defaultValue: [] })
  @IsArray()
  @IsString({ each: true })
  skinType: string[];

  @Field(() => [String], { defaultValue: [] })
  @IsArray()
  @IsString({ each: true })
  features: string[];

  @Field(() => [String], { defaultValue: [] })
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isKoreanProduct?: boolean;
}

@InputType()
export class UpdateProductInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  descriptionHtml?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skinType?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isKoreanProduct?: boolean;
}
