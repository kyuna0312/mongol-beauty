import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { basename } from 'path';
import type { ReceiptUploadInput } from '../receipt-storage.service';
import type { StoredReceipt } from './local-receipt-storage.service';

const ALLOWED_RECEIPT_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
]);

function getRequiredEnv(key: string): string {
  const val = process.env[key]?.trim();
  if (!val) throw new InternalServerErrorException(`Missing required env var: ${key}`);
  return val;
}

@Injectable()
export class R2ReceiptStorageService {
  private buildClient(): S3Client {
    const accountId = getRequiredEnv('CF_R2_ACCOUNT_ID');
    return new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: getRequiredEnv('CF_R2_ACCESS_KEY_ID'),
        secretAccessKey: getRequiredEnv('CF_R2_SECRET_ACCESS_KEY'),
      },
    });
  }

  private get bucket(): string {
    return getRequiredEnv('CF_R2_BUCKET');
  }

  private get publicBaseUrl(): string {
    // e.g. https://uploads.mcosmetics.mn  or  https://pub-xxx.r2.dev
    return getRequiredEnv('CF_R2_PUBLIC_URL').replace(/\/$/, '');
  }

  private get maxBytes(): number {
    return Number(process.env.RECEIPT_MAX_BYTES || 5 * 1024 * 1024);
  }

  async save(input: ReceiptUploadInput): Promise<StoredReceipt> {
    if (!ALLOWED_RECEIPT_MIME.has(input.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: ${[...ALLOWED_RECEIPT_MIME].join(', ')}`,
      );
    }

    const safeBase = basename(input.filename).replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `receipts/${input.orderId}-${Date.now()}-${safeBase}`;

    // Buffer stream with size guard
    const chunks: Buffer[] = [];
    let totalSize = 0;
    await new Promise<void>((resolve, reject) => {
      const stream = input.createReadStream() as import('stream').Readable;
      stream.on('data', (chunk: Buffer) => {
        totalSize += chunk.length;
        if (totalSize > this.maxBytes) {
          stream.destroy();
          reject(
            new BadRequestException(
              `File too large (max ${Math.floor(this.maxBytes / (1024 * 1024))} MB)`,
            ),
          );
          return;
        }
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      stream.on('end', resolve);
      stream.on('error', reject);
    });

    const body = Buffer.concat(chunks);
    const client = this.buildClient();

    await client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: input.mimetype,
        ContentLength: body.length,
        // Public-read ACL — only works if bucket has public access enabled
        ACL: 'public-read',
      }),
    );

    return { url: `${this.publicBaseUrl}/${key}` };
  }
}
