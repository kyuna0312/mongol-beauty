import { InputType, Field, ID } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class UpdateKoreaOrderInput {
  @Field(() => ID)
  @IsUUID()
  orderId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  supplierName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  koreaTrackingId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  estimatedDays?: string;
}
