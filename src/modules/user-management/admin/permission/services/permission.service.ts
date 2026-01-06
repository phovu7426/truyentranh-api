import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaCrudService, PrismaCrudBag } from '@/common/base/services/prisma/prisma-crud.service';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { RbacCacheService } from '@/modules/rbac/services/rbac-cache.service';

type PermissionBag = PrismaCrudBag & {
  Model: Prisma.PermissionGetPayload<any>;
  Where: Prisma.PermissionWhereInput;
  Select: Prisma.PermissionSelect;
  Include: Prisma.PermissionInclude;
  OrderBy: Prisma.PermissionOrderByWithRelationInput;
  Create: Prisma.PermissionUncheckedCreateInput & { parent_id?: number | null };
  Update: Prisma.PermissionUncheckedUpdateInput & { parent_id?: number | null };
};

@Injectable()
export class PermissionService extends PrismaCrudService<PermissionBag> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rbacCache: RbacCacheService,
  ) {
    super(prisma.permission, ['id', 'created_at', 'code'], 'id:DESC');
  }

  protected override prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    return {
      ...base,
      include: {
        parent: true,
        children: true,
      },
    };
  }

  /**
   * Wrapper create với audit id (giữ nguyên signature của base create)
   */
  async createWithAudit(data: PermissionBag['Create'], createdBy?: number) {
    const payload: PermissionBag['Create'] = {
      ...data,
      ...(createdBy ? { created_user_id: BigInt(createdBy), updated_user_id: BigInt(createdBy) } : {}),
    };
    return super.create(payload);
  }

  /**
   * Wrapper update bằng id number + audit
   */
  async updateWithAudit(id: number, data: PermissionBag['Update'], updatedBy?: number) {
    const payload: PermissionBag['Update'] = {
      ...data,
      ...(updatedBy ? { updated_user_id: BigInt(updatedBy) } : {}),
    };
    return super.update({ id: BigInt(id) } as any, payload);
  }

  /**
   * Wrapper delete bằng id number
   */
  async deleteById(id: number) {
    return super.delete({ id: BigInt(id) } as any);
  }

  /**
   * Ensure code unique, handle parent_id
   */
  protected override async beforeCreate(createDto: PermissionBag['Create']): Promise<PermissionBag['Create']> {
    const payload: any = { ...createDto };

    if (payload.code) {
      const exists = await this.prisma.permission.findFirst({ where: { code: payload.code } });
      if (exists) {
        throw new BadRequestException('Permission code already exists');
      }
    }

    if (payload.parent_id !== undefined) {
      if (payload.parent_id === null) {
        payload.parent_id = null;
      } else {
        const parent = await this.prisma.permission.findUnique({ where: { id: BigInt(payload.parent_id) } });
        payload.parent_id = parent ? BigInt(payload.parent_id) : null;
      }
    }

    return payload;
  }

  /**
   * Validate & normalize before update
   */
  protected override async beforeUpdate(where: Prisma.PermissionWhereInput, updateDto: PermissionBag['Update']): Promise<PermissionBag['Update']> {
    const payload: any = { ...updateDto };
    const permissionId = (where as any).id ? BigInt((where as any).id) : null;
    const current = permissionId
      ? await this.prisma.permission.findUnique({ where: { id: permissionId } })
      : null;

    if (payload.code && payload.code !== current?.code) {
      const exists = await this.prisma.permission.findFirst({ where: { code: payload.code } });
      if (exists) {
        throw new BadRequestException('Permission code already exists');
      }
    }

    if (payload.parent_id !== undefined) {
      if (payload.parent_id === null) {
        payload.parent_id = null;
      } else {
        const parent = await this.prisma.permission.findUnique({ where: { id: BigInt(payload.parent_id) } });
        payload.parent_id = parent ? BigInt(payload.parent_id) : null;
      }
    }

    if (this.rbacCache && typeof this.rbacCache.bumpVersion === 'function') {
      await this.rbacCache.bumpVersion().catch(() => undefined);
    }

    return payload;
  }

  /**
   * Check children before delete
   */
  protected override async beforeDelete(where: Prisma.PermissionWhereInput): Promise<boolean> {
    const permissionId = (where as any).id ? BigInt((where as any).id) : null;
    if (!permissionId) return true;

    const childrenCount = await this.prisma.permission.count({ where: { parent_id: permissionId } });
    if (childrenCount > 0) {
      throw new BadRequestException('Cannot delete permission with children');
    }

    if (this.rbacCache && typeof this.rbacCache.bumpVersion === 'function') {
      await this.rbacCache.bumpVersion().catch(() => undefined);
    }
    return true;
  }

  /**
   * Simple list tương tự getList nhưng limit mặc định lớn hơn
   */
  async getSimpleList(filters?: Prisma.PermissionWhereInput, options?: any) {
    const simpleOptions = {
      ...options,
      limit: options?.limit ?? 50,
      maxLimit: options?.maxLimit ?? 1000,
    };
    return this.getList(filters, simpleOptions);
  }

  /**
   * Làm gọn dữ liệu trả về
   */
  protected override async afterGetList(data: any[]): Promise<any[]> {
    return data.map((item) => this.transform(item));
  }

  protected override async afterGetOne(entity: any): Promise<any> {
    return this.transform(entity);
  }

  private transform(permission: any) {
    if (!permission) return permission;
    if (permission.parent) {
      const { id, code, name, status } = permission.parent;
      permission.parent = { id, code, name, status };
    }
    if (permission.children) {
      permission.children = (permission.children as any[]).map((child) => {
        const { id, code, name, status } = child;
        return { id, code, name, status };
      });
    }
    return permission;
  }
}
