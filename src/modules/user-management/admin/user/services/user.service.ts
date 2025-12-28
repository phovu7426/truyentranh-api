import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '@/shared/entities/user.entity';
import { Profile } from '@/shared/entities/profile.entity';
import { ChangePasswordDto } from '@/modules/user-management/admin/user/dtos/change-password.dto';
import { CrudService } from '@/common/base/services/crud.service';

@Injectable()
export class UserService extends CrudService<User> {
  private get profileRepo(): Repository<Profile> {
    return this.repository.manager.getRepository(Profile);
  }

  constructor(
    @InjectRepository(User) protected readonly repository: Repository<User>,
  ) {
    super(repository);
  }

  /**
   * Override getOne để đảm bảo load relations trong admin
   * Optimize: Load profile trong cùng query để tránh N+1
   */
  async getOne(
    where: any,
    options?: any,
  ) {
    // Use parent method with relations to avoid N+1
    const adminOptions = {
      ...options,
      relations: ['roles', 'direct_permissions', 'profile'],
    };
    return super.getOne(where, adminOptions);
  }

  /**
   * Override getList để đảm bảo load relations trong admin
   * Optimize: Load profile trong cùng query để tránh N+1
   */
  async getList(
    filters?: any,
    options?: any,
  ) {
    // Ensure profile is always loaded in admin
    const adminOptions = {
      ...options,
      relations: ['roles', 'direct_permissions', 'profile'],
    };
    return super.getList(filters, adminOptions);
  }

  async changePassword(id: number, dto: ChangePasswordDto) {
    const user = await this.repository.findOne({ where: { id } as any });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    user.password = await bcrypt.hash(dto.password, 10);
    await this.repository.save(user as any);
  }

  protected async beforeCreate(_entity: User, createDto: DeepPartial<User>): Promise<boolean> {
    if ((createDto as any).password) {
      (createDto as any).password = await bcrypt.hash((createDto as any).password, 10);
    }
    if ('role_ids' in (createDto as any)) delete (createDto as any).role_ids;
    if ('profile' in (createDto as any)) delete (createDto as any).profile;
    return true;
  }

  protected async afterCreate(entity: User, createDto: DeepPartial<User>): Promise<void> {
    const profilePayload = (createDto as any).profile ?? null;
    if (profilePayload) {
      // Kiểm tra xem profile đã tồn tại chưa (1 user chỉ có 1 profile)
      const existingProfile = await this.profileRepo.findOne({ where: { userId: entity.id } });
      if (!existingProfile) {
        const profile = this.profileRepo.create({ ...(profilePayload as any), userId: entity.id });
        await this.profileRepo.save(profile);
      }
    }
  }

  protected async beforeUpdate(_entity: User, updateDto: DeepPartial<User>): Promise<boolean> {
    if ((updateDto as any).password) {
      (updateDto as any).password = await bcrypt.hash((updateDto as any).password, 10);
    } else if ('password' in (updateDto as any)) {
      delete (updateDto as any).password;
    }
    if ('role_ids' in (updateDto as any)) delete (updateDto as any).role_ids;
    if ('profile' in (updateDto as any)) delete (updateDto as any).profile;
    return true;
  }

  protected async afterUpdate(entity: User, updateDto: DeepPartial<User>): Promise<void> {
    const profilePayload = (updateDto as any).profile ?? null;
    if (profilePayload && Object.keys(profilePayload).length) {
      // 1 user chỉ có 1 profile, tìm profile hiện tại hoặc tạo mới
      let profile = await this.profileRepo.findOne({ where: { userId: entity.id } });
      if (profile) {
        // Cập nhật profile hiện tại
        Object.assign(profile, profilePayload as any);
        await this.profileRepo.save(profile);
      } else {
        // Tạo profile mới nếu chưa có
        const createdProfile = this.profileRepo.create({ ...(profilePayload as any), userId: entity.id });
        await this.profileRepo.save(createdProfile);
      }
    }
  }

  protected async afterDelete(entity: User): Promise<void> {
    // Xóa profile sau khi xóa user
    try {
      const profile = await this.profileRepo.findOne({ where: { userId: entity.id } });
      if (profile) {
        await this.profileRepo.remove(profile);
      }
    } catch (error) {
      // Log error nhưng không throw vì user đã được xóa
      // Removed console.error for production
    }
  }
}


