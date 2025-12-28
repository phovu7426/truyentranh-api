/**
 * Payment Status Enum
 * 
 * Định nghĩa các trạng thái thanh toán của đơn hàng
 */
export enum PaymentStatus {
    /** Chờ thanh toán */
    PENDING = 'pending',

    /** Đã thanh toán thành công */
    PAID = 'paid',

    /** Thanh toán thất bại */
    FAILED = 'failed',

    /** Đã hoàn tiền */
    REFUNDED = 'refunded',

    /** Hoàn tiền một phần */
    PARTIALLY_REFUNDED = 'partially_refunded',
}

/**
 * Labels cho PaymentStatus
 */
export const PaymentStatusLabels: Record<PaymentStatus, string> = {
    [PaymentStatus.PENDING]: 'Chờ thanh toán',
    [PaymentStatus.PAID]: 'Đã thanh toán',
    [PaymentStatus.FAILED]: 'Thanh toán thất bại',
    [PaymentStatus.REFUNDED]: 'Đã hoàn tiền',
    [PaymentStatus.PARTIALLY_REFUNDED]: 'Hoàn tiền một phần',
};


/**
 * Các trạng thái thanh toán hoàn tất (không thể thay đổi)
 */
export const FINAL_PAYMENT_STATUSES = [
    PaymentStatus.REFUNDED,
    PaymentStatus.FAILED,
];