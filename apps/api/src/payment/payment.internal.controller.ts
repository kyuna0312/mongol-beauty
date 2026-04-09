import { BadRequestException, Body, Controller, ForbiddenException, Headers, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('internal/payments')
export class PaymentInternalController {
  constructor(private readonly paymentService: PaymentService) {}

  private ensureInternalToken(token?: string) {
    const expected = process.env.INTERNAL_SERVICE_TOKEN || 'dev-internal-token';
    if (token !== expected) {
      throw new ForbiddenException('Invalid internal token');
    }
  }

  @Post('upload-receipt')
  async uploadReceipt(
    @Headers('x-internal-token') token: string | undefined,
    @Body() body: { orderId: string; fileUrl: string },
  ) {
    this.ensureInternalToken(token);
    if (!body?.orderId || !body?.fileUrl) {
      throw new BadRequestException('orderId and fileUrl are required');
    }
    await this.paymentService.uploadReceipt(body.orderId, body.fileUrl);
    return { ok: true };
  }
}
