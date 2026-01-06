import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaListService, PrismaListBag } from '@/common/base/services/prisma/prisma-list.service';
import { RbacService } from '@/modules/rbac/services/rbac.service';

type AdminContextBag = PrismaListBag & {
  Model: Prisma.ContextGetPayload<any>;
  Where: Prisma.ContextWhereInput;
  Select: Prisma.ContextSelect;
  Include: Prisma.ContextInclude;
  OrderBy: Prisma.ContextOrderByWithRelationInput;
};

@Injectable()
export class AdminContextService extends PrismaListService<AdminContextBag> {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => RbacService))
    private readonly rbacService: RbacService,
  ) {
    super(prisma.context, ['id', 'created_at'], 'id:DESC');
  }

  /**
   * Kiểm tra user có phải system admin không
   */
  private async isSystemAdmin(userId: number): Promise<boolean> {
    return this.rbacService.userHasPermissionsInGroup(userId, null, [
      'system.manage',
      'group.manage',
    ]);
  }

  /**
   * Lấy context theo ID
   */
  async findById(id: number): Promise<Prisma.ContextGetPayload<any> | null> {
    return this.prisma.context.findFirst({
      where: { id: BigInt(id), status: 'active' as any },
    }) as any;
  }

  /**
   * Lấy context theo type và ref_id
   */
  async findByTypeAndRefId(type: string, refId: number | null): Promise<Prisma.ContextGetPayload<any> | null> {
    return this.prisma.context.findFirst({
      where: {
        type,
        ...(refId === null
          ? { ref_id: null }
          : { ref_id: BigInt(refId) }),
      },
    }) as any;
  }

  /**
   * Tạo context mới (chỉ system admin)
   */
  async createContext(
    data: {
      type: string;
      ref_id?: number | null;
      name: string;
      code?: string;
      status?: string;
    },
    requesterUserId: number,
  ): Promise<Prisma.ContextGetPayload<any>> {
    // Check system admin
    const isAdmin = await this.isSystemAdmin(requesterUserId);
    if (!isAdmin) {
      throw new ForbiddenException('Only system admin can create contexts');
    }

    // Check unique constraint: (type, ref_id)
    const existing = await this.findByTypeAndRefId(data.type, data.ref_id ?? null);
    if (existing) {
      throw new BadRequestException(`Context with type "${data.type}" and ref_id "${data.ref_id ?? 'null'}" already exists`);
    }

    // Generate code nếu không có
    const code = data.code || `${data.type}-${data.ref_id ?? 'system'}`;

    // Check code unique
    const existingByCode = await this.prisma.context.findFirst({
      where: { code },
    });
    if (existingByCode) {
      throw new BadRequestException(`Context with code "${code}" already exists`);
    }

    const context = await this.prisma.context.create({
      data: {
        type: data.type,
        ref_id: data.ref_id ?? null,
        name: data.name,
        code,
        status: (data.status || 'active') as any,
      },
    });

    return context as any;
  }

  /**
   * Update context (chỉ system admin)
   */
  async updateContext(
    id: number,
    data: Partial<{ name: string; code: string; status: string }>,
    requesterUserId: number,
  ): Promise<Prisma.ContextGetPayload<any>> {
    // Check system admin
    const isAdmin = await this.isSystemAdmin(requesterUserId);
    if (!isAdmin) {
      throw new ForbiddenException('Only system admin can update contexts');
    }

    const context = await this.findById(id);
    if (!context) {
      throw new NotFoundException('Context not found');
    }

    // Không cho phép update system context (id=1)
    if (id === 1) {
      throw new BadRequestException('Cannot update system context');
    }

    // Check code unique nếu có thay đổi code
    if (data.code && data.code !== context.code) {
      const existing = await this.prisma.context.findFirst({
        where: { code: data.code },
      });
      if (existing) {
        throw new BadRequestException(`Context with code "${data.code}" already exists`);
      }
    }

    const updated = await this.prisma.context.update({
      where: { id: BigInt(id) },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.code !== undefined ? { code: data.code } : {}),
        ...(data.status !== undefined ? { status: data.status as any } : {}),
      },
    });
    return updated as any;
  }

  /**
   * Xóa context (chỉ system admin)
   */
  async deleteContext(id: number): Promise<void> {
    const context = await this.findById(id);
    if (!context) {
      throw new NotFoundException('Context not found');
    }

    // Không cho phép xóa system context (id=1)
    if (id === 1) {
      throw new BadRequestException('Cannot delete system context');
    }

    // Check xem có groups nào đang dùng context này không
    const groupsCount = await this.prisma.group.count({
      where: { context_id: BigInt(id) },
    });

    if (groupsCount > 0) {
      throw new BadRequestException(`Cannot delete context: ${groupsCount} group(s) are using this context`);
    }

    // Soft delete: update deleted_at
    await this.prisma.context.update({
      where: { id: BigInt(id) },
      data: {
        deleted_at: new Date(),
      },
    });
  }
}

