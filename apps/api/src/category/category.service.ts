import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      relations: ['products'],
    });
  }

  async findOne(id: string): Promise<Category> {
    return this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });
  }

  async findBySlug(slug: string): Promise<Category> {
    return this.categoryRepository.findOne({
      where: { slug },
      relations: ['products'],
    });
  }

  async create(input: any): Promise<Category> {
    const category = this.categoryRepository.create(input);
    const saved = await this.categoryRepository.save(category) as unknown as Category;
    // Reload with relations
    return this.findOne(saved.id);
  }

  async update(id: string, input: any): Promise<Category> {
    await this.categoryRepository.update(id, input);
    return this.findOne(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.categoryRepository.delete(id);
    return (result.affected || 0) > 0;
  }
}
