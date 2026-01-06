import { Injectable } from '@nestjs/common';
import { createPaginationMeta } from '@/common/base/utils/pagination.helper';
import { PrismaListOptions, PrismaListResult } from './prisma.types';
import { buildOrderBy, toPlain } from './prisma.utils';

type PrismaDelegate = {
  findMany: (args: any) => Promise<any[]>;
  count?: (args: any) => Promise<number>;
  findFirst?: (args: any) => Promise<any | null>;
};

export type PrismaListBag = {
  Model?: any;
  Where?: any;
  Select?: any;
  Include?: any;
  OrderBy?: any;
};

@Injectable()
export abstract class PrismaListService<T extends PrismaListBag = PrismaListBag> {
  protected constructor(
    protected readonly delegate: PrismaDelegate,
    private readonly allowedSortFields: string[] = ['id'],
    private readonly defaultSort: string = 'id:DESC',
  ) {}

  protected prepareOptions(options: PrismaListOptions<T['Where'], T['Select'], T['Include'], T['OrderBy']> = {}) {
    const page = Math.max(Number(options.page) || 1, 1);
    const maxLimit = options.maxLimit ?? 100;
    const limit = Math.min(Math.max(Number(options.limit) || 10, 1), maxLimit);
    const sort = options.sort || this.defaultSort;
    const orderBy =
      options.orderBy ??
      buildOrderBy(
        sort as any,
        this.allowedSortFields,
        this.allowedSortFields[0] || 'id',
        (String(sort).split(':')[1] || 'DESC').toLowerCase() === 'asc' ? 'asc' : 'desc',
      );

    return { ...options, page, limit, sort, orderBy };
  }

  /**
   * Hook: chuẩn bị filters (override nếu cần).
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async prepareFilters(filters?: T['Where'], _options?: any): Promise<T['Where'] | true | undefined> {
    return filters;
  }

  /**
   * Hook: xử lý data sau khi fetch (override nếu cần).
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async afterGetList(data: T['Model'][], _filters?: T['Where'], _options?: any): Promise<T['Model'][]> {
    return data;
  }

  /**
   * Hook: xử lý một item sau khi fetch (override nếu cần).
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async afterGetOne(entity: T['Model'] | null, _where?: T['Where'], _options?: any): Promise<T['Model'] | null> {
    return entity;
  }

  async getList(
    filters?: T['Where'],
    options?: PrismaListOptions<T['Where'], T['Select'], T['Include'], T['OrderBy']>,
  ): Promise<PrismaListResult<T['Model']>> {
    const normalized = this.prepareOptions(options);
    const page = normalized.page;
    const limit = normalized.limit;

    const preparedResult = await this.prepareFilters(filters, normalized);
    if (!preparedResult) {
      return { data: [], meta: createPaginationMeta(page, limit, 0) };
    }
    const where = preparedResult === true ? filters : preparedResult;

    const [rows, total] = await Promise.all([
      this.delegate.findMany({
        where,
        select: normalized.select,
        include: normalized.include,
        orderBy: normalized.orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.delegate.count ? this.delegate.count({ where }) : Promise.resolve(0),
    ]);

    const processed = await this.afterGetList(toPlain(rows), filters, normalized);
    return {
      data: processed,
      meta: createPaginationMeta(page, limit, total),
    };
  }

  async getOne(
    where: T['Where'],
    options?: PrismaListOptions<T['Where'], T['Select'], T['Include'], T['OrderBy']>,
  ): Promise<T['Model'] | null> {
    const normalized = this.prepareOptions(options);
    const entity = this.delegate.findFirst
      ? await this.delegate.findFirst({
          where,
          select: normalized.select,
          include: normalized.include,
          orderBy: normalized.orderBy,
        })
      : await this.delegate.findMany({
          where,
          select: normalized.select,
          include: normalized.include,
          orderBy: normalized.orderBy,
          take: 1,
        }).then(r => r[0] || null);

    return this.afterGetOne(toPlain(entity), where, normalized);
  }
}

