import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Optional,
} from '@nestjs/common';
import { Order } from '../order/order.entity';
import { PaymentService } from './payment.service';
import { buildInternalSignature } from '../common/internal-request-auth';
import { InternalServiceResilienceService } from '../common/internal-service-resilience.service';
import { getRequestContext } from '../common/request-context';
import { PrometheusMetricsService } from '../common/prometheus/prometheus-metrics.service';

@Injectable()
export class PaymentGatewayService {
  constructor(
    private readonly localPaymentService: PaymentService,
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

  private get paymentServiceUrl(): string | null {
    const url = process.env.PAYMENT_SERVICE_URL?.trim();
    return url ? url.replace(/\/$/, '') : null;
  }

  private async request<T>(path: string, body: unknown): Promise<T> {
    const base = this.paymentServiceUrl;
    if (!base) {
      throw new InternalServerErrorException('PAYMENT_SERVICE_URL not configured');
    }
    if (!this.resilience.canRequest('payment-service')) {
      this.metrics?.recordInternalOutcome('payment-service', 'circuit_blocked');
      throw new InternalServerErrorException('Payment service circuit breaker is open');
    }
    const bodyString = JSON.stringify(body);
    const timestamp = String(Date.now());
    const signature = buildInternalSignature({
      method: 'POST',
      path,
      timestamp,
      body: bodyString,
    });
    const timeoutMs = Number(process.env.INTERNAL_REQUEST_TIMEOUT_MS || 5000);
    const ctx = getRequestContext();

    let lastError: unknown;
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      const started = performance.now();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(`${base}${path}`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-internal-token': this.getInternalToken(),
            'x-internal-timestamp': timestamp,
            'x-internal-signature': signature,
            ...(ctx
              ? { 'x-request-id': ctx.requestId, 'x-trace-id': ctx.traceId }
              : {}),
          },
          body: bodyString,
          signal: controller.signal,
        });
        clearTimeout(timer);
        const elapsedSec = (performance.now() - started) / 1000;
        if (response.status >= 500 && attempt < 2) {
          this.metrics?.recordInternalOutcome('payment-service', 'error', elapsedSec);
          this.metrics?.recordRetry('payment-service');
          continue;
        }
        if (!response.ok) {
          this.metrics?.recordInternalOutcome('payment-service', 'error', elapsedSec);
          const text = await response.text();
          if (response.status === 403) throw new ForbiddenException(text || 'Forbidden');
          if (response.status === 400) throw new BadRequestException(text || 'Bad request');
          throw new InternalServerErrorException(text || 'Payment service error');
        }
        this.resilience.recordSuccess('payment-service');
        this.metrics?.recordInternalOutcome('payment-service', 'success', elapsedSec);
        return (await response.json()) as T;
      } catch (error) {
        clearTimeout(timer);
        if (error instanceof HttpException) {
          throw error;
        }
        lastError = error;
        const elapsedSec = (performance.now() - started) / 1000;
        const isTimeout = error instanceof Error && error.name === 'AbortError';
        this.resilience.recordFailure(
          'payment-service',
          isTimeout,
        );
        this.metrics?.recordInternalOutcome(
          'payment-service',
          isTimeout ? 'timeout' : 'error',
          elapsedSec,
        );
        if (attempt >= 2) break;
        this.metrics?.recordRetry('payment-service');
      }
    }
    if (lastError instanceof Error && lastError.name === 'AbortError') {
      throw new InternalServerErrorException('Payment service request timed out');
    }
    throw lastError instanceof Error
      ? new InternalServerErrorException(lastError.message)
      : new InternalServerErrorException('Payment service error');
  }

  async uploadReceipt(orderId: string, fileUrl: string): Promise<Order | void> {
    if (!this.paymentServiceUrl) {
      await this.localPaymentService.uploadReceipt(orderId, fileUrl);
      return;
    }
    return this.request<Order>('/internal/payments/upload-receipt', { orderId, fileUrl });
  }
}
