import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { Order, OrderStatus } from './order.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { OrderService } from './order.service';
import { User } from '../user/user.entity';
import { buildInternalSignature } from '../common/internal-request-auth';
import { InternalServiceResilienceService } from '../common/internal-service-resilience.service';
import { getRequestContext } from '../common/request-context';
import { PrometheusMetricsService } from '../common/prometheus/prometheus-metrics.service';
import { buildAdminOrdersListPath } from './order-admin-list-path';

type Requester = { userId?: string; isAdmin?: boolean };

@Injectable()
export class OrderGatewayService {
  constructor(
    private readonly localOrderService: OrderService,
    private readonly resilience: InternalServiceResilienceService,
    @Optional() private readonly metrics?: PrometheusMetricsService,
  ) {}

  private getInternalToken(): string {
    const token = (process.env.INTERNAL_SERVICE_TOKEN || '').trim();
    if (!token && process.env.NODE_ENV !== 'test') {
      throw new InternalServerErrorException('INTERNAL_SERVICE_TOKEN is required');
    }
    return token || 'test-only-internal-service-token';
  }

  private get orderServiceUrl(): string | null {
    const url = process.env.ORDER_SERVICE_URL?.trim();
    return url ? url.replace(/\/$/, '') : null;
  }

  private getInternalHeaders(requester?: Requester): Record<string, string> {
    return {
      'content-type': 'application/json',
      'x-internal-token': this.getInternalToken(),
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
    if (!this.resilience.canRequest('order-service')) {
      this.metrics?.recordInternalOutcome('order-service', 'circuit_blocked');
      throw new InternalServerErrorException('Order service circuit breaker is open');
    }
    const bodyString = typeof options.body === 'string' ? options.body : '';
    const timestamp = String(Date.now());
    const method = (options.method || 'GET').toUpperCase();
    const signature = buildInternalSignature({ method, path, timestamp, body: bodyString });

    const ctx = getRequestContext();
    const headers = {
      ...this.getInternalHeaders(options.requester),
      'x-internal-timestamp': timestamp,
      'x-internal-signature': signature,
      ...(ctx
        ? { 'x-request-id': ctx.requestId, 'x-trace-id': ctx.traceId }
        : {}),
      ...(options.headers || {}),
    };

    const timeoutMs = Number(process.env.INTERNAL_REQUEST_TIMEOUT_MS || 5000);
    let lastError: unknown;
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      const started = performance.now();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(`${base}${path}`, {
          ...options,
          headers,
          signal: controller.signal,
        });
        clearTimeout(timer);
        const elapsedSec = (performance.now() - started) / 1000;
        if (response.status >= 500 && attempt < 2) {
          this.metrics?.recordInternalOutcome('order-service', 'error', elapsedSec);
          this.metrics?.recordRetry('order-service');
          continue;
        }
        if (!response.ok) {
          this.metrics?.recordInternalOutcome('order-service', 'error', elapsedSec);
          const body = await response.text();
          if (response.status === 404) throw new NotFoundException(body || 'Order not found');
          if (response.status === 403) throw new ForbiddenException(body || 'Forbidden');
          if (response.status === 400) throw new BadRequestException(body || 'Bad request');
          throw new InternalServerErrorException(body || 'Order service error');
        }
        this.resilience.recordSuccess('order-service');
        this.metrics?.recordInternalOutcome('order-service', 'success', elapsedSec);
        if (response.status === 204) return undefined as T;
        return (await response.json()) as T;
      } catch (error) {
        clearTimeout(timer);
        if (error instanceof HttpException) {
          throw error;
        }
        lastError = error;
        const elapsedSec = (performance.now() - started) / 1000;
        const isTimeout = error instanceof Error && error.name === 'AbortError';
        this.resilience.recordFailure('order-service', isTimeout);
        this.metrics?.recordInternalOutcome(
          'order-service',
          isTimeout ? 'timeout' : 'error',
          elapsedSec,
        );
        if (attempt >= 2) {
          break;
        }
        this.metrics?.recordRetry('order-service');
      }
    }

    if (lastError instanceof Error && lastError.name === 'AbortError') {
      throw new InternalServerErrorException('Order service request timed out');
    }
    throw lastError instanceof Error
      ? new InternalServerErrorException(lastError.message)
      : new InternalServerErrorException('Order service error');
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

  async findAllAdminPaginated(params: {
    limit: number;
    offset: number;
    status?: OrderStatus;
  }): Promise<{ items: Order[]; total: number; limit: number; offset: number }> {
    if (!this.orderServiceUrl) {
      const { items, total } = await this.localOrderService.findAllAdminPaginated(params);
      return { items, total, limit: params.limit, offset: params.offset };
    }
    const path = buildAdminOrdersListPath(params);
    return this.request<{ items: Order[]; total: number; limit: number; offset: number }>(path, {
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
