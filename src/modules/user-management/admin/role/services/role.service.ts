import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaCrudService, PrismaCrudBag } from '@/common/base/services/prisma/prisma-crud.service';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { RbacCacheService } from '@/modules/rbac/services/rbac-cache.service';
import { RequestContext } from '@/common/utils/request-context.util';

type RoleBag = PrismaCrudBag & {
  Model: Prisma.RoleGetPayload<any>;
  Where: Prisma.RoleWhereInput;
  Select: Prisma.RoleSelect;
  Include: Prisma.RoleInclude;
  OrderBy: Prisma.RoleOrderByWithRelationInput;
  Create: Prisma.RoleUncheckedCreateInput & { context_ids?: number[]; parent_id?: number | null };
  Update: Prisma.RoleUncheckedUpdateInput & { context_ids?: number[]; parent_id?: number | null };
};

@Injectable()
export class RoleService extends PrismaCrudService<RoleBag> {
  // Biến tạm để lưu context_ids khi create/update
  private tempContextIds: number[] | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly rbacCache: RbacCacheService,
  ) {
    super(prisma.role, ['id', 'created_at', 'code'], 'id:DESC');
  }

  /**
   * Override prepareOptions để load relations
   */
  protected override prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    return {
      ...base,
      include: {
        parent: true,
        children: true,
        permissions: { include: { permission: true } },
        role_contexts: { include: { context: true } },
      },
    };
  }

  /**
   * Filter roles theo context hiện tại
   */
  protected override async prepareFilters(
    filters?: Prisma.RoleWhereInput,
    _options?: any,
  ): Promise<boolean | Prisma.RoleWhereInput> {
    const prepared: Prisma.RoleWhereInput = { ...(filters || {}) };
    const context = RequestContext.get<any>('context');
    const contextId = RequestContext.get<number>('contextId') || 1;

    if (!context || context.type === 'system') {
      return prepared;
    }

    const roleContexts = await this.prisma.roleContext.findMany({
      where: { context_id: BigInt(contextId) },
      select: { role_id: true },
    });

    if (!roleContexts.length) return false;

    return {
      ...prepared,
      id: { in: roleContexts.map((rc) => rc.role_id) },
    };
  }

  /**
   * Create wrapper để set audit fields (giữ nguyên signature base)
   */
  async createWithAudit(data: RoleBag['Create'], createdBy?: number) {
    const payload: RoleBag['Create'] = {
      ...data,
      ...(createdBy ? { created_user_id: BigInt(createdBy), updated_user_id: BigInt(createdBy) } : {}),
    };
    return super.create(payload);
  }

  /**
   * Update wrapper (nhận id số từ controller)
   */
  async updateWithAudit(id: number, data: RoleBag['Update'], updatedBy?: number) {
    const payload: RoleBag['Update'] = {
      ...data,
      ...(updatedBy ? { updated_user_id: BigInt(updatedBy) } : {}),
    };
    return super.update({ id: BigInt(id) } as any, payload);
  }

  /**
   * Delete wrapper (nhận id số từ controller)
   */
  async deleteById(id: number) {
    return super.delete({ id: BigInt(id) } as any);
  }

  /**
   * Transform data sau khi lấy danh sách để chỉ giữ các fields cần thiết
   */
  protected override async afterGetList(
    data: any[],
    _filters?: any,
    _options?: any,
  ): Promise<any[]> {
    return data.map((role) => this.transformRole(role));
  }

  /**
   * Transform data sau khi lấy một entity
   */
  protected override async afterGetOne(
    entity: any,
    _where?: any,
    _options?: any,
  ): Promise<any> {
    return this.transformRole(entity);
  }

  /**
   * Chuẩn hóa payload trước khi create
   */
  protected override async beforeCreate(createDto: RoleBag['Create']): Promise<RoleBag['Create']> {
    const payload: any = { ...createDto };

    // Validate code unique
    if (payload.code) {
      const exists = await this.prisma.role.findFirst({ where: { code: payload.code } });
      if (exists) {
        throw new BadRequestException('Role code already exists');
      }
    }

    // Handle parent_id
    if (payload.parent_id !== undefined && payload.parent_id !== null) {
      const parent = await this.prisma.role.findUnique({ where: { id: BigInt(payload.parent_id) } });
      payload.parent_id = parent ? BigInt(payload.parent_id) : null;
    }

    // Handle context_ids - lưu vào biến tạm để xử lý sau khi create
    const contextIds = payload.context_ids;
    if (contextIds !== undefined) {
      if (Array.isArray(contextIds) && contextIds.length > 0) {
        const contexts = await this.prisma.context.findMany({
          where: { id: { in: contextIds.map((id: any) => BigInt(id)) } },
        });
        if (contexts.length !== contextIds.length) {
          throw new BadRequestException('Some context IDs are invalid');
        }
        this.tempContextIds = contextIds.map((id: any) => Number(id));
      } else {
        this.tempContextIds = [];
      }
    }
    delete payload.context_ids;

    return payload;
  }

  /**
   * Sau khi create để lưu context_ids vào role_contexts
   */
  protected override async afterCreate(entity: any, _createDto: RoleBag['Create']): Promise<void> {
    if (this.tempContextIds !== null) {
      const contextIds = this.tempContextIds.map((id) => BigInt(id));
      if (contextIds.length > 0) {
        await this.prisma.roleContext.createMany({
          data: contextIds.map((contextId) => ({
            role_id: BigInt(entity.id),
            context_id: contextId,
          })),
          skipDuplicates: true,
        });
      }
      this.tempContextIds = null;
    }
  }

  /**
   * Chuẩn hóa payload trước khi update
   */
  protected override async beforeUpdate(where: Prisma.RoleWhereInput, updateDto: RoleBag['Update']): Promise<RoleBag['Update']> {
    const payload: any = { ...updateDto };
    const roleId = (where as any).id ? BigInt((where as any).id) : null;
    const current = roleId ? await this.prisma.role.findUnique({ where: { id: roleId } }) : null;

    // Validate code unique (exclude current)
    if (payload.code && payload.code !== current?.code) {
      const exists = await this.prisma.role.findFirst({ where: { code: payload.code } });
      if (exists) {
        throw new BadRequestException('Role code already exists');
      }
    }

    // Handle parent_id
    if (payload.parent_id !== undefined) {
      if (payload.parent_id === null) {
        payload.parent_id = null;
      } else {
        const parent = await this.prisma.role.findUnique({ where: { id: BigInt(payload.parent_id) } });
        payload.parent_id = parent ? BigInt(payload.parent_id) : null;
      }
    }

    // Handle context_ids - lưu vào biến tạm để xử lý sau khi update
    if (payload.context_ids !== undefined) {
      if (Array.isArray(payload.context_ids) && payload.context_ids.length > 0) {
        const contexts = await this.prisma.context.findMany({
          where: { id: { in: payload.context_ids.map((id: any) => BigInt(id)) } },
        });
        if (contexts.length !== payload.context_ids.length) {
          throw new BadRequestException('Some context IDs are invalid');
        }
        this.tempContextIds = payload.context_ids.map((id: any) => Number(id));
      } else {
        this.tempContextIds = [];
      }
    }
    delete payload.context_ids;

    return payload;
  }

  /**
   * Sau khi update để sync context_ids vào role_contexts
   */
  protected override async afterUpdate(entity: any, _updateDto: RoleBag['Update']): Promise<void> {
    if (this.tempContextIds !== null) {
      await this.prisma.roleContext.deleteMany({ where: { role_id: BigInt(entity.id) } });

      const contextIds = this.tempContextIds.map((id) => BigInt(id));
      if (contextIds.length > 0) {
        await this.prisma.roleContext.createMany({
          data: contextIds.map((contextId) => ({
            role_id: BigInt(entity.id),
            context_id: contextId,
          })),
          skipDuplicates: true,
        });
      }
      this.tempContextIds = null;
    }
  }

  /**
   * Check quan hệ trước khi xóa
   */
  protected override async beforeDelete(where: Prisma.RoleWhereInput): Promise<boolean> {
    const roleId = (where as any).id ? BigInt((where as any).id) : null;
    if (!roleId) return true;

    const childrenCount = await this.prisma.role.count({ where: { parent_id: roleId } });
    if (childrenCount > 0) {
      throw new BadRequestException('Cannot delete role with children');
    }

    const userCount = await this.prisma.userRoleAssignment.count({ where: { role_id: roleId } });
    if (userCount > 0) {
      throw new BadRequestException('Cannot delete role assigned to users');
    }

    return true;
  }

  /**
   * Assign permissions to role (sync - replace all)
   */
  async assignPermissions(roleId: number, permissionIds: number[]) {
    const role = await this.prisma.role.findUnique({ where: { id: BigInt(roleId) } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (permissionIds.length > 0) {
      const permissions = await this.prisma.permission.findMany({
        where: { id: { in: permissionIds.map((id) => BigInt(id)) } },
      });
      if (permissions.length !== permissionIds.length) {
        throw new BadRequestException('Some permission IDs are invalid');
      }
    }

    // Xóa tất cả permission cũ và thêm mới
    await this.prisma.roleHasPermission.deleteMany({ where: { role_id: BigInt(roleId) } });
    if (permissionIds.length > 0) {
      await this.prisma.roleHasPermission.createMany({
        data: permissionIds.map((pid) => ({
          role_id: BigInt(roleId),
          permission_id: BigInt(pid),
        })),
        skipDuplicates: true,
      });
    }

    if (this.rbacCache && typeof this.rbacCache.bumpVersion === 'function') {
      await this.rbacCache.bumpVersion().catch(() => undefined);
    }

    return this.getOne({ id: BigInt(roleId) } as any);
  }

  /**
   * Simple list tương tự getList nhưng limit mặc định lớn hơn
   */
  async getSimpleList(filters?: Prisma.RoleWhereInput, options?: any) {
    const simpleOptions = {
      ...options,
      limit: options?.limit ?? 50,
      maxLimit: options?.maxLimit ?? 1000,
    };
    return this.getList(filters, simpleOptions);
  }

  /**
   * Chuẩn hóa dữ liệu role trả về FE
   */
  private transformRole(role: any) {
    if (!role) return role;

    if (role.parent) {
      const { id, code, name, status } = role.parent;
      role.parent = { id, code, name, status };
    }

    if (role.children) {
      role.children = role.children.map((child: any) => {
        const { id, code, name, status } = child;
        return { id, code, name, status };
      });
    }

    if (role.permissions) {
      const perms = (role.permissions as any[])
        .map((link) => link.permission)
        .filter(Boolean)
        .map((perm: any) => {
          const { id, code, name, status } = perm;
          return { id, code, name, status };
        });
      role.permissions = perms;
    }

    if (role.role_contexts) {
      const contextId = RequestContext.get<number>('contextId') || 1;
      const context = RequestContext.get<any>('context');
      let filtered = role.role_contexts as any[];
      if (context && context.type !== 'system') {
        filtered = filtered.filter((rc) => rc.context_id === contextId);
      }

      (role as any).context_ids = filtered.map((rc) => Number(rc.context_id));
      (role as any).contexts = filtered
        .filter((rc) => rc.context)
        .map((rc) => {
          const ctx = rc.context;
          return {
            id: Number(ctx.id),
            type: ctx.type,
            name: ctx.name,
            status: ctx.status,
            ref_id: ctx.ref_id ? Number(ctx.ref_id) : null,
          };
        });
      delete (role as any).role_contexts;
    } else {
      (role as any).context_ids = [];
      (role as any).contexts = [];
    }

    return role;
  }
}
