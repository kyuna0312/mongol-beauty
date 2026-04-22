import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductService {
  private isUuid(value?: string): boolean {
    if (!value) return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(categoryId?: string, limit?: number, offset?: number, search?: string): Promise<Product[]> {
    const query = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .orderBy('product.createdAt', 'DESC');

    if (categoryId) {
      if (this.isUuid(categoryId)) {
        query.where('product.categoryId = :categoryId', { categoryId });
      } else {
        query.where('category.slug = :categorySlug', { categorySlug: categoryId });
      }
    }

    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      const method = categoryId ? 'andWhere' : 'where';
      query[method]('(product.name ILIKE :term OR product.description ILIKE :term)', { term });
    }

    query.take(limit || 20).skip(offset || 0);

    return query.getMany();
  }

  async findOne(id: string, categoryRef?: string): Promise<Product | null> {
    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.id = :id', { id });

    if (categoryRef) {
      if (this.isUuid(categoryRef)) {
        query.andWhere('category.id = :categoryIdRef', { categoryIdRef: categoryRef });
      } else {
        query.andWhere('category.slug = :categorySlugRef', { categorySlugRef: categoryRef });
      }
    }

    return query.getOne();
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    if (!ids.length) return [];
    return this.productRepository.find({
      where: { id: In(ids) },
      relations: ['category'],
    });
  }

  async create(input: any): Promise<Product> {
    const productData = {
      ...input,
      skinType: Array.isArray(input.skinType) ? input.skinType.join(',') : input.skinType || '',
      features: Array.isArray(input.features) ? input.features.join(',') : input.features || '',
      images: Array.isArray(input.images) ? input.images.join(',') : input.images || '',
    };
    const product = this.productRepository.create(productData);
    const saved = await this.productRepository.save(product) as unknown as Product;
    // Reload with relations
    return this.findOne(saved.id);
  }

  async update(id: string, input: any): Promise<Product> {
    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.categoryId !== undefined) updateData.categoryId = input.categoryId;
    if (input.price !== undefined) updateData.price = input.price;
    if (input.stock !== undefined) updateData.stock = input.stock;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.skinType !== undefined) {
      updateData.skinType = Array.isArray(input.skinType) ? input.skinType.join(',') : input.skinType;
    }
    if (input.features !== undefined) {
      updateData.features = Array.isArray(input.features) ? input.features.join(',') : input.features;
    }
    if (input.images !== undefined) {
      updateData.images = Array.isArray(input.images) ? input.images.join(',') : input.images;
    }

    await this.productRepository.update(id, updateData);
    return this.findOne(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.productRepository.delete(id);
    return (result.affected || 0) > 0;
  }
}
