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
} from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderStatus } from './order.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { User } from '../user/user.entity';

type RequesterUser = Pick<User, 'id' | 'isAdmin'>;

@Controller('internal/orders')
export class OrderInternalController {
  constructor(private readonly orderService: OrderService) {}

  private ensureInternalToken(token?: string) {
    const expected = process.env.INTERNAL_SERVICE_TOKEN || 'dev-internal-token';
    if (token !== expected) {
      throw new ForbiddenException('Invalid internal token');
    }
  }

  @Post()
  async createOrder(
    @Headers('x-internal-token') token: string | undefined,
    @Headers('x-user-id') userId: string | undefined,
    @Headers('x-idempotency-key') idempotencyKey: string | undefined,
    @Body() body: { input: CreateOrderInput },
  ) {
    this.ensureInternalToken(token);
    if (!body?.input?.items?.length) {
      throw new BadRequestException('Order items are required');
    }
    return this.orderService.create(body.input, userId || undefined, idempotencyKey || undefined);
  }

  @Get()
  async getUserOrders(
    @Headers('x-internal-token') token: string | undefined,
    @Headers('x-user-id') userId: string | undefined,
  ) {
    this.ensureInternalToken(token);
    if (!userId) {
      throw new BadRequestException('x-user-id is required');
    }
    return this.orderService.findAllForUser(userId);
  }

  @Get('admin')
  async getAllOrders(
    @Headers('x-internal-token') token: string | undefined,
    @Headers('x-is-admin') isAdmin: string | undefined,
  ) {
    this.ensureInternalToken(token);
    if (isAdmin !== 'true') {
      throw new ForbiddenException('Admin only');
    }
    return this.orderService.findAll();
  }

  @Get(':id')
  async getOrder(
    @Headers('x-internal-token') token: string | undefined,
    @Headers('x-user-id') userId: string | undefined,
    @Headers('x-is-admin') isAdmin: string | undefined,
    @Param('id') id: string,
  ) {
    this.ensureInternalToken(token);
    const requester: RequesterUser = {
      id: userId || '',
      isAdmin: isAdmin === 'true',
    };
    return this.orderService.findOneForRequester(id, requester as User);
  }

  @Post(':id/assert-receipt-upload')
  async assertReceiptUpload(
    @Headers('x-internal-token') token: string | undefined,
    @Headers('x-user-id') userId: string | undefined,
    @Headers('x-is-admin') isAdmin: string | undefined,
    @Param('id') id: string,
  ) {
    this.ensureInternalToken(token);
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
    @Headers('x-is-admin') isAdmin: string | undefined,
    @Param('id') id: string,
    @Body() body: { status: OrderStatus },
  ) {
    this.ensureInternalToken(token);
    if (isAdmin !== 'true') {
      throw new ForbiddenException('Admin only');
    }
    return this.orderService.updateStatus(id, body.status);
  }

  @Patch(':id/receipt')
  async updateReceipt(
    @Headers('x-internal-token') token: string | undefined,
    @Param('id') id: string,
    @Body() body: { receiptUrl: string },
  ) {
    this.ensureInternalToken(token);
    if (!body?.receiptUrl) {
      throw new BadRequestException('receiptUrl is required');
    }
    return this.orderService.updatePaymentReceipt(id, body.receiptUrl);
  }
}
