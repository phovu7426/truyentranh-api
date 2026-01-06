import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaListService, PrismaListBag } from '@/common/base/services/prisma/prisma-list.service';
import { PrismaService } from '@/core/database/prisma/prisma.service';

type PublicPostCategoryBag = PrismaListBag & {
  Model: Prisma.PostCategoryGetPayload<{
    include: { parent: true; children: true };
  }>;
  Where: Prisma.PostCategoryWhereInput;
  Select: Prisma.PostCategorySelect;
  Include: Prisma.PostCategoryInclude;
  OrderBy: Prisma.PostCategoryOrderByWithRelationInput;
};

@Injectable()
export class PostCategoryService extends PrismaListService<PublicPostCategoryBag> {
  constructor(
    private readonly prisma: PrismaService,
  ) {
    super(prisma.postCategory, ['id', 'sort_order', 'created_at'], 'sort_order:ASC');
  }

  protected override async prepareFilters(
    filters: Prisma.PostCategoryWhereInput = {},
    _options?: any,
  ): Promise<Prisma.PostCategoryWhereInput> {
    const prepared: Prisma.PostCategoryWhereInput = { ...(filters || {}) };
    if (prepared.status === undefined) prepared.status = 'active' as any;
    return prepared;
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
      created_at: true,
      parent: { select: { id: true, name: true, slug: true } },
      children: { select: { id: true, name: true, slug: true } },
    };

    const finalSelect = queryOptions?.select ?? defaultSelect;

    return {
      ...base,
      select: finalSelect,
      include: undefined,
      sort: base.sort ?? 'sort_order:ASC',
    };
  }
}

