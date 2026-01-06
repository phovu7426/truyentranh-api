import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaCrudService, PrismaCrudBag } from '@/common/base/services/prisma/prisma-crud.service';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { StringUtil } from '@/core/utils/string.util';

type AdminPostTagBag = PrismaCrudBag & {
  Model: Prisma.PostTagGetPayload<any>;
  Where: Prisma.PostTagWhereInput;
  Select: Prisma.PostTagSelect;
  Include: Prisma.PostTagInclude;
  OrderBy: Prisma.PostTagOrderByWithRelationInput;
  Create: Prisma.PostTagUncheckedCreateInput;
  Update: Prisma.PostTagUncheckedUpdateInput;
};

@Injectable()
export class PostTagService extends PrismaCrudService<AdminPostTagBag> {
  constructor(
    private readonly prisma: PrismaService,
  ) {
    super(prisma.postTag, ['id', 'created_at', 'name', 'slug'], 'id:DESC');
  }

  protected override async beforeCreate(createDto: AdminPostTagBag['Create']): Promise<AdminPostTagBag['Create']> {
    const payload: any = { ...createDto };
    this.normalizeSlug(payload);
    return payload;
  }

  protected override async beforeUpdate(
    where: Prisma.PostTagWhereInput,
    updateDto: AdminPostTagBag['Update'],
  ): Promise<AdminPostTagBag['Update']> {
    const payload: any = { ...updateDto };
    this.normalizeSlug(payload);
    if ((where as any).id !== undefined) {
      (where as any).id = this.toBigInt((where as any).id);
    }
    return payload;
  }

  override async getOne(where: Prisma.PostTagWhereInput, options?: any) {
    const normalizedWhere = { ...(where || {}) } as Prisma.PostTagWhereInput;
    if ((normalizedWhere as any).id !== undefined) {
      (normalizedWhere as any).id = this.toBigInt((normalizedWhere as any).id);
    }
    return super.getOne(normalizedWhere, options);
  }

  async getSimpleList(filters?: Prisma.PostTagWhereInput, options?: any) {
    const simpleOptions = {
      ...options,
      limit: options?.limit ?? 50,
      maxLimit: options?.maxLimit ?? 1000,
    };
    return this.getList(filters, simpleOptions);
  }

  // Giữ API cũ cho controller
  async update(id: number, data: AdminPostTagBag['Update']) {
    return super.update({ id: this.toBigInt(id) } as any, data);
  }

  async delete(id: number) {
    return super.delete({ id: this.toBigInt(id) } as any);
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

