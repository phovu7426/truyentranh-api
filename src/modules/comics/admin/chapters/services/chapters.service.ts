import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaCrudService, PrismaCrudBag } from '@/common/base/services/prisma/prisma-crud.service';
import { ChapterStatus, PUBLIC_CHAPTER_STATUSES } from '@/shared/enums';
import { ComicNotificationService } from '@/modules/comics/core/services/comic-notification.service';

type ChapterBag = PrismaCrudBag & {
  Model: Prisma.ChapterGetPayload<any>;
  Where: Prisma.ChapterWhereInput;
  Select: Prisma.ChapterSelect;
  Include: Prisma.ChapterInclude;
  OrderBy: Prisma.ChapterOrderByWithRelationInput;
  Create: Prisma.ChapterUncheckedCreateInput & { pages?: Array<{ image_url: string; width?: number; height?: number; file_size?: number }> };
  Update: Prisma.ChapterUncheckedUpdateInput;
};

@Injectable()
export class ChaptersService extends PrismaCrudService<ChapterBag> {
  private tempPages: Array<{ image_url: string; width?: number; height?: number; file_size?: number }> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: ComicNotificationService,
  ) {
    super(prisma.chapter, ['id', 'chapter_index', 'created_at'], 'chapter_index:ASC');
  }

  protected override prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    return {
      ...base,
      include: {
        comic: true,
        pages: {
          orderBy: { page_number: 'asc' },
        },
      },
    };
  }

  protected async beforeCreate(createDto: ChapterBag['Create']): Promise<ChapterBag['Create']> {
    const payload: any = { ...createDto };

    // Validate chapter_index unique
    const comicId = payload.comic_id;
    const chapterIndex = payload.chapter_index;

    if (comicId && chapterIndex !== undefined) {
      const existing = await this.prisma.chapter.findFirst({
        where: {
          comic_id: BigInt(comicId),
          chapter_index: chapterIndex,
          deleted_at: null,
        },
      });
      if (existing) {
        throw new BadRequestException(`Chapter với index ${chapterIndex} đã tồn tại trong comic này`);
      }
    }

    // Save pages for afterCreate
    if (payload.pages !== undefined) {
      this.tempPages = Array.isArray(payload.pages) ? payload.pages : null;
    } else {
      this.tempPages = null;
    }
    delete payload.pages;

    // Convert BigInt fields
    if (payload.comic_id !== undefined) payload.comic_id = BigInt(payload.comic_id);
    if (payload.team_id !== undefined && payload.team_id !== null) payload.team_id = BigInt(payload.team_id);
    if (payload.created_user_id !== undefined && payload.created_user_id !== null) payload.created_user_id = BigInt(payload.created_user_id);
    if (payload.updated_user_id !== undefined && payload.updated_user_id !== null) payload.updated_user_id = BigInt(payload.updated_user_id);

    return payload;
  }

  protected async afterCreate(entity: any, _createDto: ChapterBag['Create']): Promise<void> {
    const chapterId = Number(entity.id);

    // Create pages if provided
    if (this.tempPages && this.tempPages.length > 0) {
      await this.prisma.chapterPage.createMany({
        data: this.tempPages.map((page, index) => ({
          chapter_id: BigInt(chapterId),
          page_number: index + 1,
          image_url: page.image_url,
          width: page.width,
          height: page.height,
          file_size: page.file_size ? BigInt(page.file_size) : null,
        })),
      });
    }

    // Notify followers if chapter is published
    if (entity.status === ChapterStatus.published) {
      await this.notificationService.notifyNewChapter(entity);
    }

    // Update comic's last chapter info if published
    if (entity.status === ChapterStatus.published && entity.comic_id) {
      await this.updateComicLastChapter(BigInt(entity.comic_id));
    }

    this.tempPages = null;
  }

  protected async beforeUpdate(where: Prisma.ChapterWhereInput, updateDto: ChapterBag['Update']): Promise<ChapterBag['Update']> {
    const payload: any = { ...updateDto };

    // Validate chapter_index unique if changed
    if (payload.chapter_index !== undefined) {
      const existing = await this.getOne(where);
      if (existing && payload.chapter_index !== existing.chapter_index) {
        const comicId = existing.comic_id ? Number(existing.comic_id) : null;
        if (comicId) {
          const duplicate = await this.prisma.chapter.findFirst({
            where: {
              comic_id: BigInt(comicId),
              chapter_index: payload.chapter_index,
              deleted_at: null,
              id: { not: BigInt(Number(existing.id)) },
            },
          });
          if (duplicate) {
            throw new BadRequestException(`Chapter với index ${payload.chapter_index} đã tồn tại trong comic này`);
          }
        }
      }
    }

    // Convert BigInt fields
    if (payload.comic_id !== undefined) payload.comic_id = BigInt(payload.comic_id);
    if (payload.team_id !== undefined && payload.team_id !== null) payload.team_id = BigInt(payload.team_id);
    if (payload.created_user_id !== undefined && payload.created_user_id !== null) payload.created_user_id = BigInt(payload.created_user_id);
    if (payload.updated_user_id !== undefined && payload.updated_user_id !== null) payload.updated_user_id = BigInt(payload.updated_user_id);

    return payload;
  }

  protected async afterUpdate(entity: any, updateDto: ChapterBag['Update']): Promise<void> {
    const updatePayload = updateDto as any;
    
    // Notify if status changed to published
    if (updatePayload.status === ChapterStatus.published) {
      const updatedChapter = await this.getOne({ id: BigInt(Number(entity.id)) });
      if (updatedChapter) {
        await this.notificationService.notifyNewChapter(updatedChapter);
      }
    }

    // Update comic's last chapter info if status changed to published
    // or if chapter_index/created_at changed (might affect last chapter)
    if (entity.comic_id && (
      updatePayload.status === ChapterStatus.published ||
      updatePayload.chapter_index !== undefined ||
      updatePayload.created_at !== undefined
    )) {
      await this.updateComicLastChapter(BigInt(entity.comic_id));
    }
  }

  /**
   * Upload/Update pages for chapter
   */
  async updatePages(chapterId: number, pages: Array<{
    image_url: string;
    width?: number;
    height?: number;
    file_size?: number;
  }>) {
    const chapter = await this.getOne({ id: BigInt(chapterId) });
    if (!chapter) {
      throw new BadRequestException('Chapter not found');
    }

    // Delete old pages
    await this.prisma.chapterPage.deleteMany({
      where: { chapter_id: BigInt(chapterId) },
    });

    // Create new pages
    if (pages && pages.length > 0) {
      await this.prisma.chapterPage.createMany({
        data: pages.map((page, index) => ({
          chapter_id: BigInt(chapterId),
          page_number: index + 1,
          image_url: page.image_url,
          width: page.width,
          height: page.height,
          file_size: page.file_size ? BigInt(page.file_size) : null,
        })),
      });
    }

    return this.getOne({ id: BigInt(chapterId) });
  }

  /**
   * Get pages of chapter
   */
  async getPages(chapterId: number) {
    const chapter = await this.getOne({ id: BigInt(chapterId) });
    if (!chapter) {
      throw new BadRequestException('Chapter not found');
    }

    const pages = await this.prisma.chapterPage.findMany({
      where: { chapter_id: BigInt(chapterId) },
      orderBy: { page_number: 'asc' },
    });

    return pages.map(page => ({
      ...page,
      id: Number(page.id),
      chapter_id: Number(page.chapter_id),
      file_size: page.file_size ? Number(page.file_size) : null,
    }));
  }

  /**
   * Restore chapter
   */
  async restore(id: number) {
    const chapter = await this.prisma.chapter.findFirst({
      where: {
        id: BigInt(id),
        deleted_at: { not: null },
      },
    });

    if (!chapter) {
      throw new BadRequestException('Chapter not found');
    }

    await this.prisma.chapter.update({
      where: { id: BigInt(id) },
      data: { deleted_at: null },
    });

    // Update comic's last chapter info after restore
    if (chapter.comic_id) {
      await this.updateComicLastChapter(chapter.comic_id);
    }

    return this.getOne({ id: BigInt(id) });
  }

  /**
   * Hook after delete - update comic's last chapter info
   */
  protected override async afterDelete(entity: any): Promise<void> {
    if (entity.comic_id) {
      await this.updateComicLastChapter(BigInt(entity.comic_id));
    }
  }

  /**
   * Helper: Update comic's last chapter info
   * Tìm chapter mới nhất (published) của comic và update comic fields
   */
  private async updateComicLastChapter(comicId: bigint): Promise<void> {
    // Tìm chapter mới nhất (published, không bị xóa)
    const lastChapter = await this.prisma.chapter.findFirst({
      where: {
        comic_id: comicId,
        status: { in: PUBLIC_CHAPTER_STATUSES },
        deleted_at: null,
      },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        created_at: true,
      },
    });

    // Update comic
    await this.prisma.comic.update({
      where: { id: comicId },
      data: {
        last_chapter_id: lastChapter?.id || null,
        last_chapter_updated_at: lastChapter?.created_at || null,
      },
    });
  }

  protected override async afterGetOne(entity: any, _where?: any, _options?: any): Promise<any> {
    if (!entity) return null;
    return this.convertBigIntFields(entity);
  }

  protected override async afterGetList(data: any[], _filters?: any, _options?: any): Promise<any[]> {
    return data.map(item => this.convertBigIntFields(item));
  }

  private convertBigIntFields(entity: any): any {
    if (!entity) return entity;
    const converted = { ...entity };
    if (converted.id) converted.id = Number(converted.id);
    if (converted.comic_id) converted.comic_id = Number(converted.comic_id);
    if (converted.team_id) converted.team_id = Number(converted.team_id);
    if (converted.view_count) converted.view_count = Number(converted.view_count);
    if (converted.created_user_id) converted.created_user_id = Number(converted.created_user_id);
    if (converted.updated_user_id) converted.updated_user_id = Number(converted.updated_user_id);
    if (converted.comic) {
      converted.comic = this.convertBigIntFields(converted.comic);
    }
    if (converted.pages) {
      converted.pages = converted.pages.map((page: any) => ({
        ...page,
        id: Number(page.id),
        chapter_id: Number(page.chapter_id),
        file_size: page.file_size ? Number(page.file_size) : null,
      }));
    }
    return converted;
  }
}
