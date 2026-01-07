import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { ContactStatus } from '@/shared/enums/types/contact-status.enum';
import { CreateContactDto } from '@/modules/contact/public/contact/dtos/create-contact.dto';

@Injectable()
export class PublicContactService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Tạo contact mới từ public
   */
  async create(createContactDto: CreateContactDto): Promise<Prisma.ContactGetPayload<any>> {
    const contact = await this.prisma.contact.create({
      data: {
        name: createContactDto.name,
        email: createContactDto.email,
        phone: createContactDto.phone ?? null,
        subject: createContactDto.subject ?? null,
        message: createContactDto.message,
        status: ContactStatus.Pending as any,
      },
    });
    
    return contact as any;
  }
}

