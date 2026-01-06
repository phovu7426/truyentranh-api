import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaCrudService, PrismaCrudBag } from '@/common/base/services/prisma/prisma-crud.service';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { RequestContext } from '@/common/utils/request-context.util';
import { verifyGroupOwnership } from '@/common/utils/group-ownership.util';
import { StringUtil } from '@/core/utils/string.util';

type AdminPostBag = PrismaCrudBag & {
  Model: Prisma.PostGetPayload<{
    include: {
      primary_category: true;
      categories: { include: { category: true } };
      tags: { include: { tag: true } };
    };
  }>;
  Where: Prisma.PostWhereInput;
  Select: Prisma.PostSelect;
  Include: Prisma.PostInclude;
  OrderBy: Prisma.PostOrderByWithRelationInput;
  Create: Prisma.PostUncheckedCreateInput & { tag_ids?: number[]; category_ids?: number[] };
  Update: Prisma.PostUncheckedUpdateInput & { tag_ids?: number[]; category_ids?: number[] };
};

@Injectable()
export class PostService extends PrismaCrudService<AdminPostBag> {
  private tempTagIds: number[] | null = null;
  private tempCategoryIds: number[] | null = null;

  constructor(
    private readonly prisma: PrismaService,
  ) {
    super(prisma.post, ['id', 'created_at', 'published_at', 'view_count', 'name', 'slug'], 'id:DESC');
  }

  /**
   * Chuẩn hóa options để luôn load relations cần thiết trong admin
   */
  protected override prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    // Prisma client in this project does not allow select + include together.
    // Build a single select that also selects nested relations.
    const defaultSelect: Prisma.PostSelect = {
      id: true,
      name: true,
      slug: true,
      excerpt: true,
      content: true,
      image: true,
      cover_image: true,
      primary_postcategory_id: true,
      status: true,
      post_type: true,
      video_url: true,
      audio_url: true,
      is_featured: true,
      is_pinned: true,
      published_at: true,
      view_count: true,
      meta_title: true,
      meta_description: true,
      canonical_url: true,
      og_title: true,
      og_description: true,
      og_image: true,
      group_id: true,
      created_at: true,
      updated_at: true,
      primary_category: { select: { id: true, name: true, slug: true, status: true } },
      categories: {
        select: {
          category: { select: { id: true, name: true, slug: true } },
        },
      },
      tags: {
        select: {
          tag: { select: { id: true, name: true, slug: true } },
        },
      },
    };

    const finalSelect = queryOptions?.select ?? defaultSelect;

