import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './cart-item.entity';
import { Product } from '../product/product.entity';
import { CartItemInput } from './dto/cart-item.input';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getMyCart(userId: string): Promise<CartItem[]> {
    return this.cartRepository.find({
      where: { userId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  async setItem(userId: string, productId: string, quantity: number): Promise<CartItem[]> {
    if (quantity < 0) {
      throw new BadRequestException('Quantity must be non-negative');
    }

    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (quantity > product.stock) {
      throw new BadRequestException('Requested quantity exceeds stock');
    }

    const existing = await this.cartRepository.findOne({
      where: { userId, productId },
    });

    if (quantity === 0) {
      if (existing) {
        await this.cartRepository.remove(existing);
      }
      return this.getMyCart(userId);
    }

    if (existing) {
      existing.quantity = quantity;
      await this.cartRepository.save(existing);
    } else {
      await this.cartRepository.save(
        this.cartRepository.create({
          userId,
          productId,
          quantity,
        }),
      );
    }
    return this.getMyCart(userId);
  }

  async mergeCart(userId: string, items: CartItemInput[]): Promise<CartItem[]> {
    for (const item of items) {
      const product = await this.productRepository.findOne({ where: { id: item.productId } });
      if (!product) continue;

      const existing = await this.cartRepository.findOne({
        where: { userId, productId: item.productId },
      });

      const mergedQuantity = Math.min(product.stock, (existing?.quantity ?? 0) + item.quantity);
      if (mergedQuantity <= 0) continue;

      if (existing) {
        existing.quantity = mergedQuantity;
        await this.cartRepository.save(existing);
      } else {
        await this.cartRepository.save(
          this.cartRepository.create({
            userId,
            productId: item.productId,
            quantity: mergedQuantity,
          }),
        );
      }
    }

    return this.getMyCart(userId);
  }

  async removeItem(userId: string, productId: string): Promise<CartItem[]> {
    await this.cartRepository.delete({ userId, productId });
    return this.getMyCart(userId);
  }

  async clearCart(userId: string): Promise<boolean> {
    await this.cartRepository.delete({ userId });
    return true;
  }
}
