import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, In } from 'typeorm';
import { Role } from '@/shared/entities/role.entity';
import { Permission } from '@/shared/entities/permission.entity';
import { CrudService } from '@/common/base/services/crud.service';
import { ResponseRef } from '@/common/base/utils/response-ref.helper';
import { RbacCacheService } from '@/modules/rbac/services/rbac-cache.service';

@Injectable()
export class RoleService extends CrudService<Role> {
  private get permRepo(): Repository<Permission> {
    return this.repository.manager.getRepository(Permission);
  }

  constructor(
    @InjectRepository(Role) protected readonly repository: Repository<Role>,
    private readonly rbacCache: RbacCacheService,
  ) {
    super(repository);
  }

  protected override prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    return {
      ...base,
      relations: ['parent', 'children', 'permissions'],
    } as any;
  }

  /**
   * Override getOne để đảm bảo load relations trong admin
   */
  async getOne(
    where: any,
    options?: any,
  ) {
    // Đảm bảo load relations trong admin
    const adminOptions = {
      ...options,
      relations: ['parent', 'children', 'permissions'],
    };
    return super.getOne(where, adminOptions);
  }

  /**
   * Transform data sau khi lấy danh sách để chỉ giữ các fields cần thiết
   */
  protected async afterGetList(
    data: Role[],
    filters?: any,
    options?: any
  ): Promise<Role[]> {
    return data.map(role => {
      if (role.parent) {
        const { id, code, name, status } = role.parent;
        role.parent = { id, code, name, status } as any;
      }
      if (role.children) {
        role.children = role.children.map(child => {
          const { id, code, name, status } = child;
          return { id, code, name, status } as any;
        });
      }
      if (role.permissions) {
        role.permissions = role.permissions.map(perm => {
          const { id, code, name, status } = perm;
          return { id, code, name, status } as any;
        });
      }
      return role;
    });
  }

  /**
   * Transform data sau khi lấy một entity
   */
  protected async afterGetOne(
    entity: Role,
    where?: any,
    options?: any
  ): Promise<Role> {
    if (entity.parent) {
      const { id, code, name, status } = entity.parent;
      entity.parent = { id, code, name, status } as any;
    }
    if (entity.children) {
      entity.children = entity.children.map(child => {
        const { id, code, name, status } = child;
        return { id, code, name, status } as any;
      });
    }
    if (entity.permissions) {
      entity.permissions = entity.permissions.map(perm => {
        const { id, code, name, status } = perm;
        return { id, code, name, status } as any;
      });
    }
    return entity;
  }

  protected async beforeCreate(
    entity: Role,
    createDto: DeepPartial<Role>,
    response?: ResponseRef<Role | null>
  ): Promise<boolean> {
    // Validate code unique
    const code = (createDto as any).code;
    if (code) {
      const exists = await this.repository.findOne({ where: { code } as any });
      if (exists) {
        if (response) {
          response.message = 'Role code already exists';
          response.code = 'ROLE_CODE_EXISTS';
        }
        return false;
      }
    }

    // Handle parent_id
    const parentId = (createDto as any).parent_id;
    if (parentId) {
      const parent = await this.repository.findOne({ where: { id: parentId } as any });
      if (parent) {
        (createDto as any).parent = parent;
      }
      delete (createDto as any).parent_id;
    }

    return true;
  }

  protected async beforeUpdate(
    entity: Role,
    updateDto: DeepPartial<Role>,
    response?: ResponseRef<Role | null>
  ): Promise<boolean> {
    // Validate code unique (exclude current)
    const code = (updateDto as any).code;
    if (code && code !== entity.code) {
      const exists = await this.repository.findOne({ where: { code } as any });
      if (exists) {
        if (response) {
          response.message = 'Role code already exists';
          response.code = 'ROLE_CODE_EXISTS';
        }
        return false;
      }
    }

    // Handle parent_id
    const parentId = (updateDto as any).parent_id;
    if (parentId !== undefined) {
      if (parentId === null) {
        (updateDto as any).parent = null;
      } else {
        const parent = await this.repository.findOne({ where: { id: parentId } as any });
        if (parent) {
          (updateDto as any).parent = parent;
        }
      }
      delete (updateDto as any).parent_id;
    }

    return true;
  }

  protected async beforeDelete(
    entity: Role,
    response?: ResponseRef<null>
  ): Promise<boolean> {
    // Check if role has children
    const childrenCount = await this.repository.count({ where: { parent: { id: entity.id } } as any });
    if (childrenCount > 0) {
      if (response) {
        response.message = 'Cannot delete role with children';
        response.code = 'ROLE_HAS_CHILDREN';
      }
      return false;
    }

    // Check if role is assigned to users
    const userCount = await this.repository.manager
      .getRepository('User')
      .count({ where: { roles: { id: entity.id } } as any });

    if (userCount > 0) {
      if (response) {
        response.message = 'Cannot delete role assigned to users';
        response.code = 'ROLE_ASSIGNED_TO_USERS';
      }
      return false;
    }

    return true;
  }

  /**
   * Assign permissions to role (sync - replace all)
   */
  async assignPermissions(roleId: number, permissionIds: number[]) {
    const role = await this.repository.findOne({
      where: { id: roleId } as any,
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (permissionIds.length > 0) {
      const permissions = await this.permRepo.findBy({ id: In(permissionIds) });
      if (permissions.length !== permissionIds.length) {
        throw new BadRequestException('Some permission IDs are invalid');
      }
      role.permissions = permissions;
    } else {
      role.permissions = [];
    }

    const saved = await this.repository.save(role);
    if (this.rbacCache && typeof this.rbacCache.bumpVersion === 'function') {
      await this.rbacCache.bumpVersion().catch(() => undefined);
    }
    return saved;
  }
}


