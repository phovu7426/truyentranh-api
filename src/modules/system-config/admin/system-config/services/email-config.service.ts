import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { UpdateEmailConfigDto } from '../dtos/update-email-config.dto';
import { toPlain } from '@/common/base/services/prisma/prisma.utils';

@Injectable()
export class EmailConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async getConfig(): Promise<any> {
    const config = await this.prisma.emailConfig.findFirst({
      orderBy: { id: 'asc' },
    });

    if (!config) return null;

    // Trả về config nhưng mask password
    const { smtp_password, ...rest } = config;
    return {
      ...toPlain(rest),
      smtp_password: smtp_password ? '******' : undefined,
    };
  }

  /**
   * Cập nhật cấu hình email
   * Nếu chưa có thì tạo mới, nếu có thì update
   * Password sẽ được hash trước khi lưu
   * Nếu không gửi password thì giữ nguyên password cũ
   */
  async updateConfig(dto: UpdateEmailConfigDto, updatedBy?: number): Promise<any> {
    const existing = await this.prisma.emailConfig.findFirst({
      orderBy: { id: 'asc' },
    });

    const updateData: any = { ...dto };

    // Nếu có password mới, hash nó
    if (dto.smtp_password) {
      updateData.smtp_password = await bcrypt.hash(dto.smtp_password, 10);
    } else if (existing) {
      // Nếu không gửi password, giữ nguyên password cũ
      delete (updateData as any).smtp_password;
    }

    if (!existing) {
      // Tạo mới với giá trị mặc định + dto
      // Nếu không có password trong dto, tạo password mặc định (rỗng, sẽ được hash)
      const defaultPassword = dto.smtp_password ? updateData.smtp_password : await bcrypt.hash('', 10);
      const created = await this.prisma.emailConfig.create({
        data: {
          smtp_host: dto.smtp_host || 'smtp.gmail.com',
          smtp_port: dto.smtp_port || 587,
          smtp_secure: dto.smtp_secure !== undefined ? dto.smtp_secure : true,
          smtp_username: dto.smtp_username || '',
          smtp_password: defaultPassword,
          from_email: dto.from_email || '',
          from_name: dto.from_name || '',
          reply_to_email: dto.reply_to_email,
          created_user_id: updatedBy ? BigInt(updatedBy) : null,
          updated_user_id: updatedBy ? BigInt(updatedBy) : null,
        },
      });
      const newConfig = created;

      const { smtp_password, ...rest } = newConfig;
      return {
        ...toPlain(rest),
        smtp_password: '******',
      };
    }

    // Update record hiện có
    const updatedConfig = await this.prisma.emailConfig.update({
      where: { id: existing.id },
      data: {
        ...updateData,
        updated_user_id: updatedBy ? BigInt(updatedBy) : existing.updated_user_id,
      },
    });
    const { smtp_password, ...rest } = updatedConfig;
    return {
      ...toPlain(rest),
      smtp_password: '******',
    };
  }
}
