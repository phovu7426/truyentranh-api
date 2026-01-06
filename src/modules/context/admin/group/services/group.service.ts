import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaListService, PrismaListBag } from '@/common/base/services/prisma/prisma-list.service';
import { RbacService } from '@/modules/rbac/services/rbac.service';

type AdminGroupBag = PrismaListBag & {
  Model: Prisma.GroupGetPayload<any>;
  Where: Prisma.GroupWhereInput;
  Select: Prisma.GroupSelect;
  Include: Prisma.GroupInclude;
  OrderBy: Prisma.GroupOrderByWithRelationInput;
};

@Injectable()
export class AdminGroupService extends PrismaListService<AdminGroupBag> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rbacService: RbacService,
  ) {
    super(prisma.group, ['id', 'created_at'], 'id:DESC');
  }

  /**
   * Kiểm tra user có phải system admin không
   */
  async isSystemAdmin(userId: number): Promise<boolean> {
    return this.rbacService.userHasPermissionsInGroup(userId, null, [
      'system.manage',
      'group.manage',
    ]);
  }

  /**
   * Tạo group mới (chỉ system admin)
   * Bắt buộc phải có context_id
   */
  async createGroup(
    data: {
      type: string;
      code: string;
      name: string;
      description?: string;
      metadata?: any;
      owner_id?: number;
      context_id: number;
    },
    requesterUserId: number,
  ): Promise<Prisma.GroupGetPayload<any>> {
    // Check system admin
    const isAdmin = await this.isSystemAdmin(requesterUserId);
    if (!isAdmin) {
      throw new ForbiddenException('Only system admin can create groups');
    }

    // Check context exists
    const context = await this.prisma.context.findFirst({
      where: { id: BigInt(data.context_id), status: 'active' as any },
    });
    if (!context) {
      throw new NotFoundException(`Context with id ${data.context_id} not found`);
    }

    // Check code unique
    const existing = await this.prisma.group.findFirst({
      where: { code: data.code },
    });
    if (existing) {
      throw new BadRequestException(`Group with code "${data.code}" already exists`);
    }

    // Create group
    const group = await this.prisma.group.create({
      data: {
        type: data.type,
        code: data.code,
        name: data.name,
        description: data.description ?? null,
        metadata: data.metadata ?? null,
        owner_id: data.owner_id ? BigInt(data.owner_id) : null,
        context_id: BigInt(data.context_id),
        status: 'active' as any,
      },
    });

    // Nếu có owner, tự động thêm owner vào user_groups và gán role 'admin'
    if (group.owner_id) {
      // Thêm owner vào user_groups
      const existingUserGroup = await this.prisma.userGroup.findUnique({
        where: {
          user_id_group_id: {
            user_id: group.owner_id,
            group_id: group.id,
          },
        },
      });

      if (!existingUserGroup) {
        await this.prisma.userGroup.create({
          data: {
            user_id: group.owner_id,
            group_id: group.id,
            joined_at: new Date(),
          },
        });
      }

      // Gán role admin cho owner
      const ownerRole = await this.prisma.role.findFirst({
        where: { code: 'admin' },
      });
      if (ownerRole) {
        await this.rbacService.assignRoleToUser(Number(group.owner_id), Number(ownerRole.id), Number(group.id));
      }
    }

    return group as any;
  }

  /**
   * Lấy group theo ID
   */
  async findById(id: number): Promise<Prisma.GroupGetPayload<{ include: { context: true } }> | null> {
    return this.prisma.group.findFirst({
      where: { id: BigInt(id), status: 'active' as any },
      include: { context: true },
    }) as any;
  }

  /**
   * Lấy group theo code
   */
  async findByCode(code: string): Promise<Prisma.GroupGetPayload<{ include: { context: true } }> | null> {
    return this.prisma.group.findFirst({
      where: { code, status: 'active' as any },
      include: { context: true },
    }) as any;
  }

  /**
   * Update group (chỉ system admin)
   */
  async updateGroup(id: number, data: Partial<{ name: string; description: string; metadata: any }>): Promise<Prisma.GroupGetPayload<any>> {
    const group = await this.findById(id);
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const updated = await this.prisma.group.update({
      where: { id: BigInt(id) },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.metadata !== undefined ? { metadata: data.metadata } : {}),
      },
    });

    return updated as any;
  }

  /**
   * Delete group (soft delete)
   */
  async deleteGroup(id: number): Promise<void> {
    const group = await this.findById(id);
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Soft delete: update deleted_at
    await this.prisma.group.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() },
    });
  }
}

