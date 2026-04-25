import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Voucher } from './voucher.entity';

@Injectable()
export class VoucherService {
  constructor(
    @InjectRepository(Voucher)
    private voucherRepository: Repository<Voucher>,
  ) {}

  async validateVoucher(code: string): Promise<{ discountPercent: number }> {
    const voucher = await this.voucherRepository.findOne({ where: { code } });
    if (!voucher) throw new BadRequestException('Voucher олдсонгүй');
    if (voucher.usedById) throw new BadRequestException('Voucher аль хэдийн ашиглагдсан');
    if (voucher.expiresAt && voucher.expiresAt < new Date()) {
      throw new BadRequestException('Voucher хугацаа дууссан');
    }
    return { discountPercent: voucher.discountPercent };
  }

  async markUsed(code: string, userId: string): Promise<void> {
    await this.voucherRepository.update({ code }, { usedById: userId });
  }
}
