import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogPost } from './blog-post.entity';
import { CreateBlogPostInput } from './dto/create-blog-post.input';
import { UpdateBlogPostInput } from './dto/update-blog-post.input';

@Injectable()
export class BlogPostService {
  constructor(
    @InjectRepository(BlogPost)
    private readonly repo: Repository<BlogPost>,
  ) {}

  findAll(publishedOnly = true): Promise<BlogPost[]> {
    if (publishedOnly) {
      return this.repo.find({
        where: { isPublished: true },
        order: { publishedAt: 'DESC', createdAt: 'DESC' },
      });
    }
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findBySlug(slug: string): Promise<BlogPost | null> {
    return this.repo.findOne({ where: { slug } });
  }

  async create(input: CreateBlogPostInput): Promise<BlogPost> {
    const post = this.repo.create({
      ...input,
      publishedAt: input.isPublished ? new Date() : null,
    });
    return this.repo.save(post);
  }

  async update(id: string, input: UpdateBlogPostInput): Promise<BlogPost> {
    const post = await this.repo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found');

    const wasPublished = post.isPublished;
    Object.assign(post, input);

    if (!wasPublished && input.isPublished) {
      post.publishedAt = new Date();
    } else if (input.isPublished === false) {
      post.publishedAt = null;
    }

    return this.repo.save(post);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
