# orders

**Mục đích**: Lưu thông tin đơn hàng, trạng thái và tổng tiền.

## Columns

```sql
id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
order_number     VARCHAR(50) NOT NULL UNIQUE
user_id          BIGINT UNSIGNED NULL
customer_name    VARCHAR(255) NOT NULL
customer_email   VARCHAR(255) NOT NULL
customer_phone   VARCHAR(20) NOT NULL
shipping_address JSON NOT NULL
billing_address  JSON NOT NULL
shipping_method_id BIGINT UNSIGNED NULL
status           ENUM('pending','confirmed','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending'
payment_status   ENUM('pending','paid','failed','refunded','partially_refunded') NOT NULL DEFAULT 'pending'
shipping_status  ENUM('pending','preparing','shipped','delivered','returned') NOT NULL DEFAULT 'pending'
subtotal         DECIMAL(15,2) NOT NULL
tax_amount       DECIMAL(15,2) NOT NULL DEFAULT 0
shipping_amount  DECIMAL(15,2) NOT NULL DEFAULT 0
discount_amount  DECIMAL(15,2) NOT NULL DEFAULT 0
total_amount     DECIMAL(15,2) NOT NULL
currency         VARCHAR(3) NOT NULL DEFAULT 'VND'
notes            TEXT NULL
tracking_number  VARCHAR(100) NULL
shipped_at       DATETIME NULL
delivered_at     DATETIME NULL
created_user_id  BIGINT UNSIGNED NULL
updated_user_id  BIGINT UNSIGNED NULL
created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
deleted_at       DATETIME NULL
```

## Relations

- many-to-one → `users` (nullable)
- many-to-one → `shipping_methods` (nullable)
- one-to-many → `order_items`
- one-to-many → `payments`

## Constraints

- `CHECK (total_amount >= 0)`

## Foreign Keys

- `shipping_method_id` → `shipping_methods(id)`

## Indexes

- `idx_orders_user_id (user_id)`
- `idx_orders_customer_email (customer_email)`
- `idx_orders_customer_phone (customer_phone)`
- `idx_orders_status (status)`
- `idx_orders_payment_status (payment_status)`
- `idx_orders_shipping_status (shipping_status)`
- `idx_orders_total_amount (total_amount)`
- `idx_orders_tracking_number (tracking_number)`
- `idx_orders_shipping_method_id (shipping_method_id)`
- composite: `(status, created_at)`, `(payment_status, created_at)`, `(user_id, status)`, `idx_orders_deleted_at (deleted_at)`

