import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';

@Injectable()
export class UserContextService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Lấy tất cả contexts mà user có quyền truy cập (thông qua groups)
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
      allContexts.push(systemContext as any);
    }
    allContexts.push(...userContexts);
    
    // Loại bỏ trùng lặp dựa trên ID
    const uniqueContexts = allContexts.filter(
      (ctx, index, self) => index === self.findIndex((c) => Number(c.id) === Number(ctx.id)),
    );

    return uniqueContexts;
  }
}

