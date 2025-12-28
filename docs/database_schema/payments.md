# payments

**Mục đích**: Ghi nhận giao dịch thanh toán gắn với đơn hàng.

## Columns

```sql
id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
order_id           BIGINT UNSIGNED NOT NULL
payment_method_id  BIGINT UNSIGNED NOT NULL
status             ENUM('pending','processing','completed','failed','refunded') NOT NULL DEFAULT 'pending'
amount             DECIMAL(15,2) NOT NULL
transaction_id     VARCHAR(255) NULL
payment_gateway    VARCHAR(100) NULL
paid_at            DATETIME NULL
refunded_at        DATETIME NULL
notes              TEXT NULL
created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

## Relations

- many-to-one → `orders`
- many-to-one → `payment_methods`

## Foreign Keys

- `order_id` → `orders(id)` (`ON DELETE CASCADE`)
- `payment_method_id` → `payment_methods(id)` (`ON DELETE RESTRICT`)

## Indexes

- `idx_payments_order_id (order_id)`
- `idx_payments_method_id (payment_method_id)`
- `idx_payments_status (status)`

