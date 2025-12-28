# Đánh Giá Schema Hệ Thống Đặt Hàng

## ✅ ĐIỂM MẠNH

### 1. Kiến Trúc Product-Variant
- ✅ Tách biệt rõ ràng: Product (thông tin chung) vs Variant (giá, tồn kho)
- ✅ Hỗ trợ cả sản phẩm đơn giản và có biến thể
- ✅ Linh hoạt cho nhiều loại sản phẩm

### 2. Hệ Thống Attributes
- ✅ Thiết kế linh hoạt, có thể mở rộng
- ✅ Hỗ trợ nhiều loại: text, select, color, image
- ✅ Có flag `is_variation` để phân biệt thuộc tính tạo variant

### 3. Snapshot Data
- ✅ Cart và Order Items lưu snapshot đảm bảo tính nhất quán
- ✅ Bảo vệ dữ liệu khi sản phẩm thay đổi sau đó

### 4. Audit & Soft Delete
- ✅ Đầy đủ `created_user_id`, `updated_user_id`
- ✅ Soft delete cho các bảng quan trọng

---

## ⚠️ VẤN ĐỀ CẦN XEM XÉT

### 1. **cart_headers.id dùng VARCHAR thay vì BIGINT**

**Vấn đề:**
```sql
id VARCHAR (Primary Key)  -- ❌ Không nhất quán với quy ước dự án
```

**Đề xuất:**
- Dự án dùng `BIGINT UNSIGNED` cho tất cả primary keys
- Nếu cần UUID, nên tách riêng: `id BIGINT UNSIGNED` + `uuid VARCHAR(36) UNIQUE`
- Hoặc nếu bắt buộc dùng VARCHAR, cần giải thích rõ lý do

**Giải pháp:**
```sql
id BIGINT UNSIGNED PRIMARY KEY
uuid VARCHAR(36) UNIQUE  -- Nếu cần UUID cho public API
```

---

### 2. **Thiếu Foreign Key Constraints**

**Vấn đề:**
- Schema chỉ mô tả quan hệ nhưng không rõ ràng về:
  - ON DELETE CASCADE/SET NULL
  - ON UPDATE CASCADE
  - Foreign key indexes

**Đề xuất thêm:**

```sql
-- products → product_variants
ALTER TABLE product_variants
  ADD CONSTRAINT fk_variant_product
  FOREIGN KEY (product_id) REFERENCES products(id)
  ON DELETE CASCADE;  -- Xóa product → xóa variants

-- product_variants → product_variant_attributes
ALTER TABLE product_variant_attributes
  ADD CONSTRAINT fk_variant_attr_variant
  FOREIGN KEY (product_variant_id) REFERENCES product_variants(id)
  ON DELETE CASCADE;

-- carts → cart_headers
ALTER TABLE carts
  ADD CONSTRAINT fk_cart_header
  FOREIGN KEY (cart_header_id) REFERENCES cart_headers(id)
  ON DELETE CASCADE;  -- Xóa header → xóa items

-- order_items → orders
ALTER TABLE order_items
  ADD CONSTRAINT fk_order_item_order
  FOREIGN KEY (order_id) REFERENCES orders(id)
  ON DELETE RESTRICT;  -- Không cho xóa order có items
```

---

### 3. **Thiếu Validation Constraints**

**Vấn đề:**
- Không có CHECK constraints cho business rules
- Có thể có dữ liệu không hợp lệ

**Đề xuất thêm:**

```sql
-- product_variants: sale_price phải <= price
ALTER TABLE product_variants
  ADD CONSTRAINT chk_sale_price
  CHECK (sale_price IS NULL OR sale_price <= price);

-- product_variants: stock_quantity >= 0
ALTER TABLE product_variants
  ADD CONSTRAINT chk_stock_quantity
  CHECK (stock_quantity >= 0);

-- carts: quantity > 0
ALTER TABLE carts
  ADD CONSTRAINT chk_cart_quantity
  CHECK (quantity > 0);

-- order_items: quantity > 0
ALTER TABLE order_items
  ADD CONSTRAINT chk_order_quantity
  CHECK (quantity > 0);

-- cart_headers: total_amount >= 0
ALTER TABLE cart_headers
  ADD CONSTRAINT chk_cart_total
  CHECK (total_amount >= 0);

-- orders: total_amount >= 0
ALTER TABLE orders
  ADD CONSTRAINT chk_order_total
  CHECK (total_amount >= 0);
```

