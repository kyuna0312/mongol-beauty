import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './cart-item.entity';
import { Product } from '../product/product.entity';
import { CartService } from './cart.service';
import { CartResolver } from './cart.resolver';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([CartItem, Product]), AuthModule],
  providers: [CartService, CartResolver],
  exports: [CartService],
})
export class CartModule {}
