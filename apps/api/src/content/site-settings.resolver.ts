import { Mutation, Query, Resolver, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SiteSettingsService } from './site-settings.service';
import { SiteSettings } from './site-settings.entity';
import { UpdateSiteSettingsInput } from './dto/update-site-settings.input';
import { GqlAdminGuard } from '../common/guards/gql-admin.guard';
import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';

@Resolver(() => SiteSettings)
export class SiteSettingsResolver {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @Query(() => SiteSettings)
  async siteSettings(): Promise<SiteSettings> {
    return this.siteSettingsService.getSettings();
  }

  @Mutation(() => SiteSettings)
  @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
  async updateSiteSettings(
    @Args('input') input: UpdateSiteSettingsInput,
  ): Promise<SiteSettings> {
    return this.siteSettingsService.updateSettings(input);
  }
}
