import DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Category } from '../../category/category.entity';

@Injectable()
export class CategoryLoader {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  createLoader() {
    return new DataLoader<string, Category>(async (ids: readonly string[]) => {
      const categories = await this.categoryRepository.find({
        where: { id: In([...ids]) },
      });

      const categoryMap = new Map(categories.map(c => [c.id, c]));
      return ids.map(id => categoryMap.get(id) || null);
    });
  }
}
