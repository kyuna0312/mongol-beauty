import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { OrderService } from './order.service';
import { OrderResolver } from './order.resolver';
import { AuthModule } from '../auth/auth.module';
import { OrderGatewayService } from './order.gateway.service';
import { OrderInternalController } from './order.internal.controller';
import { Voucher } from '../user/voucher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Voucher]), AuthModule],
  controllers: [OrderInternalController],
  providers: [OrderService, OrderResolver, OrderGatewayService],
  exports: [OrderService, OrderGatewayService],
})
export class OrderModule {}
