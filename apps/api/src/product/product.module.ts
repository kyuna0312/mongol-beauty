import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductService } from './product.service';
import { ProductResolver } from './product.resolver';
import { AuthModule } from '../auth/auth.module';
import { Category } from '../category/category.entity';

/** AuthModule provides JWT guards used on admin product mutations. */
@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category]),
    AuthModule,
  ],
  providers: [ProductService, ProductResolver],
  exports: [ProductService],
})
export class ProductModule {}
