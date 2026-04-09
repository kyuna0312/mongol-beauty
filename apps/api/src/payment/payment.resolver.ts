import { Resolver, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Order } from '../order/order.entity';
import { PaymentGatewayService } from './payment.gateway.service';
import { OrderGatewayService } from '../order/order.gateway.service';
import { GqlOptionalAuthGuard } from '../common/guards/gql-optional-auth.guard';
import { User } from '../user/user.entity';
import { ReceiptStorageService } from './receipt-storage.service';

interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => NodeJS.ReadableStream;
}

const { GraphQLUpload } = require('graphql-upload');

@Resolver(() => Order)
export class PaymentResolver {
  constructor(
    private readonly paymentGatewayService: PaymentGatewayService,
    private readonly orderGatewayService: OrderGatewayService,
    private readonly receiptStorageService: ReceiptStorageService,
  ) {}

  @Mutation(() => Order)
  @UseGuards(GqlOptionalAuthGuard)
  async uploadPaymentReceipt(
    @Args('orderId', { type: () => ID }) orderId: string,
    @Args('file', { type: () => GraphQLUpload }) file: FileUpload,
    @Context() ctx: any,
  ): Promise<Order> {
    const user = ctx.req?.user as User | null | undefined;
    await this.orderGatewayService.assertCanUploadReceipt(orderId, user ?? null);

    const { createReadStream, filename, mimetype } = await file;
    const storedReceipt = await this.receiptStorageService.saveReceipt({
      orderId,
      filename,
      mimetype,
      createReadStream,
    });

    await this.paymentGatewayService.uploadReceipt(orderId, storedReceipt.url);
    return this.orderGatewayService.findOneForRequester(orderId, user ?? null);
  }
}