    return {
      ...base,
      select: finalSelect,
      include: undefined,
    };
  }

  /**
   * Áp dụng filter theo group/context mặc định nếu có contextId
   */
  protected override async prepareFilters(
    filters?: Prisma.PostWhereInput,
    _options?: any,
  ): Promise<boolean | Prisma.PostWhereInput> {
    const prepared: Prisma.PostWhereInput = { ...(filters || {}) };

    if (prepared.group_id === undefined) {
      const contextId = RequestContext.get<number>('contextId');
      const groupId = RequestContext.get<number | null>('groupId');
      if (contextId && contextId !== 1 && groupId) {
        prepared.group_id = this.toBigInt(groupId);
      }
    }

    this.normalizeIdFilters(prepared);
    return prepared;
  }

  /**
   * Transform data sau khi lấy danh sách để chỉ giữ các fields cần thiết
   */
  protected override async afterGetList(
    data: AdminPostBag['Model'][],
  ): Promise<AdminPostBag['Model'][]> {
    return data.map((item) => this.transform(item));
  }

  /**
   * Transform data sau khi lấy một entity và verify ownership
   */
  protected override async afterGetOne(
    entity: AdminPostBag['Model'] | null,
  ): Promise<AdminPostBag['Model'] | null> {
    if (entity) {
      verifyGroupOwnership({ group_id: (entity as any).group_id ?? null });
      return this.transform(entity);
    }
    return entity;
  }

  /**
   * Hook trước khi tạo - xử lý slug và lưu tạm quan hệ
   */
  protected override async beforeCreate(createDto: AdminPostBag['Create']): Promise<AdminPostBag['Create']> {
    const payload: any = { ...createDto };
    this.normalizeSlug(payload);

    payload.primary_postcategory_id = this.toBigInt(payload.primary_postcategory_id);
    payload.group_id = payload.group_id !== undefined ? this.toBigInt(payload.group_id) : this.resolveGroupId();
    payload.published_at = this.normalizeDate(payload.published_at);

    this.tempTagIds = this.normalizeIdArray(payload.tag_ids);
    this.tempCategoryIds = this.normalizeIdArray(payload.category_ids);
    delete payload.tag_ids;
    delete payload.category_ids;

    return payload;
  }

  /**
   * Sau khi tạo: sync quan hệ tags/categories nếu có
   */
  protected override async afterCreate(entity: AdminPostBag['Model'], _createDto: AdminPostBag['Create']): Promise<void> {
    const postId = this.toBigInt((entity as any).id);
    if (!postId) return;
    await this.syncRelations(postId, this.tempTagIds, this.tempCategoryIds);
    this.tempTagIds = null;
    this.tempCategoryIds = null;
  }

  /**
   * Hook trước khi cập nhật - verify ownership, slug, lưu quan hệ
   */
  protected override async beforeUpdate(
    where: Prisma.PostWhereInput,
    updateDto: AdminPostBag['Update'],
  ): Promise<AdminPostBag['Update']> {
    const payload: any = { ...updateDto };
    this.normalizeSlug(payload);
    payload.primary_postcategory_id = this.toBigInt(payload.primary_postcategory_id);
    payload.group_id = payload.group_id !== undefined ? this.toBigInt(payload.group_id) : undefined;
    payload.published_at = this.normalizeDate(payload.published_at);

    const postId = (where as any).id ? this.toBigInt((where as any).id) : null;
    if (postId) {
      const current = await this.prisma.post.findUnique({ where: { id: postId } });
      if (current) {
        verifyGroupOwnership({ group_id: current.group_id ? Number(current.group_id) : null });
      }
    }

    this.tempTagIds = this.normalizeIdArray(payload.tag_ids);
    this.tempCategoryIds = this.normalizeIdArray(payload.category_ids);
    delete payload.tag_ids;
    delete payload.category_ids;

    return payload;
  }

  /**
   * Sau khi cập nhật: sync quan hệ nếu field ids được gửi lên
   */
  protected override async afterUpdate(entity: AdminPostBag['Model'], _updateDto: AdminPostBag['Update']): Promise<void> {
    const postId = this.toBigInt((entity as any).id);
    if (!postId) return;
    await this.syncRelations(postId, this.tempTagIds, this.tempCategoryIds);
    this.tempTagIds = null;
    this.tempCategoryIds = null;
  }

  /**
   * Override beforeDelete để verify ownership
   */
  protected override async beforeDelete(where: Prisma.PostWhereInput): Promise<boolean> {
    const postId = (where as any).id ? this.toBigInt((where as any).id) : null;
    if (!postId) return true;
    const current = await this.prisma.post.findUnique({ where: { id: postId }, select: { group_id: true } });
    if (current) {
      verifyGroupOwnership({ group_id: current.group_id ? Number(current.group_id) : null });
    }
    return true;
  }

  /**
   * Wrapper update/delete để nhận id dạng number (giữ API cũ)
   */
  async updateById(id: number, data: AdminPostBag['Update']) {
    return super.update({ id: this.toBigInt(id) } as any, data);
  }

  async deleteById(id: number) {
    return super.delete({ id: this.toBigInt(id) } as any);
  }

  // Giữ API cũ cho controller hiện tại
  async update(id: number, data: AdminPostBag['Update']) {
    return this.updateById(id, data);
  }

  async delete(id: number) {
    return this.deleteById(id);
  }

  /**
   * Simple list tương tự getList nhưng limit mặc định lớn hơn
   */
  async getSimpleList(filters?: Prisma.PostWhereInput, options?: any) {
    const simpleOptions = {
      ...options,
      limit: options?.limit ?? 50,
      maxLimit: options?.maxLimit ?? 1000,
    };
    return this.getList(filters, simpleOptions);
  }

  override async getOne(where: Prisma.PostWhereInput, options?: any) {
    const normalizedWhere = { ...(where || {}) } as Prisma.PostWhereInput;
    this.normalizeIdFilters(normalizedWhere);
    return super.getOne(normalizedWhere, options);
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

  private normalizeIdFilters(where: Prisma.PostWhereInput) {
    if (!where) return;
    if (typeof (where as any).id === 'number' || typeof (where as any).id === 'string') {
      (where as any).id = this.toBigInt((where as any).id);
    }
    if (typeof where.primary_postcategory_id === 'number' || typeof where.primary_postcategory_id === 'string') {
      where.primary_postcategory_id = this.toBigInt(where.primary_postcategory_id);
    }
    if (typeof where.group_id === 'number' || typeof where.group_id === 'string') {
      where.group_id = this.toBigInt(where.group_id);
    }
  }

  private normalizeDate(input: any): Date | null | undefined {
    if (input === null) return null;
    if (input === undefined) return undefined;
    if (input instanceof Date) return input;
    const d = new Date(input);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }

  private normalizeIdArray(input: any): number[] | null {
    if (input === undefined) return null;
    if (!Array.isArray(input)) return [];
    return input.map((id: any) => Number(id)).filter((id) => !Number.isNaN(id));
  }

  private toBigInt(value?: number | string | bigint | null): bigint | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'bigint') return value;
    const num = typeof value === 'string' ? Number(value) : value;
    if (Number.isNaN(num)) return null;
    return BigInt(num);
  }

  private resolveGroupId(): bigint | null {
    const groupId = RequestContext.get<number | null>('groupId');
    return groupId ? this.toBigInt(groupId) : null;
  }

  private transform(post: any) {
    if (!post) return post;
    if (post.primary_category) {
      const { id, name, slug } = post.primary_category as any;
      post.primary_category = { id, name, slug };
    }
    if (post.categories) {
      const categoryLinks = post.categories as any[];
      post.categories = categoryLinks
        .map((link) => link?.category)
        .filter(Boolean)
        .map((cat: any) => ({ id: cat.id, name: cat.name, slug: cat.slug }));
    }
    if (post.tags) {
      const tagLinks = post.tags as any[];
      post.tags = tagLinks
        .map((link) => link?.tag)
        .filter(Boolean)
        .map((tag: any) => ({ id: tag.id, name: tag.name, slug: tag.slug }));
    }
    return post;
  }

  private async syncRelations(postId: bigint, tagIds?: number[] | null, categoryIds?: number[] | null) {
    if (tagIds !== null) {
      await this.prisma.postPosttag.deleteMany({ where: { post_id: postId } });
      if (tagIds && tagIds.length > 0) {
        await this.prisma.postPosttag.createMany({
          data: tagIds.map((id) => ({ post_id: postId, posttag_id: this.toBigInt(id)! })),
          skipDuplicates: true,
        });
      }
    }

    if (categoryIds !== null) {
      await this.prisma.postPostcategory.deleteMany({ where: { post_id: postId } });
      if (categoryIds && categoryIds.length > 0) {
        await this.prisma.postPostcategory.createMany({
          data: categoryIds.map((id) => ({ post_id: postId, postcategory_id: this.toBigInt(id)! })),
          skipDuplicates: true,
        });
      }
    }
  }
}

