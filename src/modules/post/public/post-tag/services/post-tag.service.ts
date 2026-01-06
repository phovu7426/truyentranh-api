import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaListService, PrismaListBag } from '@/common/base/services/prisma/prisma-list.service';
import { PrismaService } from '@/core/database/prisma/prisma.service';

type PublicPostTagBag = PrismaListBag & {
  Model: Prisma.PostTagGetPayload<any>;
  Where: Prisma.PostTagWhereInput;
  Select: Prisma.PostTagSelect;
  Include: Prisma.PostTagInclude;
  OrderBy: Prisma.PostTagOrderByWithRelationInput;
};

@Injectable()
export class PostTagService extends PrismaListService<PublicPostTagBag> {
  constructor(
    private readonly prisma: PrismaService,
  ) {
    super(prisma.postTag, ['id', 'created_at', 'name', 'slug'], 'created_at:DESC');
  }

  protected override async prepareFilters(
    filters: Prisma.PostTagWhereInput = {},
    _options?: any,
  ): Promise<Prisma.PostTagWhereInput> {
    const prepared: Prisma.PostTagWhereInput = { ...(filters || {}) };
    if (prepared.status === undefined) prepared.status = 'active' as any;
    return prepared;
  }

  protected override prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    return {
      ...base,
      select: queryOptions?.select ?? {
        id: true,
        name: true,
        slug: true,
        description: true,
        created_at: true,
      },
      sort: base.sort ?? 'created_at:DESC',
    };
  }
}

