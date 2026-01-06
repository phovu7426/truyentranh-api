import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaListService, PrismaListBag } from '@/common/base/services/prisma/prisma-list.service';
import { PrismaService } from '@/core/database/prisma/prisma.service';

type PublicPostBag = PrismaListBag & {
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
};

@Injectable()
export class PostService extends PrismaListService<PublicPostBag> {
  constructor(
    private readonly prisma: PrismaService,
  ) {
    super(prisma.post, ['id', 'created_at', 'published_at', 'view_count'], 'created_at:DESC');
  }

  protected override async prepareFilters(filters: Prisma.PostWhereInput = {}): Promise<Prisma.PostWhereInput> {
    const prepared: Prisma.PostWhereInput = { ...(filters || {}) };

    // Luôn giới hạn bài viết public ở trạng thái published
    prepared.status = 'published' as any;

    const search = (prepared as any).search;
    if (search) {
      prepared.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
      ];
      delete (prepared as any).search;
    }

    const categorySlug = (prepared as any).category_slug;
    if (categorySlug) {
      prepared.categories = {
        some: {
          category: { slug: categorySlug, status: 'active' as any },
        },
      };
      delete (prepared as any).category_slug;
    }

    const tagSlug = (prepared as any).tag_slug;
    if (tagSlug) {
      prepared.tags = {
        some: {
          tag: { slug: tagSlug, status: 'active' as any },
        },
      };
      delete (prepared as any).tag_slug;
    }

    if ((prepared as any).is_featured !== undefined) {
      prepared.is_featured = Boolean((prepared as any).is_featured);
    }
    if ((prepared as any).is_pinned !== undefined) {
      prepared.is_pinned = Boolean((prepared as any).is_pinned);
    }

    return prepared;
  }

  protected override prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    // Prisma client in this project does not allow select + include together.
    // Build a single select that also selects nested relations.
    const defaultSelect: Prisma.PostSelect = {
      id: true,
      name: true,
      slug: true,
      excerpt: true,
      image: true,
      cover_image: true,
      published_at: true,
      view_count: true,
      created_at: true,
      primary_category: {
        select: { id: true, name: true, slug: true, description: true, status: true },
      },
      categories: {
        where: { category: { status: 'active' as any } },
        select: {
          category: { select: { id: true, name: true, slug: true, description: true, status: true } },
        },
      },
      tags: {
        where: { tag: { status: 'active' as any } },
        select: {
          tag: { select: { id: true, name: true, slug: true, description: true, status: true } },
        },
      },
    };

    // If caller provides select/include, respect select and drop include to avoid conflict.
    const finalSelect = queryOptions?.select ?? defaultSelect;

    return {
      ...base,
      select: finalSelect,
      include: undefined,
    };
  }

  protected override async afterGetList(
    data: PublicPostBag['Model'][],
  ): Promise<PublicPostBag['Model'][]> {
    return data.map((post) => this.transform(post));
  }

  protected override async afterGetOne(
    entity: PublicPostBag['Model'] | null,
  ): Promise<PublicPostBag['Model'] | null> {
    if (!entity) return entity;
    return this.transform(entity);
  }

  /**
   * Tăng view count cho post (không chặn nếu lỗi)
   */
  async incrementViewCount(postId: number): Promise<void> {
    try {
      await this.prisma.post.update({
        where: { id: BigInt(postId) },
        data: { view_count: { increment: 1 } },
      });
    } catch {
      // Ignore errors khi tăng view count
    }
  }

  private transform(post: any) {
    if (!post) return post;
    if (post.primary_category) {
      const primary = post.primary_category as any;
      if (primary.status && primary.status !== 'active') {
        post.primary_category = null;
      } else {
        const { id, name, slug, description } = primary;
        post.primary_category = { id, name, slug, description };
      }
    }
    if (Array.isArray(post.categories)) {
      post.categories = (post.categories as any[])
        .map((link) => link?.category)
        .filter(Boolean)
        .map((cat: any) => {
          const { id, name, slug, description } = cat;
          return { id, name, slug, description };
        });
    }
    if (Array.isArray(post.tags)) {
      post.tags = (post.tags as any[])
        .map((link) => link?.tag)
        .filter(Boolean)
        .map((tag: any) => {
          const { id, name, slug, description } = tag;
          return { id, name, slug, description };
        });
    }
    return post;
  }
}
