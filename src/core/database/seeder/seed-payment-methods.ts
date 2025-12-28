import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PaymentMethod } from '@/shared/entities/payment-method.entity';
import { User } from '@/shared/entities/user.entity';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { PaymentType } from '@/shared/enums/payment-type.enum';

@Injectable()
export class SeedPaymentMethods {
  private readonly logger = new Logger(SeedPaymentMethods.name);

  constructor(private readonly dataSource: DataSource) { }

  async seed(): Promise<void> {
    this.logger.log('Seeding payment methods...');
    const repo = this.dataSource.getRepository(PaymentMethod);
    const userRepo = this.dataSource.getRepository(User);
    const count = await repo.count();
    if (count > 0) {
      this.logger.log('Payment methods already seeded, skipping...');
      return;
    }

    // Get admin user for audit fields
    const adminUser = await userRepo.findOne({ where: { username: 'admin' } as any });
    const defaultUserId = adminUser?.id ?? 1;

    await repo.insert([
      {
        name: 'Thanh toán khi nhận hàng (COD)',
        code: 'cod',
        description: 'Thanh toán bằng tiền mặt khi nhận hàng',
        provider: 'offline',
        type: PaymentType.OFFLINE,
        status: BasicStatus.Active,
        created_user_id: defaultUserId,
        updated_user_id: defaultUserId,
      },
      {
        name: 'Chuyển khoản ngân hàng',
        code: 'bank_transfer',
        description: 'Thanh toán qua chuyển khoản ngân hàng',
        provider: 'bank',
        type: PaymentType.OFFLINE,
        status: BasicStatus.Active,
        created_user_id: defaultUserId,
        updated_user_id: defaultUserId,
      },
      {
        name: 'Thanh toán online VNPay',
        code: 'vnpay',
        description: 'Thanh toán trực tuyến qua VNPay - Hỗ trợ thẻ ATM, Visa, MasterCard',
        provider: 'vnpay',
        type: PaymentType.ONLINE,
        status: BasicStatus.Active,
        created_user_id: defaultUserId,
        updated_user_id: defaultUserId,
      },
      {
        name: 'Thanh toán online MoMo',
        code: 'momo',
        description: 'Thanh toán trực tuyến qua ví điện tử MoMo',
        provider: 'momo',
        type: PaymentType.ONLINE,
        status: BasicStatus.Active,
        created_user_id: defaultUserId,
        updated_user_id: defaultUserId,
      },
    ]);

    this.logger.log('Seeded payment methods');
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing payment methods...');
    await this.dataSource.getRepository(PaymentMethod).clear();
  }
}


