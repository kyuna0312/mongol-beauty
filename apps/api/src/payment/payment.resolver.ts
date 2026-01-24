import { Resolver, Mutation, Args, ID } from '@nestjs/graphql';
import { Order } from '../order/order.entity';
import { PaymentService } from './payment.service';
import { OrderService } from '../order/order.service';
import { createWriteStream, mkdirSync } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { existsSync } from 'fs';

const pipelineAsync = promisify(pipeline);

// FileUpload interface compatible with GraphQL upload
interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => NodeJS.ReadableStream;
}

// Import GraphQLUpload - v13 supports CommonJS require
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { GraphQLUpload } = require('graphql-upload');

@Resolver(() => Order)
export class PaymentResolver {
  constructor(
    private paymentService: PaymentService,
    private orderService: OrderService,
  ) {}

  @Mutation(() => Order)
  async uploadPaymentReceipt(
    @Args('orderId', { type: () => ID }) orderId: string,
    @Args('file', { type: () => GraphQLUpload }) file: FileUpload,
  ): Promise<Order> {
    const { createReadStream, filename } = await file;
    const uploadDir = join(process.cwd(), 'uploads', 'receipts');
    
    // Ensure upload directory exists
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
    
    const timestamp = Date.now();
    const filePath = join(uploadDir, `${orderId}-${timestamp}-${filename}`);
    
    // In production, use cloud storage (S3, etc.)
    const fileUrl = `/uploads/receipts/${orderId}-${timestamp}-${filename}`;
    
    await pipelineAsync(
      createReadStream(),
      createWriteStream(filePath),
    );

    await this.paymentService.uploadReceipt(orderId, fileUrl);
    return this.orderService.findOne(orderId);
  }

  @Mutation(() => Order)
  async confirmPayment(@Args('orderId', { type: () => ID }) orderId: string): Promise<Order> {
    await this.paymentService.confirmPayment(orderId);
    return this.orderService.findOne(orderId);
  }
}
