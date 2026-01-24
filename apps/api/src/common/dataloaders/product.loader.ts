import DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from '../../product/product.entity';

@Injectable()
export class ProductLoader {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  createLoader() {
    return new DataLoader<string, Product>(async (ids: readonly string[]) => {
      const products = await this.productRepository.find({
        where: { id: In([...ids]) },
        relations: ['category'],
      });

      const productMap = new Map(products.map(p => [p.id, p]));
      return ids.map(id => productMap.get(id) || null);
    });
  }
}
