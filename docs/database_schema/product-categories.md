# product_categories

**Mục đích**: Danh mục sản phẩm với cấu trúc cây (parent-child) và thông tin SEO.

## Columns

```sql
id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
name             VARCHAR(255) NOT NULL
slug             VARCHAR(255) NOT NULL UNIQUE
description      TEXT NULL
parent_id        BIGINT UNSIGNED NULL
image            VARCHAR(500) NULL
icon             VARCHAR(100) NULL
status           ENUM('active','inactive') NOT NULL DEFAULT 'active'
sort_order       INT NOT NULL DEFAULT 0
meta_title       VARCHAR(255) NULL
meta_description TEXT NULL
canonical_url    VARCHAR(500) NULL
og_image         VARCHAR(500) NULL
created_user_id  BIGINT UNSIGNED NULL
updated_user_id  BIGINT UNSIGNED NULL
created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
deleted_at       DATETIME NULL
```

## Relations

- self many-to-one → `product_categories` (parent)
- self one-to-many → `product_categories` (children)
- many-to-many → `products` (qua bảng `product_category`)

## Foreign Keys

- `parent_id` → `product_categories(id)` (`ON DELETE SET NULL`)

## Indexes

- `idx_product_categories_name (name)`
- `idx_product_categories_slug (slug)`
- `idx_product_categories_parent_id (parent_id)`
- `idx_product_categories_status (status)`
- `idx_product_categories_sort_order (sort_order)`
- composite: `(status, sort_order)`, `(parent_id, status)`, `idx_product_categories_deleted_at (deleted_at)`

