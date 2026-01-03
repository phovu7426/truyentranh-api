import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comic } from '@/shared/entities/comic.entity';
import { ComicStats } from '@/shared/entities/comic-stats.entity';
import { Chapter } from '@/shared/entities/chapter.entity';
import { ListService } from '@/common/base/services/list.service';
import { PUBLIC_COMIC_STATUSES, PUBLIC_CHAPTER_STATUSES } from '@/shared/enums';

@Injectable()
export class PublicComicsService extends ListService<Comic> {
  private get statsRepo(): Repository<ComicStats> {
    return this.repository.manager.getRepository(ComicStats);
  }

  private get chapterRepo(): Repository<Chapter> {
    return this.repository.manager.getRepository(Chapter);
  }

  constructor(
    @InjectRepository(Comic) protected readonly repo: Repository<Comic>,
  ) {
    super(repo);
  }

  /**
   * Override để chỉ lấy comics có status public
   */
  protected override prepareFilters(filters?: any, _options?: any): boolean | any {
    const prepared = { ...(filters || {}) };
    prepared.status = PUBLIC_COMIC_STATUSES;
    return prepared;
  }

  /**
   * Override để load relations
   */
  protected override prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    return {
      ...base,
      relations: ['categories', 'stats'],
    } as any;
  }

  /**
   * Lấy danh sách chapters của comic
   */
  async getChaptersBySlug(slug: string) {
    const comic = await this.repo.findOne({ where: { slug } });
    if (!comic) {
      return [];
    }

    return this.chapterRepo.find({
      where: { comic_id: comic.id, status: PUBLIC_CHAPTER_STATUSES[0] } as any,
      order: { chapter_index: 'ASC' },
      select: ['id', 'title', 'chapter_index', 'chapter_label', 'view_count', 'created_at'],
    });
  }

  /**
   * Lấy trending comics (theo view_count trong stats)
   */
  async getTrending(limit: number = 20) {
    const stats = await this.statsRepo.find({
      order: { view_count: 'DESC' },
      take: limit,
      relations: ['comic'],
    });

    return stats
      .map(s => s.comic)
      .filter((c): c is Comic => !!c && PUBLIC_COMIC_STATUSES.includes(c.status))
      .map(comic => ({
        ...comic,
        stats: stats.find(s => s.comic_id === comic.id),
      }));
  }

  /**
   * Lấy popular comics (theo follow_count trong stats)
   */
  async getPopular(limit: number = 20) {
    const stats = await this.statsRepo.find({
      order: { follow_count: 'DESC' },
      take: limit,
      relations: ['comic'],
    });

    return stats
      .map(s => s.comic)
      .filter((c): c is Comic => !!c && PUBLIC_COMIC_STATUSES.includes(c.status))
      .map(comic => ({
        ...comic,
        stats: stats.find(s => s.comic_id === comic.id),
      }));
  }

  /**
   * Lấy newest comics
   */
  async getNewest(limit: number = 20) {
    return this.repo.find({
      where: { status: PUBLIC_COMIC_STATUSES[0] } as any,
      order: { created_at: 'DESC' },
      take: limit,
      relations: ['categories', 'stats'],
    });
  }
}

