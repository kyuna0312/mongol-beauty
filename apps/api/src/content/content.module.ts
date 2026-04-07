import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Page } from './page.entity';
import { ContentResolver } from './content.resolver';
import { ContentService } from './content.service';

@Module({
  imports: [TypeOrmModule.forFeature([Page]), AuthModule],
  providers: [ContentResolver, ContentService],
  exports: [ContentService],
})
export class ContentModule {}
