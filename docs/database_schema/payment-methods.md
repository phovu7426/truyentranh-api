# payment_methods

**Mục đích**: Quản lý phương thức thanh toán được phép sử dụng.

## Columns

```sql
id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
name             VARCHAR(255) NOT NULL
code             VARCHAR(50) NOT NULL UNIQUE
description      TEXT NULL
provider         VARCHAR(100) NULL
config           JSON NULL
status           ENUM('active','inactive') NOT NULL DEFAULT 'active'
created_user_id  BIGINT UNSIGNED NULL
updated_user_id  BIGINT UNSIGNED NULL
created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
deleted_at       DATETIME NULL
```

## Relations

- one-to-many → `payments`

## Indexes

- `idx_payment_methods_code (code)` unique
- `idx_payment_methods_status (status)`

