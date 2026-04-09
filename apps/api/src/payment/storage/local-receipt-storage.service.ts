import { BadRequestException, Injectable } from '@nestjs/common';
import { createWriteStream, existsSync, mkdirSync, unlinkSync } from 'fs';
import { basename, join } from 'path';
import { pipeline, Transform } from 'stream';
import { promisify } from 'util';
import type { ReceiptUploadInput } from '../receipt-storage.service';

const pipelineAsync = promisify(pipeline);

const ALLOWED_RECEIPT_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export interface StoredReceipt {
  url: string;
}

@Injectable()
export class LocalReceiptStorageService {
  private get maxReceiptBytes(): number {
    return Number(process.env.RECEIPT_MAX_BYTES || 5 * 1024 * 1024);
  }

  private get uploadDir(): string {
    return process.env.RECEIPT_UPLOAD_DIR?.trim() || join(process.cwd(), 'uploads', 'receipts');
  }

  private get publicBasePath(): string {
    return process.env.RECEIPT_PUBLIC_BASE_PATH?.trim() || '/uploads/receipts';
  }

  async save(input: ReceiptUploadInput): Promise<StoredReceipt> {
    if (!ALLOWED_RECEIPT_MIME.has(input.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: ${[...ALLOWED_RECEIPT_MIME].join(', ')}`,
      );
    }

    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }

    const safeBase = basename(input.filename).replace(/[^a-zA-Z0-9._-]/g, '_');
    const timestamp = Date.now();
    const storedName = `${input.orderId}-${timestamp}-${safeBase}`;
    const filePath = join(this.uploadDir, storedName);
    const fileUrl = `${this.publicBasePath}/${storedName}`;

    const readStream = input.createReadStream();
    let received = 0;
    const sizeLimit = new Transform({
      transform: (chunk: Buffer, _enc, callback) => {
        received += chunk.length;
        if (received > this.maxReceiptBytes) {
          callback(
            new BadRequestException(
              `File too large (max ${Math.floor(this.maxReceiptBytes / (1024 * 1024))} MB)`,
            ),
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
          /* ignore cleanup failure */
        }
      }
      throw err;
    }

    return { url: fileUrl };
  }
}
