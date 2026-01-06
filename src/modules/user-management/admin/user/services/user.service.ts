import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaCrudService, PrismaCrudBag } from '@/common/base/services/prisma/prisma-crud.service';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { ChangePasswordDto } from '@/modules/user-management/admin/user/dtos/change-password.dto';
import { RequestContext } from '@/common/utils/request-context.util';
import { RbacService } from '@/modules/rbac/services/rbac.service';

type AdminUserBag = PrismaCrudBag & {
  Model: Prisma.UserGetPayload<any>;
  Where: Prisma.UserWhereInput;
  Select: Prisma.UserSelect;
  Include: Prisma.UserInclude;
  OrderBy: Prisma.UserOrderByWithRelationInput;
  Create: Prisma.UserUncheckedCreateInput & { role_ids?: number[]; profile?: Prisma.ProfileUncheckedCreateInput | null };
  Update: Prisma.UserUncheckedUpdateInput & { role_ids?: number[]; profile?: Prisma.ProfileUncheckedUpdateInput | null };
};

@Injectable()
export class UserService extends PrismaCrudService<AdminUserBag> {
  // Biến tạm để lưu role_ids khi create/update
  private tempRoleIds: number[] | null = null;
  private profilePayload: Prisma.ProfileUncheckedCreateInput | Prisma.ProfileUncheckedUpdateInput | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly rbacService: RbacService,
  ) {
    super(prisma.user, ['id', 'created_at', 'email', 'phone'], 'id:DESC');
  }

  /**
   * Override prepareOptions để đảm bảo load relations trong admin
   */
  protected override prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    return {
      ...base,
      include: {
        user_role_assignments: true,
        profile: true,
      },
    };
  }

  /**
   * Filter users theo context/group hiện tại
   */
  protected override async prepareFilters(
    filters?: Prisma.UserWhereInput,
    _options?: any,
  ): Promise<boolean | Prisma.UserWhereInput> {
    const prepared: Prisma.UserWhereInput = { ...(filters || {}) };

    const context = RequestContext.get<any>('context');
    const contextId = RequestContext.get<number>('contextId') || 1;

    // System admin → không filter
    if (!context || context.type === 'system') {
      return prepared;
    }

    // Group admin → chỉ lấy user thuộc group hiện tại
    const groupId = RequestContext.get<number | null>('groupId');
    if (contextId === 1 || !groupId) {
      return prepared;
    }

    const userGroups = await this.prisma.userGroup.findMany({
      where: { group_id: BigInt(groupId) },
      select: { user_id: true },
    });

    if (!userGroups.length) {
      return false;
    }

    return {
      ...prepared,
      id: { in: userGroups.map((ug) => ug.user_id) },
    };
  }

  /**
   * Admin đổi mật khẩu user (không cần old password)
   */
  async changePassword(id: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(id) },
      select: { id: true, password: true },
    });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    const hashed = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.update({
      where: { id: BigInt(id) },
      data: { password: hashed },
    });
  }

  /**
   * Chuẩn hóa payload trước khi create
   */
  protected override async beforeCreate(createDto: AdminUserBag['Create']): Promise<AdminUserBag['Create']> {
    const payload: any = { ...createDto };

    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }

    // Handle role_ids - lưu vào biến tạm để xử lý sau khi create
    if (payload.role_ids !== undefined) {
      this.tempRoleIds = Array.isArray(payload.role_ids)
        ? payload.role_ids.map((id: any) => Number(id)).filter((id: number) => !isNaN(id))
        : [];
    } else {
      this.tempRoleIds = null;
    }
    delete payload.role_ids;

    // Handle profile (tách ra xử lý riêng)
    if ('profile' in payload) {
      this.profilePayload = payload.profile as any;
      delete payload.profile;
    } else {
      this.profilePayload = null;
    }

    return payload;
  }

  /**
   * Sau khi create: tạo profile và gán role trong group hiện tại
   */
  protected override async afterCreate(entity: any, _createDto: AdminUserBag['Create']): Promise<void> {
    const userId = Number(entity.id);

    // Xử lý profile
    if (this.profilePayload) {
      const profileData = { ...(this.profilePayload as any), user_id: BigInt(userId) };
      await this.prisma.profile.upsert({
        where: { user_id: BigInt(userId) },
        create: profileData,
        update: profileData,
      });
    }

    // Gán role_ids cho group hiện tại
    if (this.tempRoleIds && this.tempRoleIds.length > 0) {
      const groupId = RequestContext.get<number | null>('groupId');
      if (groupId) {
        await this.rbacService.syncRolesInGroup(
          userId,
          groupId,
          this.tempRoleIds,
          true, // skipValidation cho admin API
        );
      }
    }

    // Reset biến tạm
    this.tempRoleIds = null;
    this.profilePayload = null;
  }

  /**
   * Chuẩn hóa payload trước khi update
   */
  protected override async beforeUpdate(_where: Prisma.UserWhereInput, updateDto: AdminUserBag['Update']): Promise<AdminUserBag['Update']> {
    const payload: any = { ...updateDto };

    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    } else if ('password' in payload) {
      delete payload.password;
    }

    if (payload.role_ids !== undefined) {
      this.tempRoleIds = Array.isArray(payload.role_ids)
        ? payload.role_ids.map((id: any) => Number(id)).filter((id: number) => !isNaN(id))
        : [];
    } else {
      this.tempRoleIds = null;
    }
    delete payload.role_ids;

    if ('profile' in payload) {
      this.profilePayload = payload.profile as any;
      delete payload.profile;
    } else {
      this.profilePayload = null;
    }

    return payload;
  }

  /**
   * Sau khi update: cập nhật profile và đồng bộ role_ids
   */
  protected override async afterUpdate(entity: any, _updateDto: AdminUserBag['Update']): Promise<void> {
    const userId = Number(entity.id);

    // Update profile nếu có payload
    if (this.profilePayload && Object.keys(this.profilePayload).length) {
      const profileData = { ...(this.profilePayload as any) };
      await this.prisma.profile.upsert({
        where: { user_id: BigInt(userId) },
        create: { ...profileData, user_id: BigInt(userId) },
        update: profileData,
      });
    }

    // Đồng bộ roles trong group hiện tại
    if (this.tempRoleIds !== null) {
      const groupId = RequestContext.get<number | null>('groupId');
      if (groupId) {
        await this.rbacService.syncRolesInGroup(
          userId,
          groupId,
          this.tempRoleIds,
          true,
        );
      }
    }

    this.tempRoleIds = null;
    this.profilePayload = null;
  }

  /**
   * Cleanup sau khi delete
   */
  protected override async afterDelete(entity: any): Promise<void> {
    try {
      await this.prisma.profile.deleteMany({ where: { user_id: BigInt(entity.id) } });
    } catch {
      // ignore
    }
  }

  /**
   * Transform data sau khi lấy một entity để thêm role_ids và làm sạch response
   */
  protected override async afterGetOne(
    entity: any,
    _where?: any,
    _options?: any,
  ): Promise<any> {
    const groupId = RequestContext.get<number | null>('groupId');
    if (groupId && entity?.user_role_assignments) {
      const roleIds = (entity.user_role_assignments as any[])
        .filter((ura: any) => ura.group_id === groupId)
        .map((ura: any) => ura.role_id);
      (entity as any).role_ids = roleIds;
      delete (entity as any).user_role_assignments;
    } else {
      (entity as any).role_ids = [];
    }

    if ((entity as any).contexts) {
      delete (entity as any).contexts;
    }

    return entity;
  }

  /**
   * Transform data sau khi lấy danh sách để thêm role_ids cho mỗi user và làm sạch response
   */
  protected override async afterGetList(
    data: any[],
    _filters?: any,
    _options?: any,
  ): Promise<any[]> {
    const groupId = RequestContext.get<number | null>('groupId');

    return data.map((user) => {
      if (groupId && user?.user_role_assignments) {
        const roleIds = (user.user_role_assignments as any[])
          .filter((ura: any) => ura.group_id === groupId)
          .map((ura: any) => ura.role_id);
        (user as any).role_ids = roleIds;
        delete (user as any).user_role_assignments;
      } else {
        (user as any).role_ids = [];
      }

      if ((user as any).contexts) {
        delete (user as any).contexts;
      }

      return user;
    });
  }

  /**
   * Simple list giống getList nhưng limit mặc định lớn hơn
   */
  async getSimpleList(filters?: Prisma.UserWhereInput, options?: any) {
    const simpleOptions = {
      ...options,
      limit: options?.limit ?? 50,
      maxLimit: options?.maxLimit ?? 1000,
    };
    return this.getList(filters, simpleOptions);
  }

  /**
   * Wrapper update/delete để nhận id dạng number (giữ API cũ)
   */
  async updateById(id: number, data: AdminUserBag['Update']) {
    return super.update({ id: BigInt(id) } as any, data);
  }

  async deleteById(id: number) {
    return super.delete({ id: BigInt(id) } as any);
  }
}
