import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaCrudService, PrismaCrudBag } from '@/common/base/services/prisma/prisma-crud.service';
import { StringUtil } from '@/core/utils/string.util';

type ComicCategoryBag = PrismaCrudBag & {
  Model: Prisma.ComicCategoryGetPayload<any>;
  Where: Prisma.ComicCategoryWhereInput;
  Select: Prisma.ComicCategorySelect;
  Include: Prisma.ComicCategoryInclude;
  OrderBy: Prisma.ComicCategoryOrderByWithRelationInput;
  Create: Prisma.ComicCategoryUncheckedCreateInput;
  Update: Prisma.ComicCategoryUncheckedUpdateInput;
};

@Injectable()
export class ComicCategoriesService extends PrismaCrudService<ComicCategoryBag> {
  constructor(
    private readonly prisma: PrismaService,
  ) {
    super(prisma.comicCategory, ['id', 'created_at', 'slug'], 'id:DESC');
  }

  protected async beforeCreate(createDto: ComicCategoryBag['Create']): Promise<ComicCategoryBag['Create']> {
    const payload: any = { ...createDto };
    await this.ensureSlug(payload);
    
    if (payload.created_user_id !== undefined && payload.created_user_id !== null) {
      payload.created_user_id = BigInt(payload.created_user_id);
    }
    if (payload.updated_user_id !== undefined && payload.updated_user_id !== null) {
      payload.updated_user_id = BigInt(payload.updated_user_id);
    }
    
    return payload;
  }

  protected async beforeUpdate(where: Prisma.ComicCategoryWhereInput, updateDto: ComicCategoryBag['Update']): Promise<ComicCategoryBag['Update']> {
    const payload: any = { ...updateDto };
    
    const existing = await this.getOne(where);
    if (existing) {
      await this.ensureSlug(payload, Number(existing.id), existing.slug);
    }
    
    if (payload.created_user_id !== undefined && payload.created_user_id !== null) {
      payload.created_user_id = BigInt(payload.created_user_id);
    }
    if (payload.updated_user_id !== undefined && payload.updated_user_id !== null) {
      payload.updated_user_id = BigInt(payload.updated_user_id);
    }
    
    return payload;
  }

  protected override async afterGetOne(entity: any, _where?: any, _options?: any): Promise<any> {
    if (!entity) return null;
    return this.convertBigIntFields(entity);
  }

  protected override async afterGetList(data: any[], _filters?: any, _options?: any): Promise<any[]> {
    return data.map(item => this.convertBigIntFields(item));
  }

  private async ensureSlug(data: any, excludeId?: number, currentSlug?: string): Promise<void> {
    if (data.name && !data.slug) {
      data.slug = StringUtil.toSlug(data.name);
      return;
    }

    if (data.slug) {
      const normalizedSlug = StringUtil.toSlug(data.slug);
      const normalizedCurrentSlug = currentSlug ? StringUtil.toSlug(currentSlug) : null;

      if (normalizedCurrentSlug && normalizedSlug === normalizedCurrentSlug) {
        delete data.slug;
        return;
      }

      const existing = await this.prisma.comicCategory.findFirst({
        where: {
          slug: normalizedSlug,
          deleted_at: null,
          ...(excludeId ? { id: { not: BigInt(excludeId) } } : {}),
        },
      });

      if (existing) {
        let counter = 1;
        let uniqueSlug = `${normalizedSlug}-${counter}`;
        while (await this.prisma.comicCategory.findFirst({
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

  private convertBigIntFields(entity: any): any {
    if (!entity) return entity;
    const converted = { ...entity };
    if (converted.id) converted.id = Number(converted.id);
    if (converted.parent_id) converted.parent_id = Number(converted.parent_id);
    if (converted.created_user_id) converted.created_user_id = Number(converted.created_user_id);
    if (converted.updated_user_id) converted.updated_user_id = Number(converted.updated_user_id);
    return converted;
  }
}
