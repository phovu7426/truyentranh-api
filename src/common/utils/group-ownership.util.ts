import { ForbiddenException } from '@nestjs/common';
import { RequestContext } from '@/common/utils/request-context.util';
import { PrismaService } from '@/core/database/prisma/prisma.service';

/**
 * Interface cho entity có group_id
 */
export interface GroupOwnedEntity {
  group_id?: number | null;
}

/**
 * Helper function: Lấy group hiện tại từ RequestContext
 * Nếu chưa có trong cache, sẽ query từ database và cache lại
 * 
 * @param prisma - PrismaService (optional, chỉ cần khi chưa có trong cache)
 * @returns Group hoặc null
 * 
 * @example
 * ```typescript
 * const group = await getCurrentGroup(this.prisma);
 * if (group && group.type === 'system') {
 *   // System admin logic
 * }
 * ```
 */
export async function getCurrentGroup(
  prisma?: PrismaService
): Promise<any | null> {
  // Thử lấy từ RequestContext cache trước
  const groupId = RequestContext.get<number | null>('groupId');
  if (!groupId) {
    return null;
  }

  // Nếu có prisma, query và cache lại
  if (prisma) {
    const group = await prisma.group.findFirst({ 
      where: { id: groupId },
      include: { context: true }
    });
    if (group) {
      RequestContext.set('group', group);
      if (group.context) {
        RequestContext.set('context', group.context);
        RequestContext.set('contextId', Number(group.context.id));
      }
    }
    return group || null;
  }

  // Nếu không có prisma, chỉ trả về null
  return null;
}

/**
 * Helper function: Lấy context hiện tại từ RequestContext (từ group)
 * Nếu chưa có trong cache, sẽ query từ database và cache lại
 * 
 * @param prisma - PrismaService (optional, chỉ cần khi chưa có trong cache)
 * @returns Context hoặc null
 * 
 * @example
 * ```typescript
 * const context = await getCurrentContext(this.prisma);
 * if (context && context.type === 'system') {
 *   // System admin logic
 * }
 * ```
 */
export async function getCurrentContext(
  prisma?: PrismaService
): Promise<any | null> {
  // Thử lấy từ RequestContext cache trước
  const cachedContext = RequestContext.get<any>('context');
  if (cachedContext) {
    return cachedContext;
  }

  // Nếu chưa có và có prisma, query từ groupId
  if (prisma) {
    const groupId = RequestContext.get<number | null>('groupId');
    if (groupId) {
      // Query context từ group
      const group = await prisma.group.findFirst({ 
        where: { id: groupId },
        include: { context: true }
      });
      
      if (group && group.context) {
        RequestContext.set('context', group.context);
        RequestContext.set('contextId', Number(group.context.id));
        return group.context;
      } else if (group && group.context_id) {
        const context = await prisma.context.findFirst({ where: { id: group.context_id } });
        if (context) {
          RequestContext.set('context', context);
          RequestContext.set('contextId', Number(context.id));
        }
        return context || null;
      }
    } else {
      // Fallback: system context
      const contextId = RequestContext.get<number>('contextId') || 1;
      const context = await prisma.context.findFirst({ where: { id: contextId } });
      if (context) {
        RequestContext.set('context', context);
        RequestContext.set('contextId', Number(context.id));
      }
      return context || null;
    }
  }

  // Nếu không có prisma, chỉ trả về null
  return null;
}

/**
 * Verify ownership: kiểm tra entity có thuộc về group hiện tại không
 * 
 * @param entity - Entity có group_id (Product, Order, Post, Coupon, Warehouse, ...)
 * @throws ForbiddenException nếu không có quyền truy cập
 * 
 * @example
 * ```typescript
 * verifyGroupOwnership(product);
 * verifyGroupOwnership(order);
 * ```
 */
export function verifyGroupOwnership(entity: GroupOwnedEntity): void {
  const groupId = RequestContext.get<number | null>('groupId');
  const contextId = RequestContext.get<number>('contextId');

  // System context (id=1) hoặc không có groupId → có thể truy cập tất cả entities
  if (contextId === 1 || !groupId) {
    return;
  }

  // Group khác: chỉ được truy cập entities có group_id = groupId hiện tại
  if (entity.group_id !== null && entity.group_id !== undefined) {
    if (entity.group_id !== groupId) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập bản ghi này. Bản ghi thuộc về group khác.'
      );
    }
  } else {
    // Entity không có group_id (global) → chỉ system group mới được truy cập
    throw new ForbiddenException(
      'Bạn không có quyền truy cập bản ghi này. Bản ghi này thuộc về system group.'
    );
  }
}

/**
 * @deprecated Use verifyGroupOwnership instead
 * Verify ownership: kiểm tra entity có thuộc về group hiện tại không
 */
export function verifyContextOwnership(entity: GroupOwnedEntity): void {
  verifyGroupOwnership(entity);
}