---

### 4. **Thiếu Index cho Timestamps**

**Vấn đề:**
- Theo quy ước dự án, cần index cho `created_at`, `updated_at`
- Thiếu index cho các trường audit: `created_user_id`, `updated_user_id`

**Đề xuất thêm:**

```sql
-- Tất cả các bảng cần có:
INDEX idx_created_at (created_at)
INDEX idx_updated_at (updated_at)
INDEX idx_created_user_id (created_user_id)
INDEX idx_updated_user_id (updated_user_id)
INDEX idx_deleted_at (deleted_at)  -- Nếu có soft delete
```

---

### 5. **product_variant_attributes: Thiếu Validation**

**Vấn đề:**
- Unique constraint `['product_variant_id', 'product_attribute_id']` là tốt
- Nhưng cần validate: `product_attribute_value_id` phải thuộc đúng `product_attribute_id`

**Đề xuất:**

```sql
-- Trigger hoặc Application-level validation:
-- Khi insert product_variant_attributes, cần check:
-- product_attribute_values.product_attribute_id = product_variant_attributes.product_attribute_id
```

**Hoặc dùng Composite Foreign Key (nếu DB hỗ trợ):**
```sql
-- MySQL không hỗ trợ composite FK trực tiếp
-- Cần validate ở application level
```

---

### 6. **cart_headers: Logic user_id vs session_id**

**Vấn đề:**
- Có thể có cả `user_id` và `session_id` cùng lúc (không rõ ràng)
- Cần constraint để đảm bảo chỉ có 1 trong 2

**Đề xuất:**

```sql
-- CHECK constraint (MySQL 8.0.16+)
ALTER TABLE cart_headers
  ADD CONSTRAINT chk_cart_user_or_session
  CHECK (
    (user_id IS NOT NULL AND session_id IS NULL) OR
    (user_id IS NULL AND session_id IS NOT NULL)
  );
```

---

### 7. **Thiếu Bảng Coupons/Discounts**

**Vấn đề:**
- `cart_headers.coupon_code` và `orders` có thể có coupon
- Nhưng không có bảng quản lý coupons (validation, expiry, usage limit)

**Đề xuất thêm bảng:**

```sql
CREATE TABLE coupons (
  id BIGINT UNSIGNED PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  type ENUM('percentage', 'fixed') NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  min_purchase_amount DECIMAL(15,2) NULL,
  max_discount_amount DECIMAL(15,2) NULL,
  usage_limit INTEGER NULL,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP NULL
);
```

---

### 8. **Thiếu Bảng Shipping Methods**

**Vấn đề:**
- `orders.shipping_amount` có giá trị nhưng không biết phương thức vận chuyển
- Không lưu được thông tin shipping method đã chọn

**Đề xuất:**

```sql
CREATE TABLE shipping_methods (
  id BIGINT UNSIGNED PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  base_cost DECIMAL(10,2) NOT NULL,
  cost_per_kg DECIMAL(10,2) NULL,
  estimated_days INTEGER,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- Thêm vào orders:
ALTER TABLE orders
  ADD COLUMN shipping_method_id BIGINT UNSIGNED NULL,
  ADD CONSTRAINT fk_order_shipping_method
  FOREIGN KEY (shipping_method_id) REFERENCES shipping_methods(id);
```

---

### 9. **Thiếu Bảng Payments**

**Vấn đề:**
- `orders.payment_status` có nhưng không có bảng lưu thông tin thanh toán
- Không track được payment transactions, refunds

**Đề xuất:**

