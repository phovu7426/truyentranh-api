import { DataSource, Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { Role } from '@/shared/entities/role.entity';
import { Permission } from '@/shared/entities/permission.entity';
import { User } from '@/shared/entities/user.entity';

@Injectable()
export class SeedRoles {
  private readonly logger = new Logger(SeedRoles.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed(): Promise<void> {
    this.logger.log('Seeding roles...');

    const roleRepo = this.dataSource.getRepository(Role);
    const permRepo = this.dataSource.getRepository(Permission);
    const userRepo = this.dataSource.getRepository(User);

    // Check if roles already exist
    const existingRoles = await roleRepo.count();
    if (existingRoles > 0) {
      this.logger.log('Roles already seeded, skipping...');
      return;
    }

    // Get admin user for audit fields
    const adminUser = await userRepo.findOne({ where: { username: 'admin' } as any });
    const defaultUserId = adminUser?.id ?? 1;

    // Seed roles
    const rolesData = [
      {
        code: 'admin',
        name: 'Administrator',
        status: 'active',
        parent_id: null,
      },
      {
        code: 'manager',
        name: 'Quản lý',
        status: 'active',
        parent_id: null,
      },
      {
        code: 'editor',
        name: 'Biên tập viên',
        status: 'active',
        parent_id: null,
      },
      {
        code: 'author',
        name: 'Tác giả',
        status: 'active',
        parent_id: null,
      },
      {
        code: 'user',
        name: 'Người dùng',
        status: 'active',
        parent_id: null,
      },
    ];

    const createdRoles: Map<string, Role> = new Map();

    // Create roles first
    for (const roleData of rolesData) {
      const role = roleRepo.create({
        ...roleData,
        created_user_id: defaultUserId,
        updated_user_id: defaultUserId,
      });
      const saved = await roleRepo.save(role);
      createdRoles.set(saved.code, saved);
      this.logger.log(`Created role: ${saved.code}`);
    }

    // Assign permissions to roles
    await this.assignPermissionsToRoles(roleRepo, permRepo, createdRoles);

    this.logger.log('Roles seeding completed');
  }

  private async assignPermissionsToRoles(
    roleRepo: Repository<Role>,
    permRepo: Repository<Permission>,
    createdRoles: Map<string, Role>
  ): Promise<void> {
    // Admin gets all permissions
    const adminRole = createdRoles.get('admin');
    if (adminRole) {
      const allPermissions = await permRepo.find();
      adminRole.permissions = allPermissions;
      const saved = await roleRepo.save(adminRole);
      this.logger.log(`Assigned ${allPermissions.length} permissions to admin role`);
    }

    // Manager gets most permissions except system management
    const managerRole = createdRoles.get('manager');
    if (managerRole) {
      const managerPerms = await permRepo.find({
        where: [
          { code: 'post.manage' },
          { code: 'postcategory.manage' },
          { code: 'posttag.manage' },
          { code: 'user.manage' },
          { code: 'role.manage' },
          { code: 'permission.manage' },
        ],
      });
      // Also get all children of these permissions
      const allPerms = await permRepo.find();
      const managerPermIds = new Set(managerPerms.map((p: Permission) => p.id));
      const childrenPerms = allPerms.filter((p: Permission) => {
        if (managerPermIds.has(p.id)) return true;
        let current = p.parent;
        while (current) {
          if (managerPermIds.has(current.id)) return true;
          current = current.parent;
        }
        return false;
      });
      managerRole.permissions = childrenPerms;
      await roleRepo.save(managerRole);
      this.logger.log(`Assigned ${childrenPerms.length} permissions to manager role`);
    }

    // Editor gets post-related permissions
    const editorRole = createdRoles.get('editor');
    if (editorRole) {
      const editorPerms = await permRepo.find({
        where: [
          { code: 'post.manage' },
          { code: 'postcategory.manage' },
          { code: 'posttag.manage' },
        ],
      });
      const allPerms = await permRepo.find();
      const editorPermIds = new Set(editorPerms.map((p: Permission) => p.id));
      const childrenPerms = allPerms.filter((p: Permission) => {
        if (editorPermIds.has(p.id)) return true;
        let current = p.parent;
        while (current) {
          if (editorPermIds.has(current.id)) return true;
          current = current.parent;
        }
        return false;
      });
      editorRole.permissions = childrenPerms;
      await roleRepo.save(editorRole);
      this.logger.log(`Assigned ${childrenPerms.length} permissions to editor role`);
    }

    // Author gets basic post permissions
    const authorRole = createdRoles.get('author');
    if (authorRole) {
      const authorPerms = await permRepo.find({
        where: [
          { code: 'post.create' },
          { code: 'post.read' },
          { code: 'post.update' },
        ],
      });
      authorRole.permissions = authorPerms;
      await roleRepo.save(authorRole);
      this.logger.log(`Assigned ${authorPerms.length} permissions to author role`);
    }

    // User gets read-only permissions
    const userRole = createdRoles.get('user');
    if (userRole) {
      const userPerms = await permRepo.find({
        where: [
          { code: 'post.read' },
        ],
      });
      userRole.permissions = userPerms;
      await roleRepo.save(userRole);
      this.logger.log(`Assigned ${userPerms.length} permissions to user role`);
    }
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing roles...');
    const roleRepo = this.dataSource.getRepository(Role);
    await roleRepo.clear();
    this.logger.log('Roles cleared');
  }
}
