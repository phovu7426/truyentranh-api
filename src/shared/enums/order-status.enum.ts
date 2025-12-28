/**
 * Order Status Enum
 * 
 * Định nghĩa các trạng thái của đơn hàng trong hệ thống
 */
export enum OrderStatus {
    /** Đơn hàng mới tạo, chờ xử lý */
    PENDING = 'pending',

    /** Đơn hàng đã được xác nhận */
    CONFIRMED = 'confirmed',

    /** Đơn hàng đang được xử lý/đóng gói */
    PROCESSING = 'processing',

    /** Đơn hàng đã được giao cho đơn vị vận chuyển */
    SHIPPED = 'shipped',

    /** Đơn hàng đã được giao thành công */
    DELIVERED = 'delivered',

    /** Đơn hàng đã bị hủy */
    CANCELLED = 'cancelled',
}

/**
 * Labels cho OrderStatus
 */
export const OrderStatusLabels: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: 'Chờ xử lý',
    [OrderStatus.CONFIRMED]: 'Đã xác nhận',
    [OrderStatus.PROCESSING]: 'Đang xử lý',
    [OrderStatus.SHIPPED]: 'Đã giao hàng',
    [OrderStatus.DELIVERED]: 'Đã giao thành công',
    [OrderStatus.CANCELLED]: 'Đã hủy',
};


/**
 * Các trạng thái cho phép hủy đơn hàng
 */
export const CANCELLABLE_ORDER_STATUSES = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
];

/**
 * Các trạng thái đơn hàng hoàn tất (không thể thay đổi)
 */
export const FINAL_ORDER_STATUSES = [
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
];