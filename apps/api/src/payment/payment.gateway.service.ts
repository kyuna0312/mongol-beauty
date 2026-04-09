import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Order } from '../order/order.entity';
import { PaymentService } from './payment.service';

@Injectable()
export class PaymentGatewayService {
  constructor(private readonly localPaymentService: PaymentService) {}

  private get paymentServiceUrl(): string | null {
    const url = process.env.PAYMENT_SERVICE_URL?.trim();
    return url ? url.replace(/\/$/, '') : null;
  }

  private async request<T>(path: string, body: unknown): Promise<T> {
    const base = this.paymentServiceUrl;
    if (!base) {
      throw new InternalServerErrorException('PAYMENT_SERVICE_URL not configured');
    }
    const response = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-internal-token': process.env.INTERNAL_SERVICE_TOKEN || 'dev-internal-token',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const text = await response.text();
      if (response.status === 403) throw new ForbiddenException(text || 'Forbidden');
      if (response.status === 400) throw new BadRequestException(text || 'Bad request');
      throw new InternalServerErrorException(text || 'Payment service error');
    }
    return (await response.json()) as T;
  }

  async uploadReceipt(orderId: string, fileUrl: string): Promise<Order | void> {
    if (!this.paymentServiceUrl) {
      await this.localPaymentService.uploadReceipt(orderId, fileUrl);
      return;
    }
    return this.request<Order>('/internal/payments/upload-receipt', { orderId, fileUrl });
  }
}
