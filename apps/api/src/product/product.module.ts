import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductService } from './product.service';
import { ProductResolver } from './product.resolver';
import { AuthModule } from '../auth/auth.module';

/** AuthModule provides JWT guards used on admin product mutations. */
@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    AuthModule,
  ],
  providers: [ProductService, ProductResolver],
  exports: [ProductService],
})
export class ProductModule {}
