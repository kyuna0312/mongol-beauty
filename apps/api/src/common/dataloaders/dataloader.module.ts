import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../product/product.entity';
import { Category } from '../../category/category.entity';
import { ProductLoader } from './product.loader';
import { CategoryLoader } from './category.loader';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category])],
  providers: [ProductLoader, CategoryLoader],
  exports: [ProductLoader, CategoryLoader],
})
export class DataloaderModule {}
