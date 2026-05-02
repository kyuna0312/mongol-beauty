import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BlogPostService } from './blog-post.service';
import { BlogPost } from './blog-post.entity';
import { CreateBlogPostInput } from './dto/create-blog-post.input';
import { UpdateBlogPostInput } from './dto/update-blog-post.input';
import { GqlAdminGuard } from '../common/guards/gql-admin.guard';
import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';

@Resolver(() => BlogPost)
export class BlogPostResolver {
  constructor(private readonly blogPostService: BlogPostService) {}

  @Query(() => [BlogPost])
  async blogPosts(): Promise<BlogPost[]> {
    return this.blogPostService.findAll(true);
  }

  @Query(() => BlogPost, { nullable: true })
  async blogPost(@Args('slug') slug: string): Promise<BlogPost | null> {
    return this.blogPostService.findBySlug(slug);
  }

  @Query(() => [BlogPost])
  @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
  async adminBlogPosts(): Promise<BlogPost[]> {
    return this.blogPostService.findAll(false);
  }

  @Mutation(() => BlogPost)
  @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
  async createBlogPost(@Args('input') input: CreateBlogPostInput): Promise<BlogPost> {
    return this.blogPostService.create(input);
  }

  @Mutation(() => BlogPost)
  @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
  async updateBlogPost(@Args('input') input: UpdateBlogPostInput): Promise<BlogPost> {
    return this.blogPostService.update(input.id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
  async deleteBlogPost(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.blogPostService.delete(id);
  }
}
