# product_attribute_values

**Mục đích**: Lưu các giá trị cụ thể cho từng thuộc tính (ví dụ Đỏ, 128GB…).

## Columns

```sql
id                       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
product_attribute_id     BIGINT UNSIGNED NOT NULL
value                    VARCHAR(255) NOT NULL
color_code               VARCHAR(7) NULL
image                    VARCHAR(500) NULL
sort_order               INT NOT NULL DEFAULT 0
status                   ENUM('active','inactive') NOT NULL DEFAULT 'active'
created_user_id          BIGINT UNSIGNED NULL
updated_user_id          BIGINT UNSIGNED NULL
created_at               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
deleted_at               DATETIME NULL
```

## Relations

- many-to-one → `product_attributes`
- one-to-many → `product_variant_attributes`

## Foreign Keys

- `product_attribute_id` → `product_attributes(id)` (`ON DELETE CASCADE`)

## Indexes

- `idx_pav_attribute_id (product_attribute_id)`
- `idx_pav_value (value)`
- `idx_pav_color_code (color_code)`
- `idx_pav_status (status)`
- `idx_pav_sort_order (sort_order)`
- composite: `(product_attribute_id, status)`, `(product_attribute_id, sort_order)`, `idx_pav_deleted_at (deleted_at)`

