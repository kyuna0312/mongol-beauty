import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { LocalReceiptStorageService, StoredReceipt } from './storage/local-receipt-storage.service';
import { R2ReceiptStorageService } from './storage/r2-receipt-storage.service';

export interface ReceiptUploadInput {
  orderId: string;
  filename: string;
  mimetype: string;
  createReadStream: () => NodeJS.ReadableStream;
}

@Injectable()
export class ReceiptStorageService {
  constructor(
    private readonly localStorage: LocalReceiptStorageService,
    private readonly r2Storage: R2ReceiptStorageService,
  ) {}

  async saveReceipt(input: ReceiptUploadInput): Promise<StoredReceipt> {
    const driver = (process.env.RECEIPT_STORAGE_DRIVER || 'local').trim().toLowerCase();
    if (driver === 'local') {
      return this.localStorage.save(input);
    }
    if (driver === 'r2') {
      return this.r2Storage.save(input);
    }

    throw new InternalServerErrorException(
      `Unsupported RECEIPT_STORAGE_DRIVER: "${driver}". Valid values: local, r2`,
    );
  }
}
