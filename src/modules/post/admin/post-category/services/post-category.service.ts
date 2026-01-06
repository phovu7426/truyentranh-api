import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaCrudService, PrismaCrudBag } from '@/common/base/services/prisma/prisma-crud.service';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { StringUtil } from '@/core/utils/string.util';

type AdminPostCategoryBag = PrismaCrudBag & {
  Model: Prisma.PostCategoryGetPayload<{
    include: {
      parent: true;
      children: true;
    };
  }>;
  Where: Prisma.PostCategoryWhereInput;
  Select: Prisma.PostCategorySelect;
  Include: Prisma.PostCategoryInclude;
  OrderBy: Prisma.PostCategoryOrderByWithRelationInput;
  Create: Prisma.PostCategoryUncheckedCreateInput;
  Update: Prisma.PostCategoryUncheckedUpdateInput;
};

@Injectable()
export class PostCategoryService extends PrismaCrudService<AdminPostCategoryBag> {
  constructor(
    private readonly prisma: PrismaService,
  ) {
    super(prisma.postCategory, ['id', 'sort_order', 'created_at', 'name', 'slug'], 'id:DESC');
  }

  protected override prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    // Prisma client in this project does not allow select + include together.
    // Build a single select that also selects nested relations.
    const defaultSelect: Prisma.PostCategorySelect = {
      id: true,
      name: true,
      slug: true,
      description: true,
      image: true,
      sort_order: true,
      status: true,
      created_at: true,
      updated_at: true,
      parent: { select: { id: true, name: true, slug: true } },
      children: { select: { id: true, name: true, slug: true } },
    };

    const finalSelect = queryOptions?.select ?? defaultSelect;

    return {
      ...base,
      select: finalSelect,
      include: undefined,
    };
  }

  protected override async beforeCreate(createDto: AdminPostCategoryBag['Create']): Promise<AdminPostCategoryBag['Create']> {
    const payload: any = { ...createDto };
    this.normalizeSlug(payload);
    payload.parent_id = this.toBigInt(payload.parent_id);
    return payload;
  }

  protected override async beforeUpdate(
    where: Prisma.PostCategoryWhereInput,
    updateDto: AdminPostCategoryBag['Update'],
  ): Promise<AdminPostCategoryBag['Update']> {
    const payload: any = { ...updateDto };
    this.normalizeSlug(payload);
    payload.parent_id = this.toBigInt(payload.parent_id);
    if ((where as any).id !== undefined) {
      (where as any).id = this.toBigInt((where as any).id);
    }
    return payload;
  }

  protected override async afterGetList(data: AdminPostCategoryBag['Model'][]): Promise<AdminPostCategoryBag['Model'][]> {
    return data.map((item) => this.transform(item));
  }

  protected override async afterGetOne(entity: AdminPostCategoryBag['Model'] | null): Promise<AdminPostCategoryBag['Model'] | null> {
    if (!entity) return entity;
    return this.transform(entity);
  }

  override async getOne(where: Prisma.PostCategoryWhereInput, options?: any) {
    const normalizedWhere = { ...(where || {}) } as Prisma.PostCategoryWhereInput;
    if ((normalizedWhere as any).id !== undefined) {
      (normalizedWhere as any).id = this.toBigInt((normalizedWhere as any).id);
    }
    return super.getOne(normalizedWhere, options);
  }

  async getSimpleList(filters?: Prisma.PostCategoryWhereInput, options?: any) {
    const simpleOptions = {
      ...options,
      limit: options?.limit ?? 50,
      maxLimit: options?.maxLimit ?? 1000,
      sort: options?.sort ?? 'sort_order:ASC',
    };
    return this.getList(filters, simpleOptions);
  }

  // Giữ API cũ cho controller
  async update(id: number, data: AdminPostCategoryBag['Update']) {
    return super.update({ id: this.toBigInt(id) } as any, data);
  }

  async delete(id: number) {
    return super.delete({ id: this.toBigInt(id) } as any);
  }

  private transform(category: any) {
    if (category?.parent) {
      const { id, name, slug } = category.parent;
      category.parent = { id, name, slug };
    }
    if (Array.isArray(category?.children)) {
      category.children = category.children.map((child: any) => {
        const { id, name, slug } = child;
        return { id, name, slug };
      });
    }
    return category;
  }

  private normalizeSlug(data: any, currentSlug?: string) {
    if (data.name && !data.slug) {
      data.slug = StringUtil.toSlug(data.name);
      return;
    }
    if (data.slug) {
      const normalized = StringUtil.toSlug(data.slug);
      if (currentSlug && StringUtil.toSlug(currentSlug) === normalized) {
        delete data.slug;
      } else {
        data.slug = normalized;
      }
    }
  }

  private toBigInt(value?: number | string | bigint | null): bigint | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'bigint') return value;
    const num = typeof value === 'string' ? Number(value) : value;
    if (Number.isNaN(num)) return null;
    return BigInt(num);
  }
}

