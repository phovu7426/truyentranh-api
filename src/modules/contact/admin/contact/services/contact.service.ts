import { Injectable } from '@nestjs/common';
import { Prisma, Contact } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { ContactStatus } from '@/shared/enums/types/contact-status.enum';
import { PrismaCrudService, PrismaCrudBag } from '@/common/base/services/prisma/prisma-crud.service';

type ContactBag = PrismaCrudBag & {
  Model: Contact;
  Where: Prisma.ContactWhereInput;
  Select: Prisma.ContactSelect;
  Include: never;
  OrderBy: Prisma.ContactOrderByWithRelationInput;
  Create: Prisma.ContactCreateInput;
  Update: Prisma.ContactUpdateInput;
};

@Injectable()
export class ContactService extends PrismaCrudService<ContactBag> {
  constructor(
    private readonly prisma: PrismaService,
  ) {
    super(prisma.contact, ['id', 'created_at'], 'id:DESC');
  }

  /**
   * Gửi phản hồi cho contact
   */
  async replyToContact(id: number, reply: string, repliedBy?: number) {
    return this.prisma.contact.update({
      where: { id: BigInt(id) },
      data: {
        reply,
        status: ContactStatus.Replied as any,
        replied_at: new Date(),
        replied_by: repliedBy ? BigInt(repliedBy) : null,
      },
    });
  }

  /**
   * Đánh dấu contact đã đọc
   */
  async markAsRead(id: number) {
    const contact = await this.prisma.contact.findUnique({
      where: { id: BigInt(id) },
    });
    if (contact && contact.status === ContactStatus.Pending) {
      return this.prisma.contact.update({
        where: { id: BigInt(id) },
        data: { status: ContactStatus.Read as any },
      });
    }
    return contact;
  }

  /**
   * Đóng contact
   */
  async closeContact(id: number) {
    return this.prisma.contact.update({
      where: { id: BigInt(id) },
      data: { status: ContactStatus.Closed as any },
    });
  }

  /**
   * Simple list tương tự getList nhưng limit mặc định lớn hơn
   */
  async getSimpleList(filters?: Prisma.ContactWhereInput, options?: any) {
    const simpleOptions = {
      ...options,
      limit: options?.limit ?? 50,
      maxLimit: options?.maxLimit ?? 1000,
    };
    return this.getList(filters, simpleOptions);
  }
}