```sql
CREATE TABLE payments (
  id BIGINT UNSIGNED PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  payment_method ENUM('cash', 'bank_transfer', 'credit_card', 'e_wallet') NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  transaction_id VARCHAR(255) NULL,
  payment_gateway VARCHAR(100) NULL,
  paid_at TIMESTAMP NULL,
  refunded_at TIMESTAMP NULL,
  notes TEXT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

---

### 10. **Thiếu Index cho JSON Columns**

**Vấn đề:**
- `products.gallery` (JSON)
- `carts.product_attributes` (JSON)
- `order_items.product_attributes` (JSON)
- `orders.shipping_address`, `orders.billing_address` (JSON)

**Đề xuất:**
- MySQL 5.7+ hỗ trợ JSON indexes
- Hoặc extract các trường thường query ra cột riêng

```sql
-- Ví dụ: Extract từ shipping_address
ALTER TABLE orders
  ADD COLUMN shipping_province VARCHAR(100) NULL,
  ADD COLUMN shipping_district VARCHAR(100) NULL,
  ADD INDEX idx_shipping_province (shipping_province);
```

---

### 11. **Thiếu Bảng Product Reviews/Ratings**

**Vấn đề:**
- Hệ thống e-commerce thường cần reviews
- Không có trong schema

**Đề xuất (nếu cần):**

```sql
CREATE TABLE product_reviews (
  id BIGINT UNSIGNED PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  order_item_id BIGINT UNSIGNED NULL,  -- Đảm bảo chỉ review sau khi mua
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  images JSON NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (order_item_id) REFERENCES order_items(id),
  UNIQUE KEY uk_review_order_item (user_id, order_item_id)  -- 1 review/order item
);
```

---

### 12. **Thiếu Bảng Inventory History**

**Vấn đề:**
- Không track được lịch sử thay đổi stock
- Khó audit và debug

**Đề xuất:**

```sql
CREATE TABLE inventory_history (
  id BIGINT UNSIGNED PRIMARY KEY,
  product_variant_id BIGINT UNSIGNED NOT NULL,
  type ENUM('sale', 'purchase', 'adjustment', 'return', 'cancellation') NOT NULL,
  quantity_change INTEGER NOT NULL,  -- Có thể âm
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  reference_type ENUM('order', 'purchase_order', 'adjustment') NULL,
  reference_id BIGINT UNSIGNED NULL,
  notes TEXT NULL,
  created_user_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP,
  FOREIGN KEY (product_variant_id) REFERENCES product_variants(id),
  INDEX idx_variant_created (product_variant_id, created_at)
);
```

---

## 📋 TÓM TẮT ĐỀ XUẤT

### Ưu tiên cao:
1. ✅ Sửa `cart_headers.id` thành `BIGINT UNSIGNED` (hoặc giải thích rõ lý do dùng VARCHAR)
2. ✅ Thêm Foreign Key constraints với ON DELETE/UPDATE rules
3. ✅ Thêm CHECK constraints cho business rules
4. ✅ Thêm indexes cho timestamps và audit fields
5. ✅ Thêm constraint cho `cart_headers` (user_id XOR session_id)

### Ưu tiên trung bình:
6. ✅ Thêm bảng `coupons` nếu cần quản lý mã giảm giá
7. ✅ Thêm bảng `shipping_methods` nếu cần quản lý vận chuyển
8. ✅ Thêm bảng `payments` nếu cần track thanh toán chi tiết

### Ưu tiên thấp (tùy chọn):
9. ✅ Thêm bảng `product_reviews` nếu cần đánh giá sản phẩm
10. ✅ Thêm bảng `inventory_history` nếu cần audit stock

---

## ✅ KẾT LUẬN

**Schema tổng thể rất tốt**, có kiến trúc rõ ràng và logic hợp lý. Chỉ cần bổ sung:
- Constraints và validation
- Indexes đầy đủ
- Một số bảng bổ trợ (tùy nhu cầu)

**Điểm mạnh nhất:** Thiết kế Product-Variant-Attributes rất linh hoạt và có thể scale tốt.

