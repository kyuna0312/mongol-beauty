import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderStatus } from './order.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { User } from '../user/user.entity';
import { assertValidInternalSignature } from '../common/internal-request-auth';
import { buildAdminOrdersListPath } from './order-admin-list-path';

type RequesterUser = Pick<User, 'id' | 'isAdmin'>;

@Controller('internal/orders')
export class OrderInternalController {
  constructor(private readonly orderService: OrderService) {}

  private ensureInternalToken(token?: string) {
    const expected = (process.env.INTERNAL_SERVICE_TOKEN || '').trim();
    if (!expected && process.env.NODE_ENV !== 'test') {
      throw new ForbiddenException('INTERNAL_SERVICE_TOKEN is not configured');
    }
    if (token !== expected) {
      throw new ForbiddenException('Invalid internal token');
    }
  }

  private ensureSignedRequest(input: {
    method: string;
    path: string;
    timestamp?: string;
    signature?: string;
    body?: unknown;
  }) {
    const bodyString = input.body ? JSON.stringify(input.body) : '';
    assertValidInternalSignature({
      method: input.method,
      path: input.path,
      timestamp: input.timestamp,
      signature: input.signature,
      body: bodyString,
    });
  }

  @Post()
  async createOrder(
    @Headers('x-internal-token') token: string | undefined,
    @Headers('x-internal-timestamp') timestamp: string | undefined,
    @Headers('x-internal-signature') signature: string | undefined,
    @Headers('x-user-id') userId: string | undefined,
    @Headers('x-idempotency-key') idempotencyKey: string | undefined,
    @Body() body: { input: CreateOrderInput },
  ) {
    this.ensureInternalToken(token);
    this.ensureSignedRequest({
      method: 'POST',
      path: '/internal/orders',
      timestamp,
      signature,
      body,
    });
    if (!body?.input?.items?.length) {
      throw new BadRequestException('Order items are required');
    }
    return this.orderService.create(body.input, userId || undefined, idempotencyKey || undefined);
  }

  @Get()
  async getUserOrders(
    @Headers('x-internal-token') token: string | undefined,
    @Headers('x-internal-timestamp') timestamp: string | undefined,
    @Headers('x-internal-signature') signature: string | undefined,
    @Headers('x-user-id') userId: string | undefined,
  ) {
    this.ensureInternalToken(token);
    this.ensureSignedRequest({
      method: 'GET',
      path: '/internal/orders',
      timestamp,
      signature,
    });
    if (!userId) {
      throw new BadRequestException('x-user-id is required');
    }
    return this.orderService.findAllForUser(userId);
  }

  @Get('admin')
  async getAllOrders(
    @Headers('x-internal-token') token: string | undefined,
    @Headers('x-internal-timestamp') timestamp: string | undefined,
    @Headers('x-internal-signature') signature: string | undefined,
    @Headers('x-is-admin') isAdmin: string | undefined,
    @Query('limit') limitStr?: string,
    @Query('offset') offsetStr?: string,
    @Query('status') status?: OrderStatus,
  ) {
    const limit = Math.min(100, Math.max(1, Number.parseInt(limitStr || '20', 10) || 20));
    const offset = Math.max(0, Number.parseInt(offsetStr || '0', 10) || 0);
    const canonicalPath = buildAdminOrdersListPath({
      limit,
      offset,
      status: status || undefined,
    });
    this.ensureInternalToken(token);
    this.ensureSignedRequest({
      method: 'GET',
      path: canonicalPath,
      timestamp,
      signature,
    });
    if (isAdmin !== 'true') {
      throw new ForbiddenException('Admin only');
    }
    const { items, total } = await this.orderService.findAllAdminPaginated({
      limit,
      offset,
      status: status || undefined,
    });
    return { items, total, limit, offset };
  }

  @Get(':id')
  async getOrder(
    @Headers('x-internal-token') token: string | undefined,
    @Headers('x-internal-timestamp') timestamp: string | undefined,
    @Headers('x-internal-signature') signature: string | undefined,
    @Headers('x-user-id') userId: string | undefined,
    @Headers('x-is-admin') isAdmin: string | undefined,
    @Param('id') id: string,
  ) {
    this.ensureInternalToken(token);
    this.ensureSignedRequest({
      method: 'GET',
      path: `/internal/orders/${id}`,
      timestamp,
      signature,
    });
    const requester: RequesterUser = {
      id: userId || '',
      isAdmin: isAdmin === 'true',
    };
    return this.orderService.findOneForRequester(id, requester as User);
  }

  @Post(':id/assert-receipt-upload')
  async assertReceiptUpload(
    @Headers('x-internal-token') token: string | undefined,
    @Headers('x-internal-timestamp') timestamp: string | undefined,
    @Headers('x-internal-signature') signature: string | undefined,
    @Headers('x-user-id') userId: string | undefined,
    @Headers('x-is-admin') isAdmin: string | undefined,
    @Param('id') id: string,
  ) {
    this.ensureInternalToken(token);
    this.ensureSignedRequest({
      method: 'POST',
      path: `/internal/orders/${id}/assert-receipt-upload`,
      timestamp,
      signature,
    });
    const requester: RequesterUser = {
      id: userId || '',
      isAdmin: isAdmin === 'true',
    };
    await this.orderService.assertCanUploadReceipt(id, requester as User);
    return { ok: true };
  }

  @Patch(':id/status')
  async updateStatus(
    @Headers('x-internal-token') token: string | undefined,
    @Headers('x-internal-timestamp') timestamp: string | undefined,
    @Headers('x-internal-signature') signature: string | undefined,
    @Headers('x-is-admin') isAdmin: string | undefined,
    @Param('id') id: string,
    @Body() body: { status: OrderStatus },
  ) {
    this.ensureInternalToken(token);
    this.ensureSignedRequest({
      method: 'PATCH',
      path: `/internal/orders/${id}/status`,
      timestamp,
      signature,
      body,
    });
    if (isAdmin !== 'true') {
      throw new ForbiddenException('Admin only');
    }
    return this.orderService.updateStatus(id, body.status);
  }

  @Patch(':id/receipt')
  async updateReceipt(
    @Headers('x-internal-token') token: string | undefined,
    @Headers('x-internal-timestamp') timestamp: string | undefined,
    @Headers('x-internal-signature') signature: string | undefined,
    @Param('id') id: string,
    @Body() body: { receiptUrl: string },
  ) {
    this.ensureInternalToken(token);
    this.ensureSignedRequest({
      method: 'PATCH',
      path: `/internal/orders/${id}/receipt`,
      timestamp,
      signature,
      body,
    });
    if (!body?.receiptUrl) {
      throw new BadRequestException('receiptUrl is required');
    }
    return this.orderService.updatePaymentReceipt(id, body.receiptUrl);
  }
}
