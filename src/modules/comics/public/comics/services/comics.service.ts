import { Injectable } from '@nestjs/common';
import { PUBLIC_CHAPTER_STATUSES, PUBLIC_COMIC_STATUSES } from '@/shared/enums';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaListService, PrismaListBag } from '@/common/base/services/prisma/prisma-list.service';
import { buildOrderBy, toPlain } from '@/common/base/services/prisma/prisma.utils';

type ComicBag = PrismaListBag & {
  Model: any;
  Where: any;
  Select: any;
  Include: any;
  OrderBy: any;
};

@Injectable()
export class PublicComicsService extends PrismaListService<ComicBag> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.comic, ['id', 'created_at', 'view_count', 'follow_count'], 'id:DESC');
  }

  protected override async prepareFilters(filters?: any, _options?: any): Promise<any> {
    return {
      ...(filters || {}),
      status: { in: PUBLIC_COMIC_STATUSES },
    };
  }

  protected override prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    const allowStatsSort = ['view_count', 'follow_count'];
    const [sortFieldRaw, sortDirRaw] = String(base.sort || '').split(':');
    const sortField = sortFieldRaw || '';
    const sortDirection =
      (sortDirRaw || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

    const orderBy = allowStatsSort.includes(sortField)
      ? {
          stats: {
            [sortField]: sortDirection,
          },
        }
      : base.orderBy;
    return {
      ...base,
      include: { categoryLinks: { include: { category: true } }, stats: true },
      orderBy,
    };
  }

  protected override async afterGetList(data: any[]) {
    return data.map((comic: any) => {
      const categories = comic.categoryLinks?.map((l: any) => l.category).filter(Boolean) ?? [];
      return { ...comic, categories };
    });
  }

  protected override async afterGetOne(comic: any) {
    if (!comic) return null;
    const categories = comic.categoryLinks?.map((l: any) => l.category).filter(Boolean) ?? [];
    return { ...comic, categories };
  }

  async getBySlug(slug: string) {
    return this.getOne({ slug });
  }

  async getChaptersBySlug(slug: string) {
    const comic = await this.prisma.comic.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!comic) return [];
    const chapters = await this.prisma.chapter.findMany({
      where: { comic_id: comic.id, status: PUBLIC_CHAPTER_STATUSES[0] },
      orderBy: { chapter_index: 'asc' },
      select: {
        id: true,
        title: true,
        chapter_index: true,
        chapter_label: true,
        view_count: true,
        created_at: true,
      },
    });
    return toPlain(chapters);
  }

  async getTrending(limit: number = 20) {
    const { data } = await this.getList(undefined, { limit, sort: 'view_count:desc' });
    return data;
  }

  async getPopular(limit: number = 20) {
    const { data } = await this.getList(undefined, { limit, sort: 'follow_count:desc' });
    return data;
  }

  async getNewest(limit: number = 20) {
    const { data } = await this.getList(undefined, { limit, sort: 'created_at:desc' });
    return data;
  }
}

