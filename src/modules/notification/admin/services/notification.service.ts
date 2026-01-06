import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaCrudService, PrismaCrudBag } from '@/common/base/services/prisma/prisma-crud.service';

type NotificationBag = PrismaCrudBag & {
  Model: Prisma.NotificationGetPayload<any>;
  Where: Prisma.NotificationWhereInput;
  Select: Prisma.NotificationSelect;
  Include: Prisma.NotificationInclude;
  OrderBy: Prisma.NotificationOrderByWithRelationInput;
  Create: Prisma.NotificationUncheckedCreateInput & { user_id?: number };
  Update: Prisma.NotificationUncheckedUpdateInput;
};

@Injectable()
export class NotificationService extends PrismaCrudService<NotificationBag> {
  constructor(
    private readonly prisma: PrismaService,
  ) {
    super(prisma.notification, ['id', 'created_at'], 'created_at:DESC');
  }

  /**
   * Mark notification as read for user
   */
  async markAsReadForUser(id: number, userId: number) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: BigInt(id),
        user_id: BigInt(userId),
        deleted_at: null,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    
    const updated = await this.prisma.notification.update({
      where: { id: BigInt(id) },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });
    
    return this.convertBigIntFields(updated);
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsReadForUser(userId: number) {
    await this.prisma.notification.updateMany({
      where: {
        user_id: BigInt(userId),
        is_read: false,
        deleted_at: null,
      },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });
  }

  /**
   * Override beforeCreate to handle BigInt conversion
   */
  protected override async beforeCreate(createDto: NotificationBag['Create']): Promise<NotificationBag['Create']> {
    const payload: any = { ...createDto };
    if (payload.user_id !== undefined) {
      payload.user_id = BigInt(payload.user_id);
    }
    if (payload.created_user_id !== undefined && payload.created_user_id !== null) {
      payload.created_user_id = BigInt(payload.created_user_id);
    }
    if (payload.updated_user_id !== undefined && payload.updated_user_id !== null) {
      payload.updated_user_id = BigInt(payload.updated_user_id);
    }
    return payload;
  }

  /**
   * Override beforeUpdate to handle BigInt conversion
   */
  protected override async beforeUpdate(_where: Prisma.NotificationWhereInput, updateDto: NotificationBag['Update']): Promise<NotificationBag['Update']> {
    const payload: any = { ...updateDto };
    if (payload.user_id !== undefined && payload.user_id !== null) {
      payload.user_id = BigInt(payload.user_id);
    }
    if (payload.created_user_id !== undefined && payload.created_user_id !== null) {
      payload.created_user_id = BigInt(payload.created_user_id);
    }
    if (payload.updated_user_id !== undefined && payload.updated_user_id !== null) {
      payload.updated_user_id = BigInt(payload.updated_user_id);
    }
    return payload;
  }

  /**
   * Override getOne to handle BigInt conversion
   */
  protected override async afterGetOne(entity: any, _where?: any, _options?: any): Promise<any> {
    if (!entity) return null;
    return this.convertBigIntFields(entity);
  }

  /**
   * Override getList to handle BigInt conversion
   */
  protected override async afterGetList(data: any[], _filters?: any, _options?: any): Promise<any[]> {
    return data.map(item => this.convertBigIntFields(item));
  }

  /**
   * Convert BigInt fields to number for JSON serialization
   */
  private convertBigIntFields(entity: any): any {
    if (!entity) return entity;
    const converted = { ...entity };
    if (converted.id) converted.id = Number(converted.id);
    if (converted.user_id) converted.user_id = Number(converted.user_id);
    if (converted.created_user_id) converted.created_user_id = Number(converted.created_user_id);
    if (converted.updated_user_id) converted.updated_user_id = Number(converted.updated_user_id);
    return converted;
  }

  /**
   * Simple list giống getList nhưng limit mặc định lớn hơn
   */
  async getSimpleList(filters?: any, options?: any) {
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
  async update(id: number, data: NotificationBag['Update']) {
    return super.update({ id: BigInt(id) } as any, data);
  }

  async delete(id: number) {
    return super.delete({ id: BigInt(id) } as any);
  }

  async restore(id: number) {
    return super.restore({ id: BigInt(id) } as any);
  }
}
