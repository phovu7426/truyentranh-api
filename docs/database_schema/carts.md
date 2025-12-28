# carts

**Mục đích**: Chi tiết các item trong giỏ hàng (snapshot tại thời điểm thêm).

## Columns

```sql
id                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
cart_header_id        BIGINT UNSIGNED NOT NULL
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

- many-to-one → `cart_headers`
- many-to-one → `products`
- many-to-one → `product_variants`

## Foreign Keys

- `cart_header_id` → `cart_headers(id)` (`ON DELETE CASCADE`)
- `product_id` → `products(id)`
- `product_variant_id` → `product_variants(id)`

## Constraints

- `UNIQUE (cart_header_id, product_id, product_variant_id)`
- `CHECK (quantity > 0)`

## Indexes

- `idx_carts_cart_header_id (cart_header_id)`
- `idx_carts_product_id (product_id)`
- `idx_carts_product_variant_id (product_variant_id)`
- `idx_carts_quantity (quantity)`

