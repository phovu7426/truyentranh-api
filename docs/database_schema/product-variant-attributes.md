# product_variant_attributes

**Mục đích**: Bảng pivot liên kết biến thể với thuộc tính và giá trị thuộc tính.

## Columns

```sql
id                         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
product_variant_id         BIGINT UNSIGNED NOT NULL
product_attribute_id       BIGINT UNSIGNED NOT NULL
product_attribute_value_id BIGINT UNSIGNED NOT NULL
created_at                 DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at                 DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

## Relations

- many-to-one → `product_variants`
- many-to-one → `product_attributes`
- many-to-one → `product_attribute_values`

## Foreign Keys

- `product_variant_id` → `product_variants(id)` (`ON DELETE CASCADE`)
- `product_attribute_id` → `product_attributes(id)` (`ON DELETE CASCADE`)
- `product_attribute_value_id` → `product_attribute_values(id)` (`ON DELETE CASCADE`)

## Constraints

- `UNIQUE (product_variant_id, product_attribute_id)`

## Indexes

- `idx_pva_variant_id (product_variant_id)`
- `idx_pva_attribute_id (product_attribute_id)`
- `idx_pva_value_id (product_attribute_value_id)`

