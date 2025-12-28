/**
 * Product Status Enum
 * 
 * Định nghĩa các trạng thái của sản phẩm trong hệ thống
 */
export enum ProductStatus {
    /** Sản phẩm đang hoạt động, có thể mua bán */
    ACTIVE = 'active',

    /** Sản phẩm ngừng hoạt động, không hiển thị */
    INACTIVE = 'inactive',

    /** Sản phẩm nháp, chưa hoàn thiện */
    DRAFT = 'draft',
}

/**
 * Labels cho ProductStatus
 */
export const ProductStatusLabels: Record<ProductStatus, string> = {
    [ProductStatus.ACTIVE]: 'Hoạt động',
    [ProductStatus.INACTIVE]: 'Ngừng hoạt động',
    [ProductStatus.DRAFT]: 'Nháp',
};


/**
 * Các trạng thái sản phẩm có thể hiển thị công khai
 */
export const PUBLIC_PRODUCT_STATUSES = [
    ProductStatus.ACTIVE,
];

/**
 * Các trạng thái sản phẩm có thể được quản lý
 */
export const MANAGEABLE_PRODUCT_STATUSES = [
    ProductStatus.ACTIVE,
    ProductStatus.INACTIVE,
    ProductStatus.DRAFT,
];