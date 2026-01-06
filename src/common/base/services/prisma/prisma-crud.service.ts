import { Injectable } from '@nestjs/common';
import { PrismaListService, PrismaListBag } from './prisma-list.service';
import { PrismaListOptions } from './prisma.types';
import { toPlain } from './prisma.utils';

type PrismaDelegate = {
  findMany: (args: any) => Promise<any[]>;
  findFirst?: (args: any) => Promise<any | null>;
  count?: (args: any) => Promise<number>;
  create: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
  updateMany?: (args: any) => Promise<any>;
};

export type PrismaCrudBag = PrismaListBag & { Create?: any; Update?: any };

@Injectable()
export abstract class PrismaCrudService<T extends PrismaCrudBag = PrismaCrudBag> extends PrismaListService<T> {
  protected constructor(
    protected readonly delegate: PrismaDelegate,
    allowedSortFields: string[] = ['id'],
    defaultSort: string = 'id:DESC',
  ) {
    super(delegate, allowedSortFields, defaultSort);
  }

  // Hooks
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async beforeCreate(data: T['Create']): Promise<T['Create']> { return data; }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async afterCreate(entity: T['Model'], _data: T['Create']): Promise<void> { }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async beforeUpdate(where: T['Where'], data: T['Update']): Promise<T['Update']> { return data; }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async afterUpdate(entity: T['Model'], _data: T['Update']): Promise<void> { }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async beforeDelete(where: T['Where']): Promise<boolean> { return true; }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async afterDelete(entity: T['Model']): Promise<void> { }

  async create(data: T['Create'], options?: PrismaListOptions<T['Where'], T['Select'], T['Include'], T['OrderBy']>) {
    const normalized = this.prepareOptions(options);
    const payload = await this.beforeCreate(data);
    const created = await this.delegate.create({
      data: payload,
      select: normalized.select,
      include: normalized.include,
    });
    await this.afterCreate(created, data);
    return toPlain(created);
  }

  async update(where: T['Where'], data: T['Update'], options?: PrismaListOptions<T['Where'], T['Select'], T['Include'], T['OrderBy']>) {
    const normalized = this.prepareOptions(options);
    const payload = await this.beforeUpdate(where, data);
    const updated = await this.delegate.update({
      where,
      data: payload,
      select: normalized.select,
      include: normalized.include,
    });
    await this.afterUpdate(updated, data);
    return toPlain(updated);
  }

  async delete(where: T['Where'], options?: PrismaListOptions<T['Where'], T['Select'], T['Include'], T['OrderBy']>) {
    const normalized = this.prepareOptions(options);
    const canProceed = await this.beforeDelete(where);
    if (!canProceed) return null;
    const deleted = await this.delegate.delete({
      where,
      select: normalized.select,
      include: normalized.include,
    });
    await this.afterDelete(deleted);
    return toPlain(deleted);
  }

  /**
   * Soft delete nếu model có trường deleted_at.
   */
  async softDelete(where: T['Where']) {
    if (!this.delegate.updateMany) {
      throw new Error('Soft delete không được hỗ trợ cho model này (thiếu updateMany)');
    }
    await this.delegate.updateMany({
      where,
      data: { deleted_at: new Date() },
    });
    return { deleted: true };
  }

  /**
   * Restore nếu model có trường deleted_at.
   */
  async restore(where: T['Where']) {
    if (!this.delegate.updateMany) {
      throw new Error('Restore không được hỗ trợ cho model này (thiếu updateMany)');
    }
    await this.delegate.updateMany({
      where,
      data: { deleted_at: null },
    });
    return { restored: true };
  }
}

