# shipping_methods

**Mục đích**: Danh sách phương thức vận chuyển khả dụng.

## Columns

```sql
id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
name             VARCHAR(255) NOT NULL
code             VARCHAR(50) NOT NULL UNIQUE
description      TEXT NULL
base_cost        DECIMAL(10,2) NOT NULL DEFAULT 0
estimated_days   INT NULL
status           ENUM('active','inactive') NOT NULL DEFAULT 'active'
created_user_id  BIGINT UNSIGNED NULL
updated_user_id  BIGINT UNSIGNED NULL
created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
deleted_at       DATETIME NULL
```

## Relations

- one-to-many → `orders`

## Indexes

- `idx_shipping_methods_code (code)` unique
- `idx_shipping_methods_status (status)`

