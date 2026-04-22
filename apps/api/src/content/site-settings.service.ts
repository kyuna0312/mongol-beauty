import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSettings } from './site-settings.entity';
import { UpdateSiteSettingsInput } from './dto/update-site-settings.input';

const DEFAULT_ID = 'default';

@Injectable()
export class SiteSettingsService {
  constructor(
    @InjectRepository(SiteSettings)
    private readonly repo: Repository<SiteSettings>,
  ) {}

  async getSettings(): Promise<SiteSettings> {
    let settings = await this.repo.findOne({ where: { id: DEFAULT_ID } });
    if (!settings) {
      settings = this.repo.create({ id: DEFAULT_ID });
      settings = await this.repo.save(settings);
    }
    return settings;
  }

  async updateSettings(input: UpdateSiteSettingsInput): Promise<SiteSettings> {
    const settings = await this.getSettings();
    Object.assign(settings, input);
    return this.repo.save(settings);
  }
}
