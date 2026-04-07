import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentResolver } from './payment.resolver';
import { OrderModule } from '../order/order.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [OrderModule, AuthModule],
  providers: [PaymentService, PaymentResolver],
})
export class PaymentModule {}
