import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '@/shared/entities/role.entity';
import { Permission } from '@/shared/entities/permission.entity';
import { User } from '@/shared/entities/user.entity';
import { RbacCacheService } from '@/modules/rbac/services/rbac-cache.service';

/**
 * Service quản lý RBAC (Role-Based Access Control)
 * Bao gồm: kiểm tra quyền/vai trò của user và quản lý roles cho user
 */
@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(Role) protected readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission) protected readonly permRepo: Repository<Permission>,
    @InjectRepository(User) protected readonly userRepo: Repository<User>,
    private readonly rbacCache: RbacCacheService,
  ) { }

  /**
   * Kiểm tra user có ÍT NHẤT 1 trong các permissions cần thiết (OR logic)
   * Điều kiện:
   * - Permission cần check phải có status = 'active'
   * - Role chứa permission phải có status = 'active'
   * - Cả role và permission đều phải thuộc user
   */
  async userHasPermissions(userId: number, required: string[]): Promise<boolean> {
    const ACTIVE = 'active';

    // Try cache first
    let cached = await this.rbacCache.getUserPermissions(userId);
    if (!cached) {
      // Build full set of active permissions (include parent if active)
      const rows = await this.userRepo
        .createQueryBuilder('user')
        .select(['perm.code AS code', 'parent.code AS parent'])
        .where('user.id = :userId', { userId })
        .innerJoin('user.roles', 'role', 'role.status = :rstatus', { rstatus: ACTIVE })
        .innerJoin('role.permissions', 'perm', 'perm.status = :pstatus', { pstatus: ACTIVE })
        .leftJoin('perm.parent', 'parent')
        .getRawMany<{ code: string; parent: string | null }>();

      const set = new Set<string>();
      for (const r of rows) {
        if (r.code) set.add(r.code);
        if (r.parent) set.add(r.parent);
      }
      await this.rbacCache.setUserPermissions(userId, set);
      cached = set;
    }

    for (const need of required) {
      if (cached.has(need)) return true;
    }
    return false;
  }

  /**
   * Sync roles cho user (thay thế toàn bộ roles hiện tại)
   * @param userId - ID của user
   * @param roleIds - Mảng role IDs cần gán cho user (nếu rỗng thì xóa hết roles)
   */
  async syncRoles(userId: number, roleIds: number[]) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (roleIds.length > 0) {
      const roles = await this.roleRepo.findBy({ id: In(roleIds) });
      if (roles.length !== roleIds.length) {
        throw new BadRequestException('Some role IDs are invalid');
      }
      user.roles = roles;
    } else {
      user.roles = [];
    }

    return this.userRepo.save(user);
  }
}

