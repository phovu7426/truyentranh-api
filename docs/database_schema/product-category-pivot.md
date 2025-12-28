# product_category (pivot)

**Mục đích**: Liên kết many-to-many giữa `products` và `product_categories`.

## Columns

```sql
id                   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
product_id           BIGINT UNSIGNED NOT NULL
product_category_id  BIGINT UNSIGNED NOT NULL
created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

## Relations

- many-to-one → `products`
- many-to-one → `product_categories`

## Foreign Keys

- `product_id` → `products(id)` (`ON DELETE CASCADE`)
- `product_category_id` → `product_categories(id)` (`ON DELETE CASCADE`)

## Constraints

- `UNIQUE (product_id, product_category_id)`

## Indexes

- `idx_ppc_product_id (product_id)`
- `idx_ppc_category_id (product_category_id)`

