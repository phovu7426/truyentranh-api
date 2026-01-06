import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { Request } from 'express';
import { RbacService } from '@/modules/rbac/services/rbac.service';

@Injectable()
export class ContextService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => RbacService))
    private readonly rbacService: RbacService,
  ) {
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
   * Resolve context từ request
   * - Header: X-Context-Id
   * - Query: ?context_id=1
   * Lưu ý: Phải có context_id trong header hoặc query, không có default
   */
  async resolveContext(req: Request): Promise<Prisma.ContextGetPayload<any>> {
    const contextId =
      req.headers['x-context-id'] ||
      (req.query as any).context_id;

    if (!contextId) {
      throw new NotFoundException('Context ID is required in header (X-Context-Id) or query (?context_id)');
    }

    const context = await this.prisma.context.findFirst({
      where: { id: BigInt(contextId as any), status: 'active' as any },
    });

    if (!context) {
      throw new NotFoundException('Context not found');
    }

    return context;
  }

  /**
   * ✅ MỚI: Lấy tất cả contexts mà user có quyền truy cập (thông qua groups)
   */
  async getUserContexts(userId: number): Promise<Prisma.ContextGetPayload<any>[]> {
    const userGroups = await this.prisma.userGroup.findMany({
      where: { user_id: BigInt(userId) },
      select: { group_id: true },
    });

    if (!userGroups.length) return [];

    const groupIds = Array.from(new Set(userGroups.map((ug) => ug.group_id)));

    const groups = await this.prisma.group.findMany({
      where: {
        id: { in: groupIds },
        status: 'active' as any,
      },
      select: { context_id: true },
    });

    const contextIds = Array.from(new Set(groups.map((g) => g.context_id)));
    if (!contextIds.length) return [];

    const contexts = await this.prisma.context.findMany({
      where: {
        id: { in: contextIds },
        status: 'active' as any,
      },
    });

    return contexts as any;
  }

  /**
   * Lấy các contexts được phép truy cập
   * - System context (id=1) luôn được phép cho mọi user đã authenticated
   * - Các contexts khác chỉ được phép nếu user có role trong đó
   */
  async getUserContextsForTransfer(userId: number): Promise<Prisma.ContextGetPayload<any>[]> {
    // Lấy system context (id=1) - luôn được phép
    const systemContext = await this.prisma.context.findFirst({
      where: {
        id: BigInt(1),
        status: 'active' as any,
      },
    });

    // Lấy các contexts mà user có quyền truy cập (có role)
    const userContexts = await this.getUserContexts(userId);

    // Gộp lại và loại bỏ trùng lặp (nếu system context đã có trong userContexts)
    const allContexts: Prisma.ContextGetPayload<any>[] = [];
    if (systemContext) {
      allContexts.push(systemContext);
    }
    allContexts.push(...userContexts);
    
    // Loại bỏ trùng lặp dựa trên ID
    const uniqueContexts = allContexts.filter(
      (ctx, index, self) => index === self.findIndex((c) => Number(c.id) === Number(ctx.id)),
    );

    return uniqueContexts;
  }

  /**
   * Tạo system context mặc định (chạy 1 lần khi setup)
   */
  async createSystemContext(): Promise<Prisma.ContextGetPayload<any>> {
    const exists = await this.prisma.context.findFirst({
      where: {
        type: 'system',
        ref_id: null,
      },
    });

    if (exists) return exists;

    const context = await this.prisma.context.create({
      data: {
        type: 'system',
        ref_id: null,
        name: 'System',
        code: 'system',
        status: 'active' as any,
      },
    });

    return context as any;
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

