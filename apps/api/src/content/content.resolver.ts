import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ContentService } from './content.service';
import { Page } from './page.entity';
import { UpsertPageInput } from './dto/upsert-page.input';
import { GqlAdminGuard } from '../common/guards/gql-admin.guard';
import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';

@Resolver(() => Page)
export class ContentResolver {
  constructor(private readonly contentService: ContentService) {}

  @Query(() => Page, { nullable: true })
  async page(@Args('slug') slug: string): Promise<Page | null> {
    return this.contentService.getPublishedBySlug(slug);
  }

  @Query(() => Page, { nullable: true })
  @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
  async pagePreview(@Args('slug') slug: string): Promise<Page | null> {
    return this.contentService.getBySlugForPreview(slug);
  }

  @Query(() => [Page])
  @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
  async adminPages(): Promise<Page[]> {
    return this.contentService.getAllPagesForAdmin();
  }

  @Mutation(() => Page)
  @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
  async upsertPage(@Args('input') input: UpsertPageInput): Promise<Page> {
    return this.contentService.upsertPage(input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
  async deletePage(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.contentService.deletePage(id);
  }
}
