import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentResolver } from './payment.resolver';
import { OrderModule } from '../order/order.module';
import { AuthModule } from '../auth/auth.module';
import { PaymentGatewayService } from './payment.gateway.service';
import { PaymentInternalController } from './payment.internal.controller';

@Module({
  imports: [OrderModule, AuthModule],
  controllers: [PaymentInternalController],
  providers: [PaymentService, PaymentResolver, PaymentGatewayService],
  exports: [PaymentService, PaymentGatewayService],
})
export class PaymentModule {}
