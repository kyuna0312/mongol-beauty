import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { OrderItem } from './order-item.entity';
import { ProductService } from '../product/product.service';
import { CreateOrderInput } from './dto/create-order.input';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private productService: ProductService,
  ) {}

  async create(input: CreateOrderInput, userId?: string): Promise<Order> {
    const order = this.orderRepository.create({
      userId,
      status: OrderStatus.WAITING_PAYMENT,
    });

    let totalPrice = 0;
    const items: OrderItem[] = [];

    for (const itemInput of input.items) {
      const product = await this.productService.findOne(itemInput.productId);
      if (!product) {
        throw new NotFoundException(`Product ${itemInput.productId} not found`);
      }

      if (product.stock < itemInput.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}`);
      }

      const itemPrice = product.price * itemInput.quantity;
      totalPrice += itemPrice;

      const orderItem = this.orderItemRepository.create({
        productId: itemInput.productId,
        quantity: itemInput.quantity,
        price: product.price,
      });

      items.push(orderItem);
    }

    order.items = items;
    order.totalPrice = totalPrice;

    return this.orderRepository.save(order);
  }

  async findAll(userId?: string): Promise<Order[]> {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    return this.orderRepository.find({
      where,
      relations: ['items', 'items.product', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'user'],
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    order.status = status;
    return this.orderRepository.save(order);
  }

  async updatePaymentReceipt(id: string, receiptUrl: string): Promise<Order> {
    const order = await this.findOne(id);
    order.paymentReceiptUrl = receiptUrl;
    return this.orderRepository.save(order);
  }
}
