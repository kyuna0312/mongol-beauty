import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Page } from './page.entity';
import { SiteSettings } from './site-settings.entity';
import { ContentResolver } from './content.resolver';
import { ContentService } from './content.service';
import { SiteSettingsService } from './site-settings.service';
import { SiteSettingsResolver } from './site-settings.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Page, SiteSettings]), AuthModule],
  providers: [ContentResolver, ContentService, SiteSettingsService, SiteSettingsResolver],
  exports: [ContentService, SiteSettingsService],
})
export class ContentModule {}
