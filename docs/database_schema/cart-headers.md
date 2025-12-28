# cart_headers

**Mục đích**: Lưu thông tin tổng quan mỗi giỏ hàng (tổng tiền, người sở hữu).

## Columns

```sql
id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
uuid             VARCHAR(36) NULL UNIQUE
owner_key        VARCHAR(120) NOT NULL
user_id          BIGINT UNSIGNED NULL
currency         VARCHAR(10) NOT NULL DEFAULT 'VND'
subtotal         DECIMAL(15,2) NOT NULL DEFAULT 0
tax_amount       DECIMAL(15,2) NOT NULL DEFAULT 0
shipping_amount  DECIMAL(15,2) NOT NULL DEFAULT 0
discount_amount  DECIMAL(15,2) NOT NULL DEFAULT 0
total_amount     DECIMAL(15,2) NOT NULL DEFAULT 0
created_user_id  BIGINT UNSIGNED NULL
updated_user_id  BIGINT UNSIGNED NULL
created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

## Constraints

- `CHECK (total_amount >= 0)`
- `CHECK (owner_key <> '')`

## Indexes

- `idx_cart_headers_owner_key (owner_key)`
- `idx_cart_headers_user_id (user_id)`

## Lưu ý

- `owner_key`: định danh duy nhất cho cả guest và user (`guest:<uuid>` hoặc `user:<id>`).
- `user_id`: tham chiếu user thực (nullable), giúp join báo cáo.

