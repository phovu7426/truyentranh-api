import { DataSource } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { User } from '@/shared/entities/user.entity';
import { Role } from '@/shared/entities/role.entity';
import { UserStatus } from '@/shared/enums/user-status.enum';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeedUsers {
  private readonly logger = new Logger(SeedUsers.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed(): Promise<void> {
    this.logger.log('Seeding users...');

    const userRepo = this.dataSource.getRepository(User);
    const roleRepo = this.dataSource.getRepository(Role);

    // Check if users already exist
    const existingUsers = await userRepo.count();
    if (existingUsers > 0) {
      this.logger.log('Users already seeded, skipping...');
      return;
    }

    // Get roles
    const adminRole = await roleRepo.findOne({ where: { code: 'admin' } as any });
    const managerRole = await roleRepo.findOne({ where: { code: 'manager' } as any });
    const editorRole = await roleRepo.findOne({ where: { code: 'editor' } as any });
    const authorRole = await roleRepo.findOne({ where: { code: 'author' } as any });
    const userRole = await roleRepo.findOne({ where: { code: 'user' } as any });

    // Seed users - 20 users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
      // Admin users
      { username: 'admin', email: 'admin@example.com', password: hashedPassword, status: UserStatus.Active, email_verified_at: new Date(), role: adminRole },
      { username: 'superadmin', email: 'superadmin@example.com', password: hashedPassword, status: UserStatus.Active, email_verified_at: new Date(), role: adminRole },
      
      // Manager users
      { username: 'manager1', email: 'manager1@example.com', password: hashedPassword, status: UserStatus.Active, email_verified_at: new Date(), role: managerRole },
      { username: 'manager2', email: 'manager2@example.com', password: hashedPassword, status: UserStatus.Active, email_verified_at: new Date(), role: managerRole },
      
      // Editor users
      { username: 'editor1', email: 'editor1@example.com', password: hashedPassword, status: UserStatus.Active, email_verified_at: new Date(), role: editorRole },
      { username: 'editor2', email: 'editor2@example.com', password: hashedPassword, status: UserStatus.Active, email_verified_at: new Date(), role: editorRole },
      { username: 'editor3', email: 'editor3@example.com', password: hashedPassword, status: UserStatus.Active, email_verified_at: new Date(), role: editorRole },
      
      // Author users
      { username: 'author1', email: 'author1@example.com', password: hashedPassword, status: UserStatus.Active, email_verified_at: new Date(), role: authorRole },
      { username: 'author2', email: 'author2@example.com', password: hashedPassword, status: UserStatus.Active, email_verified_at: new Date(), role: authorRole },
      { username: 'author3', email: 'author3@example.com', password: hashedPassword, status: UserStatus.Active, email_verified_at: new Date(), role: authorRole },
      { username: 'author4', email: 'author4@example.com', password: hashedPassword, status: UserStatus.Active, email_verified_at: new Date(), role: authorRole },
      
      // Regular users
      { username: 'user1', email: 'user1@example.com', password: hashedPassword, status: UserStatus.Active, email_verified_at: new Date(), role: userRole },
      { username: 'user2', email: 'user2@example.com', password: hashedPassword, status: UserStatus.Active, email_verified_at: new Date(), role: userRole },
      { username: 'user3', email: 'user3@example.com', password: hashedPassword, status: UserStatus.Active, email_verified_at: new Date(), role: userRole },
      { username: 'user4', email: 'user4@example.com', password: hashedPassword, status: UserStatus.Active, email_verified_at: new Date(), role: userRole },
      { username: 'user5', email: 'user5@example.com', password: hashedPassword, status: UserStatus.Active, email_verified_at: new Date(), role: userRole },
      { username: 'user6', email: 'user6@example.com', password: hashedPassword, status: UserStatus.Pending, email_verified_at: null, role: userRole },
      { username: 'user7', email: 'user7@example.com', password: hashedPassword, status: UserStatus.Active, email_verified_at: new Date(), role: userRole },
      { username: 'user8', email: 'user8@example.com', password: hashedPassword, status: UserStatus.Active, email_verified_at: new Date(), role: userRole },
      { username: 'user9', email: 'user9@example.com', password: hashedPassword, status: UserStatus.Inactive, email_verified_at: new Date(), role: userRole },
    ];

    for (const userData of users) {
      const role = userData.role;
      const { role: _, ...userWithoutRole } = userData;
      
      const user = userRepo.create(userWithoutRole);
      if (role) {
        user.roles = [role];
      }
      const saved = await userRepo.save(user);
      this.logger.log(`Created user: ${saved.username || saved.email} (role: ${role?.code || 'none'})`);
    }

    this.logger.log(`Users seeding completed - Total: ${users.length}`);
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing users...');
    const userRepo = this.dataSource.getRepository(User);
    await userRepo.clear();
    this.logger.log('Users cleared');
  }
}
