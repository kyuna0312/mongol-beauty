import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product, ProductsPage } from './product.entity';
import { Category } from '../category/category.entity';

@Injectable()
export class ProductService {
  private isUuid(value?: string): boolean {
    if (!value) return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  private async getCategoryIdsIncludingChildren(categoryId: string): Promise<string[]> {
    const all = await this.categoryRepository.find({ select: ['id', 'parentId'] });
    const result: string[] = [categoryId];
    const queue = [categoryId];
    while (queue.length) {
      const current = queue.shift()!;
      for (const cat of all) {
        if (cat.parentId === current) {
          result.push(cat.id);
          queue.push(cat.id);
        }
      }
    }
    return result;
  }

  private async buildProductsQuery(categoryId?: string, limit?: number, offset?: number, search?: string, showHidden = false) {
    const query = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .orderBy('product.createdAt', 'DESC');

    const conditions: string[] = [];
    const params: Record<string, unknown> = {};

    if (!showHidden) {
      conditions.push('product.isVisible = :isVisible');
      params.isVisible = true;
    }

    if (categoryId && this.isUuid(categoryId)) {
      const categoryIds = await this.getCategoryIdsIncludingChildren(categoryId);
      conditions.push('product.categoryId IN (:...categoryIds)');
      params.categoryIds = categoryIds;
    }

    if (search?.trim()) {
      conditions.push('(product.name ILIKE :term OR product.description ILIKE :term)');
      params.term = `%${search.trim()}%`;
    }

    if (conditions.length > 0) {
      query.where(conditions.join(' AND '), params);
    }

    query.take(limit || 20).skip(offset || 0);
    return query;
  }

  async findAll(categoryId?: string, limit?: number, offset?: number, search?: string): Promise<Product[]> {
    return (await this.buildProductsQuery(categoryId, limit, offset, search, false)).getMany();
  }

  async findAllAdmin(categoryId?: string, limit?: number, offset?: number, search?: string): Promise<Product[]> {
    return (await this.buildProductsQuery(categoryId, limit, offset, search, true)).getMany();
  }

  async findAllPaginated(categoryId?: string, limit?: number, offset?: number, search?: string): Promise<ProductsPage> {
    const [items, totalCount] = await (await this.buildProductsQuery(categoryId, limit, offset, search, false)).getManyAndCount();
    return { items, totalCount };
  }

  async findAllPaginatedAdmin(categoryId?: string, limit?: number, offset?: number, search?: string): Promise<ProductsPage> {
    const [items, totalCount] = await (await this.buildProductsQuery(categoryId, limit, offset, search, true)).getManyAndCount();
    return { items, totalCount };
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
      variants: Array.isArray(input.variants) ? input.variants.join(',') : input.variants || '',
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
    if (input.salePrice !== undefined) updateData.salePrice = input.salePrice;
    if (input.stock !== undefined) updateData.stock = input.stock;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.descriptionHtml !== undefined) updateData.descriptionHtml = input.descriptionHtml;
    if (input.skinType !== undefined) {
      updateData.skinType = Array.isArray(input.skinType) ? input.skinType.join(',') : input.skinType;
    }
    if (input.features !== undefined) {
      updateData.features = Array.isArray(input.features) ? input.features.join(',') : input.features;
    }
    if (input.images !== undefined) {
      updateData.images = Array.isArray(input.images) ? input.images.join(',') : input.images;
    }
    if (input.size !== undefined) updateData.size = input.size;
    if (input.variants !== undefined) {
      updateData.variants = Array.isArray(input.variants) ? input.variants.join(',') : input.variants;
    }
    if (input.isKoreanProduct !== undefined) updateData.isKoreanProduct = input.isKoreanProduct;
    if (input.isVisible !== undefined) updateData.isVisible = input.isVisible;

    await this.productRepository.update(id, updateData);
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.productRepository.delete(id);
    return (result.affected || 0) > 0;
  }
}
