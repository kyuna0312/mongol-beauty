import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { BlogPost } from './blog-post.entity';
import { BlogPostService } from './blog-post.service';
import { BlogPostResolver } from './blog-post.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([BlogPost]), AuthModule],
  providers: [BlogPostService, BlogPostResolver],
  exports: [BlogPostService],
})
export class BlogModule {}
