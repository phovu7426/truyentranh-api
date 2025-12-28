# order_items

**Mục đích**: Chi tiết sản phẩm trong đơn hàng (snapshot theo thời điểm đặt).

## Columns

```sql
id                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
order_id              BIGINT UNSIGNED NOT NULL
product_id            BIGINT UNSIGNED NOT NULL
product_variant_id    BIGINT UNSIGNED NULL
product_name          VARCHAR(255) NOT NULL
product_sku           VARCHAR(100) NOT NULL
variant_name          VARCHAR(255) NULL
quantity              INT NOT NULL DEFAULT 1
unit_price            DECIMAL(15,2) NOT NULL
total_price           DECIMAL(15,2) NOT NULL
product_attributes    JSON NULL
created_user_id       BIGINT UNSIGNED NULL
updated_user_id       BIGINT UNSIGNED NULL
created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

## Relations

- many-to-one → `orders`
- many-to-one → `products`
- many-to-one → `product_variants`

## Foreign Keys

- `order_id` → `orders(id)` (`ON DELETE RESTRICT`)
- `product_id` → `products(id)`
- `product_variant_id` → `product_variants(id)`

## Constraints

- `CHECK (quantity > 0)`

## Indexes

- `idx_order_items_order_id (order_id)`
- `idx_order_items_product_id (product_id)`
- `idx_order_items_variant_id (product_variant_id)`
- `idx_order_items_product_sku (product_sku)`
- `idx_order_items_quantity (quantity)`
- `idx_order_items_unit_total (unit_price, total_price)`

