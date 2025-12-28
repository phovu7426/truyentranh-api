/**
 * Coupon Type Enum
 * 
 * Định nghĩa các loại mã giảm giá trong hệ thống
 */
export enum CouponType {
    /** Giảm giá theo phần trăm */
    PERCENTAGE = 'percentage',

    /** Giảm giá theo số tiền cố định */
    FIXED_AMOUNT = 'fixed_amount',

    /** Miễn phí vận chuyển */
    FREE_SHIPPING = 'free_shipping',
}

/**
 * Labels cho CouponType
 */
export const CouponTypeLabels: Record<CouponType, string> = {
    [CouponType.PERCENTAGE]: 'Giảm theo phần trăm',
    [CouponType.FIXED_AMOUNT]: 'Giảm theo số tiền cố định',
    [CouponType.FREE_SHIPPING]: 'Miễn phí vận chuyển',
};
