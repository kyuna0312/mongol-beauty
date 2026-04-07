import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from './page.entity';
import { UpsertPageInput } from './dto/upsert-page.input';

const DEFAULT_PAGES: Array<Pick<Page, 'slug' | 'title' | 'content' | 'isPublished'>> = [
  {
    slug: 'about',
    title: 'Бидний тухай',
    content:
      'Энд танай брэндийн тухай мэдээлэл орно.\n\n**Жишээ:** Markdown — гарчиг, жагсаалт, холбоос дэмжинэ.',
    isPublished: true,
  },
  {
    slug: 'faq',
    title: 'Түгээмэл асуулт',
    content: '### Жишээ асуулт\n\nТүгээмэл асуулт, хариултуудаа энд оруулна.',
    isPublished: true,
  },
  {
    slug: 'shipping',
    title: 'Хүргэлт',
    content: 'Хүргэлтийн нөхцөл, хугацаа, бүсчлэл.',
    isPublished: true,
  },
  {
    slug: 'returns',
    title: 'Буцаалт',
    content: 'Буцаалт, солилцооны нөхцөл.',
    isPublished: true,
  },
  {
    slug: 'privacy',
    title: 'Нууцлалын бодлого',
    content: 'Хэрэглэгчийн мэдээлэл хамгаалах бодлого.',
    isPublished: true,
  },
];

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
  ) {}

  async ensureDefaults(): Promise<void> {
    for (const page of DEFAULT_PAGES) {
      const existing = await this.pageRepository.findOne({ where: { slug: page.slug } });
      if (!existing) {
        await this.pageRepository.save(this.pageRepository.create(page));
      }
    }
  }

  async getPublishedBySlug(slug: string): Promise<Page | null> {
    await this.ensureDefaults();
    return this.pageRepository.findOne({
      where: { slug, isPublished: true },
    });
  }

  /** Admin-only: latest draft or published row by slug (for preview before publish). */
  async getBySlugForPreview(slug: string): Promise<Page | null> {
    await this.ensureDefaults();
    return this.pageRepository.findOne({ where: { slug } });
  }

  async getAllPagesForAdmin(): Promise<Page[]> {
    await this.ensureDefaults();
    return this.pageRepository.find({ order: { slug: 'ASC' } });
  }

  async upsertPage(input: UpsertPageInput): Promise<Page> {
    const existing = await this.pageRepository.findOne({ where: { slug: input.slug } });
    if (existing) {
      Object.assign(existing, input);
      return this.pageRepository.save(existing);
    }
    const created = this.pageRepository.create({
      ...input,
      isPublished: input.isPublished ?? true,
    });
    return this.pageRepository.save(created);
  }

  async deletePage(id: string): Promise<boolean> {
    const existing = await this.pageRepository.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Page not found');
    }
    await this.pageRepository.remove(existing);
    return true;
  }
}
