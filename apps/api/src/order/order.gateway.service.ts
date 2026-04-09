import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Order, OrderStatus } from './order.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { OrderService } from './order.service';
import { User } from '../user/user.entity';

type Requester = { userId?: string; isAdmin?: boolean };

@Injectable()
export class OrderGatewayService {
  constructor(private readonly localOrderService: OrderService) {}

  private get orderServiceUrl(): string | null {
    const url = process.env.ORDER_SERVICE_URL?.trim();
    return url ? url.replace(/\/$/, '') : null;
  }

  private getInternalHeaders(requester?: Requester): Record<string, string> {
    const token = process.env.INTERNAL_SERVICE_TOKEN || 'dev-internal-token';
    return {
      'content-type': 'application/json',
      'x-internal-token': token,
      'x-user-id': requester?.userId || '',
      'x-is-admin': requester?.isAdmin ? 'true' : 'false',
    };
  }

  private async request<T>(
    path: string,
    options: RequestInit & { requester?: Requester } = {},
  ): Promise<T> {
    const base = this.orderServiceUrl;
    if (!base) {
      throw new InternalServerErrorException('ORDER_SERVICE_URL not configured');
    }
    const response = await fetch(`${base}${path}`, {
      ...options,
      headers: {
        ...this.getInternalHeaders(options.requester),
        ...(options.headers || {}),
      },
    });
    if (!response.ok) {
      const body = await response.text();
      if (response.status === 404) throw new NotFoundException(body || 'Order not found');
      if (response.status === 403) throw new ForbiddenException(body || 'Forbidden');
      if (response.status === 400) throw new BadRequestException(body || 'Bad request');
      throw new InternalServerErrorException(body || 'Order service error');
    }
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }

  async create(input: CreateOrderInput, user?: User | null, idempotencyKey?: string): Promise<Order> {
    if (!this.orderServiceUrl) {
      return this.localOrderService.create(input, user?.id, idempotencyKey);
    }
    return this.request<Order>('/internal/orders', {
      method: 'POST',
      body: JSON.stringify({ input }),
      requester: { userId: user?.id, isAdmin: user?.isAdmin },
      headers: idempotencyKey ? { 'x-idempotency-key': idempotencyKey } : undefined,
    });
  }

  async findAllForUser(userId: string): Promise<Order[]> {
    if (!this.orderServiceUrl) {
      return this.localOrderService.findAllForUser(userId);
    }
    return this.request<Order[]>('/internal/orders', {
      method: 'GET',
      requester: { userId, isAdmin: false },
    });
  }

  async findAllAdmin(): Promise<Order[]> {
    if (!this.orderServiceUrl) {
      return this.localOrderService.findAll();
    }
    return this.request<Order[]>('/internal/orders/admin', {
      method: 'GET',
      requester: { isAdmin: true },
    });
  }

  async findOneForRequester(id: string, user: User | null): Promise<Order> {
    if (!this.orderServiceUrl) {
      return this.localOrderService.findOneForRequester(id, user);
    }
    return this.request<Order>(`/internal/orders/${id}`, {
      method: 'GET',
      requester: { userId: user?.id, isAdmin: user?.isAdmin },
    });
  }

  async assertCanUploadReceipt(orderId: string, user: User | null): Promise<void> {
    if (!this.orderServiceUrl) {
      await this.localOrderService.assertCanUploadReceipt(orderId, user);
      return;
    }
    await this.request<void>(`/internal/orders/${orderId}/assert-receipt-upload`, {
      method: 'POST',
      requester: { userId: user?.id, isAdmin: user?.isAdmin },
    });
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    if (!this.orderServiceUrl) {
      return this.localOrderService.updateStatus(id, status);
    }
    return this.request<Order>(`/internal/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
      requester: { isAdmin: true },
    });
  }

  async updatePaymentReceipt(id: string, receiptUrl: string): Promise<Order> {
    if (!this.orderServiceUrl) {
      return this.localOrderService.updatePaymentReceipt(id, receiptUrl);
    }
    return this.request<Order>(`/internal/orders/${id}/receipt`, {
      method: 'PATCH',
      body: JSON.stringify({ receiptUrl }),
      requester: { isAdmin: true },
    });
  }
}
