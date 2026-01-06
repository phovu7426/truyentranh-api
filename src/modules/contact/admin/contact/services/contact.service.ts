import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { ContactStatus } from '@/shared/enums/contact-status.enum';

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

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
}

