import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsUUID, IsOptional, Matches } from 'class-validator';

@InputType()
export class CreateCategoryInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'slug must be lowercase alphanumeric with hyphens' })
  slug: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

@InputType()
export class UpdateCategoryInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'slug must be lowercase alphanumeric with hyphens' })
  slug?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
