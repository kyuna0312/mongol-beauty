import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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
    if (!items.length) return this.getMyCart(userId);

    const requestedIds = Array.from(new Set(items.map((i) => i.productId)));
    const [products, existingRows] = await Promise.all([
      this.productRepository.find({ where: { id: In(requestedIds) } }),
      this.cartRepository.find({ where: { userId, productId: In(requestedIds) } }),
    ]);

    const productById = new Map(products.map((p) => [p.id, p]));
    const existingByProductId = new Map(existingRows.map((row) => [row.productId, row]));
    const incomingTotals = new Map<string, number>();

    for (const item of items) {
      incomingTotals.set(item.productId, (incomingTotals.get(item.productId) || 0) + item.quantity);
    }

    const toSave: CartItem[] = [];
    for (const [productId, incomingQuantity] of incomingTotals.entries()) {
      const product = productById.get(productId);
      if (!product) continue;

      const existing = existingByProductId.get(productId);
      const mergedQuantity = Math.min(product.stock, (existing?.quantity ?? 0) + incomingQuantity);
      if (mergedQuantity <= 0) continue;

      if (existing) {
        existing.quantity = mergedQuantity;
        toSave.push(existing);
      } else {
        toSave.push(
          this.cartRepository.create({
            userId,
            productId,
            quantity: mergedQuantity,
          }),
        );
      }
    }

    if (toSave.length) {
      await this.cartRepository.save(toSave);
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
