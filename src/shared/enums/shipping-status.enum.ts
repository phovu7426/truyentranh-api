/**
 * Shipping Status Enum
 * 
 * Định nghĩa các trạng thái vận chuyển của đơn hàng
 */
export enum ShippingStatus {
    /** Chờ xử lý */
    PENDING = 'pending',

    /** Đang chuẩn bị hàng */
    PREPARING = 'preparing',

    /** Đã giao cho đơn vị vận chuyển */
    SHIPPED = 'shipped',

    /** Đã giao hàng thành công */
    DELIVERED = 'delivered',

    /** Hàng bị trả lại */
    RETURNED = 'returned',
}

/**
 * Labels cho ShippingStatus
 */
export const ShippingStatusLabels: Record<ShippingStatus, string> = {
    [ShippingStatus.PENDING]: 'Chờ xử lý',
    [ShippingStatus.PREPARING]: 'Đang chuẩn bị hàng',
    [ShippingStatus.SHIPPED]: 'Đã giao cho đơn vị vận chuyển',
    [ShippingStatus.DELIVERED]: 'Đã giao hàng thành công',
    [ShippingStatus.RETURNED]: 'Hàng bị trả lại',
};


/**
 * Các trạng thái vận chuyển hoàn tất
 */
export const FINAL_SHIPPING_STATUSES = [
    ShippingStatus.DELIVERED,
    ShippingStatus.RETURNED,
];