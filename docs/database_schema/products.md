# products

**Mục đích**: Lưu thông tin chung của sản phẩm (không bao gồm giá, tồn kho).

## Columns

```sql
id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
name               VARCHAR(255) NOT NULL
slug               VARCHAR(255) NOT NULL UNIQUE
sku                VARCHAR(100) NOT NULL UNIQUE
description        LONGTEXT NULL
short_description  TEXT NULL
min_stock_level    INT NOT NULL DEFAULT 0
image              VARCHAR(500) NULL
gallery            JSON NULL
status             ENUM('active','inactive','draft') NOT NULL DEFAULT 'active'
is_featured        BOOLEAN NOT NULL DEFAULT FALSE
is_variable        BOOLEAN NOT NULL DEFAULT TRUE
is_digital         BOOLEAN NOT NULL DEFAULT FALSE
download_limit     INT NULL
meta_title         VARCHAR(255) NULL
meta_description   TEXT NULL
canonical_url      VARCHAR(500) NULL
og_title           VARCHAR(255) NULL
og_description     TEXT NULL
og_image           VARCHAR(500) NULL
created_user_id    BIGINT UNSIGNED NULL
updated_user_id    BIGINT UNSIGNED NULL
created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
deleted_at         DATETIME NULL
```

## Relations

- one-to-many → `product_variants`
- many-to-many → `product_categories` (qua `product_category`)
- one-to-many → `carts`
- one-to-many → `order_items`

## Indexes

- `idx_products_name (name)`
- `idx_products_slug (slug)`
- `idx_products_sku (sku)`
- `idx_products_status (status)`
- `idx_products_is_featured (is_featured)`
- `idx_products_is_variable (is_variable)`
- `idx_products_is_digital (is_digital)`
- composite: `(status, is_featured)`, `(status, created_at)`, `idx_products_deleted_at (deleted_at)`

