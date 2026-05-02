import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order, OrderStatus, PaymentMethod } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Product } from '../product/product.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { User } from '../user/user.entity';
import { SiteSettings } from '../content/site-settings.entity';
import { Voucher } from '../user/voucher.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Voucher)
    private voucherRepository: Repository<Voucher>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  private async findOneRaw(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'user'],
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return order;
  }

  async create(input: CreateOrderInput, userId?: string, idempotencyKey?: string): Promise<Order> {
    if (idempotencyKey) {
      const existing = await this.orderRepository.findOne({
        where: { idempotencyKey },
        relations: ['items', 'items.product', 'user'],
      });
      if (existing) {
        return existing;
      }
    }

    return this.dataSource.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);
      const orderRepo = manager.getRepository(Order);
      const orderItemRepo = manager.getRepository(OrderItem);
      const settingsRepo = manager.getRepository(SiteSettings);

      let subtotal = 0;
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

        subtotal += product.price * itemInput.quantity;

        const orderItem = orderItemRepo.create({
          productId: itemInput.productId,
          quantity: itemInput.quantity,
          price: product.price,
        });
        items.push(orderItem);
      }

      const settings = await settingsRepo.findOne({ where: { id: 'default' } });
      const feeThreshold = settings?.freeDeliveryThreshold ?? 200000;
      const feeAmount = settings?.deliveryFee ?? 5000;

      let discountPercent = 0;
      if (input.voucherCode) {
        const voucher = await manager.getRepository(Voucher).findOne({
          where: { code: input.voucherCode },
        });
        if (
          voucher &&
          !voucher.usedById &&
          (!voucher.expiresAt || voucher.expiresAt >= new Date())
        ) {
          discountPercent = voucher.discountPercent;
          await manager
            .getRepository(Voucher)
            .update({ code: input.voucherCode }, { usedById: userId ?? 'guest' });
        }
      }

      const discountAmount = Math.round(subtotal * (discountPercent / 100));
      const discountedSubtotal = subtotal - discountAmount;
      const deliveryFee = discountedSubtotal >= feeThreshold ? 0 : feeAmount;
      const totalPrice = discountedSubtotal + deliveryFee;

      const paymentMethod = input.paymentMethod ?? PaymentMethod.BANK_TRANSFER;
      const notes = [...(input.notes ?? [])];
      if (paymentMethod === PaymentMethod.CASH) {
        notes.push('Бэлэн мөнгөөр төлнө');
      }

      const order = orderRepo.create({
        userId,
        idempotencyKey,
        status: OrderStatus.WAITING_PAYMENT,
        totalPrice,
        deliveryFee,
        paymentMethod,
        items,
        deliveryAddress: input.deliveryAddress,
        deliveryNote: input.deliveryNote ?? null,
        notes,
      });

      const saved = await orderRepo.save(order);
      return orderRepo.findOneOrFail({
        where: { id: saved.id },
        relations: ['items', 'items.product', 'user'],
      });
    });
  }

  /** All orders — use only from admin paths (legacy / non-paginated). */
  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['items', 'items.product', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  /** Paginated admin list with optional status filter. */
  async findAllAdminPaginated(params: {
    limit: number;
    offset: number;
    status?: OrderStatus;
  }): Promise<{ items: Order[]; total: number }> {
    const [items, total] = await this.orderRepository.findAndCount({
      where: params.status ? { status: params.status } : {},
      relations: ['items', 'items.product', 'user'],
      order: { createdAt: 'DESC' },
      take: params.limit,
      skip: params.offset,
    });
    return { items, total };
  }

  async findAllForUser(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: ['items', 'items.product', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Order> {
    return this.findOneRaw(id);
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
    const order = await this.findOneRaw(id);
    order.status = status;
    order.updatedAt = new Date();
    return this.orderRepository.save(order);
  }

  async updatePaymentReceipt(id: string, receiptUrl: string): Promise<Order> {
    const order = await this.findOneRaw(id);
    order.paymentReceiptUrl = receiptUrl;
    return this.orderRepository.save(order);
  }
}
