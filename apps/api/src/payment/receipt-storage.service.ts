import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { LocalReceiptStorageService, StoredReceipt } from './storage/local-receipt-storage.service';

export interface ReceiptUploadInput {
  orderId: string;
  filename: string;
  mimetype: string;
  createReadStream: () => NodeJS.ReadableStream;
}

@Injectable()
export class ReceiptStorageService {
  constructor(private readonly localStorage: LocalReceiptStorageService) {}

  async saveReceipt(input: ReceiptUploadInput): Promise<StoredReceipt> {
    const driver = (process.env.RECEIPT_STORAGE_DRIVER || 'local').trim().toLowerCase();
    if (driver === 'local') {
      return this.localStorage.save(input);
    }

    throw new InternalServerErrorException(
      `Unsupported RECEIPT_STORAGE_DRIVER: ${driver}. This project is configured for local storage only.`,
    );
  }
}
