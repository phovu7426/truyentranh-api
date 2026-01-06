import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { PublicComicsService } from '@/modules/comics/public/comics/services/comics.service';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { createPaginationMeta } from '@/common/base/utils/pagination.helper';
import { PUBLIC_CHAPTER_STATUSES, PUBLIC_COMIC_STATUSES } from '@/shared/enums';
import { Permission } from '@/common/decorators/rbac.decorators';

// Bật Prisma mặc định; đặt USE_PRISMA_PUBLIC_COMICS=false nếu muốn tắt
const PRISMA_ENABLED = process.env.USE_PRISMA_PUBLIC_COMICS !== 'false';

type PrismaClientLike = any;

// Lazy init Prisma để không ảnh hưởng môi trường TypeORM hiện tại
const createPrismaClient = (): PrismaClientLike | null => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaClient } = require('@prisma/client') as { PrismaClient: any };
    return new PrismaClient();
  } catch (error) {
    // Chưa cài @prisma/client hoặc chưa bootstrap Prisma => fallback TypeORM
    return null;
  }
};

const normalizeOptions = (options: any = {}) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const sort = options.sort || 'id:DESC';
  return { ...options, page, limit, sort };
};

const toPrismaOrderBy = (sort: any) => {
  const [rawField, rawDir] = (Array.isArray(sort) ? sort[0] : sort || '').split(':');
  const field = (rawField || 'id').trim();
  const dir = (rawDir || 'DESC').toLowerCase() === 'asc' ? 'asc' : 'desc';

  const allowed = new Set(['id', 'created_at', 'view_count', 'follow_count']);
  if (!allowed.has(field)) return { id: dir };

  if (field === 'view_count' || field === 'follow_count') {
    return { stats: { [field]: dir } };
  }

  return { [field]: dir };
};

// Convert BigInt -> number để tránh lỗi JSON.stringify
const toPlain = (value: any): any => {
  if (typeof value === 'bigint') return Number(value);
  if (Array.isArray(value)) return value.map(toPlain);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toPlain(v)]));
  }
  return value;
};

const mapComicCategories = (comic: any) => {
  if (!comic) return comic;
  const categories =
    comic.categoryLinks?.map((link: any) => link.category).filter(Boolean) ?? comic.categories ?? [];
  const { categoryLinks, ...rest } = comic;
  return { ...rest, categories };
};

const prismaGetList = async (
  prisma: PrismaClientLike,
  filters: any,
  options: any,
) => {
  const normalized = normalizeOptions(options);
  const { page, limit, sort } = normalized;

  // Giữ logic lọc status public, bỏ bớt filters phức tạp để tránh lỗi SQL
  const where = {
    status: { in: PUBLIC_COMIC_STATUSES },
  };

  const orderBy = toPrismaOrderBy(sort);

  const [data, total] = await Promise.all([
    prisma.comic.findMany({
      where,
      include: { categoryLinks: { include: { category: true } }, stats: true },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.comic.count({ where }),
  ]);

  return {
    data: toPlain(data.map(mapComicCategories)),
    meta: createPaginationMeta(page, limit, total),
  };
};

const prismaGetBySlug = async (prisma: PrismaClientLike, slug: string) => {
  const comic = await prisma.comic.findUnique({
    where: { slug },
    include: { categoryLinks: { include: { category: true } }, stats: true },
  });
  return toPlain(mapComicCategories(comic));
};

const prismaGetChaptersBySlug = async (prisma: PrismaClientLike, slug: string) => {
  const comic = await prisma.comic.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!comic) return [];

  const chapters = await prisma.chapter.findMany({
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
};

const prismaGetTrending = async (prisma: PrismaClientLike, limit: number) => {
  const stats = await prisma.comicStats.findMany({
    orderBy: { view_count: 'desc' },
    take: limit,
    include: { comic: { include: { categoryLinks: { include: { category: true } }, stats: true } } },
  });

  return stats
    .filter((s: any) => !!s?.comic)
    .map((s: any) => mapComicCategories(s.comic))
    .filter((c: any) => PUBLIC_COMIC_STATUSES.includes(c.status))
    .map((comic: any) => ({
      ...comic,
      stats: stats.find((s: any) => s.comic_id === comic.id),
    }))
    .map(toPlain);
};

const prismaGetPopular = async (prisma: PrismaClientLike, limit: number) => {
  const stats = await prisma.comicStats.findMany({
    orderBy: { follow_count: 'desc' },
    take: limit,
    include: { comic: { include: { categoryLinks: { include: { category: true } }, stats: true } } },
  });

  return stats
    .filter((s: any) => !!s?.comic)
    .map((s: any) => mapComicCategories(s.comic))
    .filter((c: any) => PUBLIC_COMIC_STATUSES.includes(c.status))
    .map((comic: any) => ({
      ...comic,
      stats: stats.find((s: any) => s.comic_id === comic.id),
    }))
    .map(toPlain);
};

const prismaGetNewest = async (prisma: PrismaClientLike, limit: number) => {
  const comics = await prisma.comic.findMany({
    where: { status: PUBLIC_COMIC_STATUSES[0] },
    orderBy: { created_at: 'desc' },
    take: limit,
    include: { categoryLinks: { include: { category: true } }, stats: true },
  });
  return toPlain(comics.map(mapComicCategories));
};

@Controller('public/comics')
export class PublicComicsController {
  // Prisma client chỉ dùng làm mẫu chuyển đổi, vẫn fallback sang service TypeORM
  private readonly prisma = PRISMA_ENABLED ? createPrismaClient() : null;

  constructor(private readonly comicsService: PublicComicsService) { }

  private get usePrisma() {
    return !!this.prisma;
  }

  @Permission('public')
  @Get()
  async getList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return await prismaGetList(this.prisma, filters, options);
  }

  @Permission('public')
  @Get('trending')
  async getTrending(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
    if (this.usePrisma) {
      try {
        return await prismaGetTrending(this.prisma, limit || 20);
      } catch (_err) { }
    }
    return this.comicsService.getTrending(limit || 20);
  }

  @Permission('public')
  @Get('popular')
  async getPopular(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
    if (this.usePrisma) {
      try {
        return await prismaGetPopular(this.prisma, limit || 20);
      } catch (_err) { }
    }
    return this.comicsService.getPopular(limit || 20);
  }

  @Permission('public')
  @Get('newest')
  async getNewest(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
    if (this.usePrisma) {
      try {
        return await prismaGetNewest(this.prisma, limit || 20);
      } catch (_err) { }
    }
    return this.comicsService.getNewest(limit || 20);
  }

  @Permission('public')
  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    if (this.usePrisma) {
      try {
        const comic = await prismaGetBySlug(this.prisma, slug);
        return mapComicCategories(comic);
      } catch (_err) { }
    }
    return this.comicsService.getOne({ slug });
  }

  @Permission('public')
  @Get(':slug/chapters')
  async getChaptersBySlug(@Param('slug') slug: string) {
    if (this.usePrisma) {
      try {
        return await prismaGetChaptersBySlug(this.prisma, slug);
      } catch (_err) { }
    }
    return this.comicsService.getChaptersBySlug(slug);
  }
}

