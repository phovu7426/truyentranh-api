# product_attributes

**Mục đích**: Lưu cấu hình thuộc tính áp dụng cho sản phẩm/biến thể (màu, kích thước…).

## Columns

```sql
id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
name            VARCHAR(255) NOT NULL
slug            VARCHAR(255) NOT NULL UNIQUE
type            ENUM('text','select','multiselect','color','image') NOT NULL DEFAULT 'text'
is_required     BOOLEAN NOT NULL DEFAULT FALSE
is_variation    BOOLEAN NOT NULL DEFAULT FALSE
is_filterable   BOOLEAN NOT NULL DEFAULT TRUE
sort_order      INT NOT NULL DEFAULT 0
status          ENUM('active','inactive') NOT NULL DEFAULT 'active'
created_user_id BIGINT UNSIGNED NULL
updated_user_id BIGINT UNSIGNED NULL
created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
deleted_at      DATETIME NULL
```

## Relations

- one-to-many → `product_attribute_values`
- one-to-many → `product_variant_attributes`

## Indexes

- `idx_product_attributes_name (name)`
- `idx_product_attributes_slug (slug)`
- `idx_product_attributes_type (type)`
- `idx_product_attributes_required (is_required)`
- `idx_product_attributes_variation (is_variation)`
- `idx_product_attributes_filterable (is_filterable)`
- `idx_product_attributes_status (status)`
- `idx_product_attributes_sort_order (sort_order)`
- composite: `(status, sort_order)`, `(is_variation, status)`, `idx_product_attributes_deleted_at (deleted_at)`

