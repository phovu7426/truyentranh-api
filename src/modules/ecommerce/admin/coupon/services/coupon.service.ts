import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon, CouponStatus } from '@/shared/entities/coupon.entity';
import { CrudService } from '@/common/base/services/crud.service';

@Injectable()
export class AdminCouponService extends CrudService<Coupon> {
  constructor(
    @InjectRepository(Coupon)
    protected readonly couponRepository: Repository<Coupon>,
  ) {
    super(couponRepository);
  }

  /**
   * Check and update expired coupons
   */
  async updateExpiredCoupons(): Promise<void> {
    await this.couponRepository
      .createQueryBuilder()
      .update(Coupon)
      .set({ status: CouponStatus.EXPIRED })
      .where('end_date < :now', { now: new Date() })
      .andWhere('status = :status', { status: CouponStatus.ACTIVE })
      .execute();
  }

  /**
   * Get coupon statistics
   */
  async getCouponStats(couponId: number): Promise<any> {
    const coupon = await this.getOne({ id: couponId });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return {
      total_usage: coupon.used_count,
      remaining: coupon.usage_limit
        ? coupon.usage_limit - coupon.used_count
        : null,
      usage_rate: coupon.usage_limit
        ? (coupon.used_count / coupon.usage_limit) * 100
        : null,
    };
  }

  /**
   * Check if coupon code is unique
   */
  async isCodeUnique(code: string, excludeId?: number): Promise<boolean> {
    const query = this.couponRepository
      .createQueryBuilder('coupon')
      .where('coupon.code = :code', { code });

    if (excludeId) {
      query.andWhere('coupon.id != :excludeId', { excludeId });
    }

    const count = await query.getCount();
    return count === 0;
  }

  /**
   * Get active coupons count
   */
  async getActiveCouponsCount(): Promise<number> {
    return this.couponRepository.count({
      where: { status: CouponStatus.ACTIVE },
    });
  }
}