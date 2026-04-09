import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentResolver } from './payment.resolver';
import { OrderModule } from '../order/order.module';
import { AuthModule } from '../auth/auth.module';
import { PaymentGatewayService } from './payment.gateway.service';
import { PaymentInternalController } from './payment.internal.controller';
import { ReceiptStorageService } from './receipt-storage.service';
import { LocalReceiptStorageService } from './storage/local-receipt-storage.service';

@Module({
  imports: [OrderModule, AuthModule],
  controllers: [PaymentInternalController],
  providers: [
    PaymentService,
    PaymentResolver,
    PaymentGatewayService,
    ReceiptStorageService,
    LocalReceiptStorageService,
  ],
  exports: [PaymentService, PaymentGatewayService],
})
export class PaymentModule {}
