import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminResolver } from './admin.resolver';
import { OrderModule } from '../order/order.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [OrderModule, AuthModule],
  providers: [AdminService, AdminResolver],
})
export class AdminModule {}
