import { Injectable } from '@nestjs/common';
import { BasicStatus, BasicStatusLabels } from '../basic-status.enum';
import { Gender } from '../gender.enum';
import { OrderStatus } from '../order-status.enum';
import { PaymentStatus } from '../payment-status.enum';
import { ShippingStatus } from '../shipping-status.enum';
import { UserStatus, UserStatusLabels } from '../user-status.enum';
import { ProductStatus, ProductStatusLabels } from '../product-status.enum';
import { CouponType, CouponTypeLabels } from '../coupon-type.enum';
import { CouponStatus, CouponStatusLabels } from '../coupon-status.enum';
import { ReviewStatus, ReviewStatusLabels } from '../review-status.enum';
import { AttributeType, AttributeTypeLabels } from '../product-attribute.enum';
import { PostStatus, PostStatusLabels } from '../post-status.enum';
import { PostType, PostTypeLabels } from '../post-type.enum';
import { ContactStatus, ContactStatusLabels } from '../contact-status.enum';

@Injectable()
export class EnumService {
  // Cấu hình cho từng loại enum - chỉ giữ lại value và label
  private readonly enumConfigs: Record<string, any> = {
    basic_status: {
      enum: BasicStatus,
      labels: BasicStatusLabels
    },
    gender: {
      enum: Gender,
      labels: {
        [Gender.Male]: 'Nam',
        [Gender.Female]: 'Nữ',
        [Gender.Other]: 'Khác'
      }
    },
    order_status: {
      enum: OrderStatus,
      labels: {
        [OrderStatus.PENDING]: 'Chờ xử lý',
        [OrderStatus.CONFIRMED]: 'Đã xác nhận',
        [OrderStatus.PROCESSING]: 'Đang xử lý',
        [OrderStatus.SHIPPED]: 'Đã giao hàng',
        [OrderStatus.DELIVERED]: 'Đã giao thành công',
        [OrderStatus.CANCELLED]: 'Đã hủy'
      }
    },
    payment_status: {
      enum: PaymentStatus,
      labels: {
        [PaymentStatus.PENDING]: 'Chờ thanh toán',
        [PaymentStatus.PAID]: 'Đã thanh toán',
        [PaymentStatus.FAILED]: 'Thanh toán thất bại',
        [PaymentStatus.REFUNDED]: 'Đã hoàn tiền',
        [PaymentStatus.PARTIALLY_REFUNDED]: 'Hoàn tiền một phần'
      }
    },
    shipping_status: {
      enum: ShippingStatus,
      labels: {
        [ShippingStatus.PENDING]: 'Chờ xử lý',
        [ShippingStatus.PREPARING]: 'Đang chuẩn bị hàng',
        [ShippingStatus.SHIPPED]: 'Đã giao cho đơn vị vận chuyển',
        [ShippingStatus.DELIVERED]: 'Đã giao hàng thành công',
        [ShippingStatus.RETURNED]: 'Hàng bị trả lại'
      }
    },
    user_status: {
      enum: UserStatus,
      labels: UserStatusLabels
    },
    product_status: {
      enum: ProductStatus,
      labels: ProductStatusLabels
    },
    coupon_type: {
      enum: CouponType,
      labels: {
        [CouponType.PERCENTAGE]: 'Giảm theo phần trăm',
        [CouponType.FIXED_AMOUNT]: 'Giảm theo số tiền cố định',
        [CouponType.FREE_SHIPPING]: 'Miễn phí vận chuyển'
      }
    },
    coupon_status: {
      enum: CouponStatus,
      labels: CouponStatusLabels
    },
    review_status: {
      enum: ReviewStatus,
      labels: ReviewStatusLabels
    },
    attribute_type: {
      enum: AttributeType,
      labels: AttributeTypeLabels
    },
    post_status: {
      enum: PostStatus,
      labels: PostStatusLabels
    },
    post_type: {
      enum: PostType,
      labels: PostTypeLabels
    },
    contact_status: {
      enum: ContactStatus,
      labels: ContactStatusLabels
    }
  };

  /**
   * Lấy tất cả enums với value và label
   */
  getAllEnums() {
    const result: Record<string, { value: string; label: string }[]> = {};
    for (const [key, config] of Object.entries(this.enumConfigs)) {
      result[key] = this.buildEnumValues(config);
    }
    return result;
  }

  /**
   * Lấy enum theo tên với value và label
   */
  getEnumByName(name: string): { name: string; values: { value: string; label: string }[] } | null {
    const config = this.enumConfigs[name.toLowerCase()];
    if (!config) return null;

    return {
      name: this.getEnumName(name),
      values: this.buildEnumValues(config)
    };
  }

  /**
   * Xây dựng giá trị enum chỉ với value và label
   */
  private buildEnumValues(config: any): { value: string; label: string }[] {
    return Object.values(config.enum).map((value: string | number) => {
      const stringValue = String(value);
      return {
        id: stringValue,
        value: stringValue,
        name: config.labels?.[value as keyof typeof config.labels] || stringValue,
        label: config.labels?.[value as keyof typeof config.labels] || stringValue
      };
    });
  }

  /**
   * Lấy tên enum từ key
   */
  private getEnumName(key: string): string {
    const nameMap: Record<string, string> = {
      basic_status: 'BasicStatus',
      gender: 'Gender',
      order_status: 'OrderStatus',
      payment_status: 'PaymentStatus',
      shipping_status: 'ShippingStatus',
      user_status: 'UserStatus',
      product_status: 'ProductStatus',
      coupon_type: 'CouponType',
      coupon_status: 'CouponStatus',
      review_status: 'ReviewStatus',
      attribute_type: 'AttributeType',
      post_status: 'PostStatus',
      post_type: 'PostType',
      contact_status: 'ContactStatus'
    };
    return nameMap[key] || key;
  }

  /**
   * Danh sách các enum key đang được hỗ trợ
   */
  getAvailableEnumKeys(): string[] {
    return Object.keys(this.enumConfigs);
  }
}