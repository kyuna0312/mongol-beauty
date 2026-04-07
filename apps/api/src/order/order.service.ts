import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Product } from '../product/product.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { User } from '../user/user.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async create(input: CreateOrderInput, userId?: string): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);
      const orderRepo = manager.getRepository(Order);
      const orderItemRepo = manager.getRepository(OrderItem);

      let totalPrice = 0;
      const items: OrderItem[] = [];

      for (const itemInput of input.items) {
        const product = await productRepo.findOne({
          where: { id: itemInput.productId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) {
          throw new NotFoundException(`Product ${itemInput.productId} not found`);
        }

        if (product.stock < itemInput.quantity) {
          throw new BadRequestException(`Insufficient stock for product ${product.name}`);
        }

        await productRepo.decrement({ id: product.id }, 'stock', itemInput.quantity);

        const itemPrice = product.price * itemInput.quantity;
        totalPrice += itemPrice;

        const orderItem = orderItemRepo.create({
          productId: itemInput.productId,
          quantity: itemInput.quantity,
          price: product.price,
        });
        items.push(orderItem);
      }

      const order = orderRepo.create({
        userId,
        status: OrderStatus.WAITING_PAYMENT,
        totalPrice,
        items,
      });

      const saved = await orderRepo.save(order);
      return orderRepo.findOneOrFail({
        where: { id: saved.id },
        relations: ['items', 'items.product', 'user'],
      });
    });
  }

  /** All orders — use only from admin paths. */
  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['items', 'items.product', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllForUser(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
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

  /**
   * Enforces: admin sees any order; user sees own orders; guest orders (no userId) are readable without auth.
   */
  async findOneForRequester(id: string, user: User | null): Promise<Order> {
    const order = await this.findOne(id);
    if (user?.isAdmin) {
      return order;
    }
    if (order.userId) {
      if (!user || user.id !== order.userId) {
        throw new ForbiddenException('Not allowed to view this order');
      }
    }
    return order;
  }

  async assertCanUploadReceipt(orderId: string, user: User | null): Promise<void> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    if (order.status !== OrderStatus.WAITING_PAYMENT) {
      throw new BadRequestException('Receipt can only be uploaded while order is waiting for payment');
    }
    if (order.userId) {
      if (!user || user.id !== order.userId) {
        throw new ForbiddenException('Not allowed to upload receipt for this order');
      }
    }
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
