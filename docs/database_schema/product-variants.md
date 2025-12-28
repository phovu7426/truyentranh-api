# product_variants

**Mục đích**: Biến thể cụ thể của sản phẩm chứa giá, tồn kho, SKU riêng.

## Columns

```sql
id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
product_id       BIGINT UNSIGNED NOT NULL
sku              VARCHAR(100) NOT NULL UNIQUE
name             VARCHAR(255) NOT NULL
price            DECIMAL(15,2) NOT NULL
sale_price       DECIMAL(15,2) NULL
cost_price       DECIMAL(15,2) NULL
stock_quantity   INT NOT NULL DEFAULT 0
weight           DECIMAL(8,2) NULL
image            VARCHAR(500) NULL
status           ENUM('active','inactive') NOT NULL DEFAULT 'active'
created_user_id  BIGINT UNSIGNED NULL
updated_user_id  BIGINT UNSIGNED NULL
created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
deleted_at       DATETIME NULL
```

## Relations

- many-to-one → `products`
- one-to-many → `product_variant_attributes`
- one-to-many → `carts`
- one-to-many → `order_items`

## Foreign Keys

- `product_id` → `products(id)` (`ON DELETE CASCADE`)

## Constraints

- `CHECK (sale_price IS NULL OR sale_price <= price)`
- `CHECK (stock_quantity >= 0)`

## Indexes

- `idx_product_variants_product_id (product_id)`
- `idx_product_variants_sku (sku)`
- `idx_product_variants_name (name)`
- `idx_product_variants_price (price)`
- `idx_product_variants_sale_price (sale_price)`
- `idx_product_variants_stock (stock_quantity)`
- `idx_product_variants_status (status)`
- composite: `(product_id, status)`, `(status, stock_quantity)`, `idx_product_variants_deleted_at (deleted_at)`

