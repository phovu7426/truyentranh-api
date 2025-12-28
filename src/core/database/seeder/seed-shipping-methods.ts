import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ShippingMethod } from '@/shared/entities/shipping-method.entity';
import { User } from '@/shared/entities/user.entity';
import { BasicStatus } from '@/shared/enums/basic-status.enum';

@Injectable()
export class SeedShippingMethods {
  private readonly logger = new Logger(SeedShippingMethods.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed(): Promise<void> {
    this.logger.log('Seeding shipping methods...');
    const repo = this.dataSource.getRepository(ShippingMethod);
    const userRepo = this.dataSource.getRepository(User);
    const count = await repo.count();
    if (count > 0) {
      this.logger.log('Shipping methods already seeded, skipping...');
      return;
    }

    // Get admin user for audit fields
    const adminUser = await userRepo.findOne({ where: { username: 'admin' } as any });
    const defaultUserId = adminUser?.id ?? 1;

    await repo.insert([
      {
        name: 'Tiêu chuẩn',
        code: 'STANDARD',
        description: 'Giao hàng tiêu chuẩn 3-5 ngày',
        base_cost: '0',
        estimated_days: 5,
        status: BasicStatus.Active,
        created_user_id: defaultUserId,
        updated_user_id: defaultUserId,
      },
      {
        name: 'Nhanh',
        code: 'EXPRESS',
        description: 'Giao hàng nhanh 1-2 ngày',
        base_cost: '0',
        estimated_days: 2,
        status: BasicStatus.Active,
        created_user_id: defaultUserId,
        updated_user_id: defaultUserId,
      },
    ]);

    this.logger.log('Seeded shipping methods');
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing shipping methods...');
    await this.dataSource.getRepository(ShippingMethod).clear();
  }
}


