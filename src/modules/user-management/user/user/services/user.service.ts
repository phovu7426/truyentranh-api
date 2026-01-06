import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { safeUser } from '@/modules/auth/utils/user.util';
import { UpdateProfileDto } from '@/modules/user-management/user/user/dto/update-profile.dto';
import { ChangePasswordDto } from '@/modules/user-management/user/user/dto/change-password.dto';
import { toPlain } from '@/common/base/services/prisma/prisma.utils';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getByIdSafe(userId: number) {
    if (!userId) return null;
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
      include: { profile: true },
    });
    if (!user) return null;
    return safeUser(toPlain(user) as any);
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    if (!userId) throw new Error('Không thể cập nhật thông tin user');

    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
      select: { id: true },
    });
    if (!user) throw new Error('Không thể cập nhật thông tin user');

    // Unique check phone nếu cung cấp
    if (dto.phone) {
      const exists = await this.prisma.user.findFirst({
        where: {
          phone: dto.phone,
          NOT: { id: BigInt(userId) },
        },
        select: { id: true },
      });
      if (exists) {
        throw new Error('Số điện thoại đã được sử dụng.');
      }
    }

    // Cập nhật bảng users
    const userPatch: any = {};
    if (dto.phone !== undefined) userPatch.phone = dto.phone;
    if (Object.keys(userPatch).length > 0) {
      await this.prisma.user.update({
        where: { id: BigInt(userId) },
        data: userPatch,
      });
    }

    // Cập nhật bảng profiles
    const profilePatch: any = {};
    if (dto.name !== undefined) profilePatch.name = dto.name;
    if (dto.image !== undefined) profilePatch.image = dto.image;
    if (dto.birthday !== undefined) profilePatch.birthday = dto.birthday;
    if (dto.gender !== undefined) profilePatch.gender = dto.gender;
    if (dto.address !== undefined) profilePatch.address = dto.address;
    if (dto.about !== undefined) profilePatch.about = dto.about;

    if (Object.keys(profilePatch).length > 0) {
      await this.prisma.profile.upsert({
        where: { user_id: BigInt(userId) },
        create: { ...profilePatch, user_id: BigInt(userId) },
        update: profilePatch,
      });
    }

    const updated = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
      include: { profile: true },
    });

    return updated ? safeUser(toPlain(updated) as any) : null;
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
      select: { id: true, password: true },
    });
    if (!user || !user.password) throw new Error('Không thể đổi mật khẩu');

    const ok = await bcrypt.compare(dto.oldPassword, user.password);
    if (!ok) throw new Error('Mật khẩu hiện tại không đúng');

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: BigInt(userId) },
      data: { password: hashed },
    });

    return null;
  }
}
