import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { AuthModule } from '../auth/auth.module';
import { HttpJwtAuthGuard } from '../common/guards/http-jwt-auth.guard';
import { HttpAdminGuard } from '../common/guards/http-admin.guard';

@Module({
  imports: [AuthModule],
  controllers: [UploadController],
  providers: [HttpJwtAuthGuard, HttpAdminGuard],
})
export class UploadModule {}
