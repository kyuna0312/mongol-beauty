import { Resolver, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { createWriteStream, mkdirSync, existsSync, unlinkSync } from 'fs';
import { join, basename } from 'path';
import { promisify } from 'util';
import { pipeline, Transform } from 'stream';
import { Order } from '../order/order.entity';
import { PaymentService } from './payment.service';
import { OrderService } from '../order/order.service';
import { GqlOptionalAuthGuard } from '../common/guards/gql-optional-auth.guard';
import { User } from '../user/user.entity';

const pipelineAsync = promisify(pipeline);

const ALLOWED_RECEIPT_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);
const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;

interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => NodeJS.ReadableStream;
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { GraphQLUpload } = require('graphql-upload');

@Resolver(() => Order)
export class PaymentResolver {
  constructor(
    private paymentService: PaymentService,
    private orderService: OrderService,
  ) {}

  @Mutation(() => Order)
  @UseGuards(GqlOptionalAuthGuard)
  async uploadPaymentReceipt(
    @Args('orderId', { type: () => ID }) orderId: string,
    @Args('file', { type: () => GraphQLUpload }) file: FileUpload,
    @Context() ctx: any,
  ): Promise<Order> {
    const user = ctx.req?.user as User | null | undefined;
    await this.orderService.assertCanUploadReceipt(orderId, user ?? null);

    const { createReadStream, filename, mimetype } = await file;
    if (!ALLOWED_RECEIPT_MIME.has(mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: ${[...ALLOWED_RECEIPT_MIME].join(', ')}`,
      );
    }

    const safeBase = basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
    const uploadDir = join(process.cwd(), 'uploads', 'receipts');

    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const timestamp = Date.now();
    const storedName = `${orderId}-${timestamp}-${safeBase}`;
    const filePath = join(uploadDir, storedName);
    const fileUrl = `/uploads/receipts/${storedName}`;

    const readStream = createReadStream();
    let received = 0;
    const sizeLimit = new Transform({
      transform(chunk: Buffer, _enc, callback) {
        received += chunk.length;
        if (received > MAX_RECEIPT_BYTES) {
          callback(
            new BadRequestException(`File too large (max ${MAX_RECEIPT_BYTES / (1024 * 1024)} MB)`),
          );
          return;
        }
        callback(null, chunk);
      },
    });

    try {
      await pipelineAsync(readStream, sizeLimit, createWriteStream(filePath));
    } catch (err) {
      if (existsSync(filePath)) {
        try {
          unlinkSync(filePath);
        } catch {
          /* ignore */
        }
      }
      throw err;
    }

    await this.paymentService.uploadReceipt(orderId, fileUrl);
    return this.orderService.findOne(orderId);
  }
}
