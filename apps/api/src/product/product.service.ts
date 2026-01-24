import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(categoryId?: string, limit?: number, offset?: number): Promise<Product[]> {
    const query = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .orderBy('product.createdAt', 'DESC'); // Default ordering

    if (categoryId) {
      query.where('product.categoryId = :categoryId', { categoryId });
    }

    // Default pagination
    const take = limit || 20;
    const skip = offset || 0;

    query.take(take).skip(skip);

    return query.getMany();
  }

  async findOne(id: string): Promise<Product> {
    return this.productRepository.findOne({
      where: { id },
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
