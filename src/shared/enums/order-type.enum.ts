/**
 * Order Type Enum
 * 
 * Định nghĩa loại đơn hàng dựa trên sản phẩm
 */
export enum OrderType {
    /** Đơn hàng vật lý - chứa sản phẩm vật lý */
    PHYSICAL = 'physical',

    /** Đơn hàng digital - chỉ chứa sản phẩm digital */
    DIGITAL = 'digital',

    /** Đơn hàng hỗn hợp - chứa cả vật lý và digital */
    MIXED = 'mixed',
}

/**
 * Labels cho OrderType
 */
export const OrderTypeLabels: Record<OrderType, string> = {
    [OrderType.PHYSICAL]: 'Đơn hàng vật lý',
    [OrderType.DIGITAL]: 'Đơn hàng digital',
    [OrderType.MIXED]: 'Đơn hàng hỗn hợp',
};
