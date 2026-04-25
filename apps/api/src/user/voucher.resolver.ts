import { Resolver, Query, Args, ObjectType, Field, Int } from '@nestjs/graphql';
import { VoucherService } from './voucher.service';

@ObjectType()
export class VoucherValidation {
  @Field(() => Int)
  discountPercent: number;
}

@Resolver()
export class VoucherResolver {
  constructor(private voucherService: VoucherService) {}

  @Query(() => VoucherValidation)
  async validateVoucher(@Args('code') code: string): Promise<VoucherValidation> {
    return this.voucherService.validateVoucher(code);
  }
}
