import { BadRequestException, Body, Controller, ForbiddenException, Headers, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { assertValidInternalSignature } from '../common/internal-request-auth';

@Controller('internal/payments')
export class PaymentInternalController {
  constructor(private readonly paymentService: PaymentService) {}

  private ensureInternalToken(token?: string) {
    const expected = (process.env.INTERNAL_SERVICE_TOKEN || '').trim();
    if (!expected && process.env.NODE_ENV !== 'test') {
      throw new ForbiddenException('INTERNAL_SERVICE_TOKEN is not configured');
    }
    if (token !== expected) {
      throw new ForbiddenException('Invalid internal token');
    }
  }

  private ensureSignedRequest(timestamp?: string, signature?: string, body?: unknown) {
    assertValidInternalSignature({
      method: 'POST',
      path: '/internal/payments/upload-receipt',
      timestamp,
      signature,
      body: body ? JSON.stringify(body) : '',
    });
  }

  @Post('upload-receipt')
  async uploadReceipt(
    @Headers('x-internal-token') token: string | undefined,
    @Headers('x-internal-timestamp') timestamp: string | undefined,
    @Headers('x-internal-signature') signature: string | undefined,
    @Body() body: { orderId: string; fileUrl: string },
  ) {
    this.ensureInternalToken(token);
    this.ensureSignedRequest(timestamp, signature, body);
    if (!body?.orderId || !body?.fileUrl) {
      throw new BadRequestException('orderId and fileUrl are required');
    }
    await this.paymentService.uploadReceipt(body.orderId, body.fileUrl);
    return { ok: true };
  }
}
