import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminResolver } from './admin.resolver';
import { OrderModule } from '../order/order.module';
import { AuthModule } from '../auth/auth.module';
import { Order } from '../order/order.entity';
import { Product } from '../product/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Product]),
    OrderModule,
    AuthModule,
  ],
  providers: [AdminService, AdminResolver],
})
export class AdminModule {}
