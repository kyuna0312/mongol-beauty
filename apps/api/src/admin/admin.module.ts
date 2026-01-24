import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminResolver } from './admin.resolver';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [OrderModule],
  providers: [AdminService, AdminResolver],
})
export class AdminModule {}
