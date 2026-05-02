import { Field, InputType, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';

@InputType()
export class UpdateSiteSettingsInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bankName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bankAccount?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bankOwner?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  deliveryFee?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  freeDeliveryThreshold?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  primaryColor?: string;
}
