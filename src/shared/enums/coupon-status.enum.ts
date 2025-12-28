/**
 * Coupon Status Enum
 * 
 * Định nghĩa các trạng thái của mã giảm giá trong hệ thống
 */
export enum CouponStatus {
    /** Mã giảm giá đang hoạt động */
    ACTIVE = 'active',

    /** Mã giảm giá không hoạt động */
    INACTIVE = 'inactive',

    /** Mã giảm giá đã hết hạn */
    EXPIRED = 'expired',
}

/**
 * Labels cho CouponStatus
 */
export const CouponStatusLabels: Record<CouponStatus, string> = {
    [CouponStatus.ACTIVE]: 'Hoạt động',
    [CouponStatus.INACTIVE]: 'Ngừng hoạt động',
    [CouponStatus.EXPIRED]: 'Đã hết hạn',
};


/**
 * Các trạng thái mã giảm giá có thể sử dụng được
 */
export const USABLE_COUPON_STATUSES = [
    CouponStatus.ACTIVE,
];

/**
 * Các trạng thái mã giảm giá không thể sử dụng
 */
export const UNUSABLE_COUPON_STATUSES = [
    CouponStatus.INACTIVE,
    CouponStatus.EXPIRED,
];