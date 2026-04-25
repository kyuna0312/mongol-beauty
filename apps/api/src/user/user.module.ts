import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { AuthModule } from '../auth/auth.module';
import { Voucher } from './voucher.entity';
import { VoucherService } from './voucher.service';
import { VoucherResolver } from './voucher.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([User, Voucher]), AuthModule],
  providers: [UserService, UserResolver, VoucherService, VoucherResolver],
  exports: [UserService, VoucherService],
})
export class UserModule {}
