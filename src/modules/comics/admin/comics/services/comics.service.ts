import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaCrudService, PrismaCrudBag } from '@/common/base/services/prisma/prisma-crud.service';
import { StringUtil } from '@/core/utils/string.util';

type ComicBag = PrismaCrudBag & {
  Model: Prisma.ComicGetPayload<any>;
  Where: Prisma.ComicWhereInput;
  Select: Prisma.ComicSelect;
  Include: Prisma.ComicInclude;
  OrderBy: Prisma.ComicOrderByWithRelationInput;
  Create: Prisma.ComicUncheckedCreateInput & { category_ids?: number[] };
  Update: Prisma.ComicUncheckedUpdateInput & { category_ids?: number[] | null };
};

@Injectable()
export class ComicsService extends PrismaCrudService<ComicBag> {
  private tempCategoryIds: number[] | null = null;

  constructor(
    private readonly prisma: PrismaService,
  ) {
    super(prisma.comic, ['id', 'created_at', 'slug'], 'id:DESC');
  }

  protected override prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    return {
      ...base,
      include: {
        categoryLinks: {
          include: {
            category: true,
          },
        },
        stats: true,
      },
    };
  }

  protected async afterGetList(data: any[], _filters?: any, _options?: any): Promise<any[]> {
    return data.map(comic => {
      const categories = comic.categoryLinks?.map((link: any) => {
        const cat = link.category;
        return {
          id: Number(cat.id),
          name: cat.name,
          slug: cat.slug,
        };
      }) || [];
      return {
        ...this.convertBigIntFields(comic),
        categories,
      };
    });
  }

  protected async afterGetOne(entity: any, _where?: any, _options?: any): Promise<any> {
    if (!entity) return null;
    const categories = entity.categoryLinks?.map((link: any) => {
      const cat = link.category;
      return {
        id: Number(cat.id),
        name: cat.name,
        slug: cat.slug,
      };
    }) || [];
    return {
      ...this.convertBigIntFields(entity),
      categories,
    };
  }

  protected async beforeCreate(createDto: ComicBag['Create']): Promise<ComicBag['Create']> {
    const payload: any = { ...createDto };

    // Handle slug
    await this.ensureSlug(payload);

    // Handle category_ids - save for afterCreate
    if (payload.category_ids !== undefined) {
      this.tempCategoryIds = Array.isArray(payload.category_ids)
        ? payload.category_ids.map((id: any) => Number(id)).filter((id: number) => !isNaN(id))
        : [];
    } else {
      this.tempCategoryIds = null;
    }
    delete payload.category_ids;

    // Convert BigInt fields
    if (payload.created_user_id !== undefined && payload.created_user_id !== null) {
      payload.created_user_id = BigInt(payload.created_user_id);
    }
    if (payload.updated_user_id !== undefined && payload.updated_user_id !== null) {
      payload.updated_user_id = BigInt(payload.updated_user_id);
    }

    return payload;
  }

  protected async afterCreate(entity: any, _createDto: ComicBag['Create']): Promise<void> {
    const comicId = Number(entity.id);

    // Create ComicStats record
    await this.prisma.comicStats.create({
      data: {
        comic_id: BigInt(comicId),
        view_count: BigInt(0),
        follow_count: BigInt(0),
        rating_count: BigInt(0),
        rating_sum: BigInt(0),
      },
    });

    // Handle category_ids
    if (this.tempCategoryIds && this.tempCategoryIds.length > 0) {
      await this.syncCategories(comicId, this.tempCategoryIds);
    }

    this.tempCategoryIds = null;
  }

  protected async beforeUpdate(where: Prisma.ComicWhereInput, updateDto: ComicBag['Update']): Promise<ComicBag['Update']> {
    const payload: any = { ...updateDto };

    // Get current entity for slug check
    const existing = await this.getOne(where);
    if (existing) {
      await this.ensureSlug(payload, Number(existing.id), existing.slug);
    }

    // Handle category_ids - save for afterUpdate
    if (payload.category_ids !== undefined) {
      this.tempCategoryIds = payload.category_ids === null
        ? []
        : Array.isArray(payload.category_ids)
          ? payload.category_ids.map((id: any) => Number(id)).filter((id: number) => !isNaN(id))
          : [];
    } else {
      this.tempCategoryIds = null;
    }
    delete payload.category_ids;

    // Convert BigInt fields
    if (payload.created_user_id !== undefined && payload.created_user_id !== null) {
      payload.created_user_id = BigInt(payload.created_user_id);
    }
    if (payload.updated_user_id !== undefined && payload.updated_user_id !== null) {
      payload.updated_user_id = BigInt(payload.updated_user_id);
    }

    return payload;
  }

  protected async afterUpdate(entity: any, _updateDto: ComicBag['Update']): Promise<void> {
    const comicId = Number(entity.id);

    // Sync categories if category_ids was provided
    if (this.tempCategoryIds !== null) {
      await this.syncCategories(comicId, this.tempCategoryIds);
    }

    this.tempCategoryIds = null;
  }

  /**
   * Sync categories for a comic
   */
  private async syncCategories(comicId: number, categoryIds: number[]) {
    // Delete existing category links
    await this.prisma.comicCategoryOnComic.deleteMany({
      where: { comic_id: BigInt(comicId) },
    });

    // Create new category links
    if (categoryIds.length > 0) {
      // Verify all category IDs exist
      const categories = await this.prisma.comicCategory.findMany({
        where: {
          id: { in: categoryIds.map(id => BigInt(id)) },
          deleted_at: null,
        },
        select: { id: true },
      });

      if (categories.length !== categoryIds.length) {
        throw new BadRequestException('Một hoặc nhiều category ID không hợp lệ');
      }

      await this.prisma.comicCategoryOnComic.createMany({
        data: categoryIds.map(catId => ({
          comic_id: BigInt(comicId),
          comic_category_id: BigInt(catId),
        })),
      });
    }
  }

  /**
   * Assign categories to comic
   */
  async assignCategories(comicId: number, categoryIds: number[]) {
    const comic = await this.getOne({ id: BigInt(comicId) });
    if (!comic) {
      throw new BadRequestException('Comic not found');
    }

    await this.syncCategories(comicId, categoryIds);
    return this.getOne({ id: BigInt(comicId) });
  }

  /**
   * Restore comic
   */
  async restore(id: number) {
    const comic = await this.prisma.comic.findFirst({
      where: {
        id: BigInt(id),
        deleted_at: { not: null },
      },
    });

    if (!comic) {
      throw new BadRequestException('Comic not found');
    }

    await this.prisma.comic.update({
      where: { id: BigInt(id) },
      data: { deleted_at: null },
    });

    return this.getOne({ id: BigInt(id) });
  }

  /**
   * Ensure slug is generated from name if not provided
   */
  private async ensureSlug(data: any, excludeId?: number, currentSlug?: string): Promise<void> {
    // If no slug but has name → generate from name
    if (data.name && !data.slug) {
      data.slug = StringUtil.toSlug(data.name);
      return;
    }

    // If has slug → check uniqueness
    if (data.slug) {
      const normalizedSlug = StringUtil.toSlug(data.slug);
      const normalizedCurrentSlug = currentSlug ? StringUtil.toSlug(currentSlug) : null;

      // If slug unchanged, don't update it
      if (normalizedCurrentSlug && normalizedSlug === normalizedCurrentSlug) {
        delete data.slug;
        return;
      }

      // Check if slug already exists
      const existing = await this.prisma.comic.findFirst({
        where: {
          slug: normalizedSlug,
          deleted_at: null,
          ...(excludeId ? { id: { not: BigInt(excludeId) } } : {}),
        },
      });

      if (existing) {
        // Generate unique slug by appending number
        let counter = 1;
        let uniqueSlug = `${normalizedSlug}-${counter}`;
        while (await this.prisma.comic.findFirst({
          where: { slug: uniqueSlug, deleted_at: null },
        })) {
          counter++;
          uniqueSlug = `${normalizedSlug}-${counter}`;
        }
        data.slug = uniqueSlug;
      } else {
        data.slug = normalizedSlug;
      }
    }
  }

  /**
   * Convert BigInt fields to number for JSON serialization
   */
  private convertBigIntFields(entity: any): any {
    if (!entity) return entity;
    const converted = { ...entity };
    if (converted.id) converted.id = Number(converted.id);
    if (converted.created_user_id) converted.created_user_id = Number(converted.created_user_id);
    if (converted.updated_user_id) converted.updated_user_id = Number(converted.updated_user_id);
    if (converted.stats) {
      converted.stats = {
        ...converted.stats,
        comic_id: Number(converted.stats.comic_id),
        view_count: Number(converted.stats.view_count),
        follow_count: Number(converted.stats.follow_count),
        rating_count: Number(converted.stats.rating_count),
        rating_sum: Number(converted.stats.rating_sum),
      };
    }
    return converted;
  }

  /**
   * Simple list giống getList nhưng limit mặc định lớn hơn
   */
  async getSimpleList(filters?: any, options?: any) {
    const simpleOptions = {
      ...options,
      limit: options?.limit ?? 50,
      maxLimit: options?.maxLimit ?? 1000,
    };
    return this.getList(filters, simpleOptions);
  }

  /**
   * Wrapper update/delete để nhận id dạng number (giữ API cũ)
   */
  async update(id: number, data: ComicBag['Update']) {
    return super.update({ id: BigInt(id) } as any, data);
  }

  async delete(id: number) {
    return super.delete({ id: BigInt(id) } as any);
  }
}
