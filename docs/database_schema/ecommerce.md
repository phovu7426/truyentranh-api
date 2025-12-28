# Database Schema - Hệ Thống Đặt Hàng (Product & Order)

Tài liệu mô tả các bảng chính của mô-đun thương mại điện tử. Mỗi bảng liệt kê mục đích, các cột, kiểu dữ liệu và ghi chú quan trọng.

## 1. `product_categories`
- **Mục đích**: Danh mục sản phẩm dạng cây (parent-child).
- **Cột chính**:
  - `id` `BIGINT UNSIGNED` – Khóa chính tự tăng.
  - `name` `VARCHAR(255)` – Tên danh mục.
  - `slug` `VARCHAR(255)` – URL slug, **unique**.
  - `description` `TEXT` – Mô tả (nullable).
  - `parent_id` `BIGINT UNSIGNED` – FK tự tham chiếu, `ON DELETE SET NULL`.
  - `status` `ENUM('active','inactive')` – Trạng thái.
  - `sort_order` `INT` – Thứ tự hiển thị.
  - `meta_title`, `meta_description`, `canonical_url`, `og_image` – Trường SEO.
  - `created_user_id`, `updated_user_id` – Audit (nullable).
  - `created_at`, `updated_at`, `deleted_at` – Timestamp & soft delete.
- **Indexes**: name, slug, parent_id, status, sort_order, combos `status_sort`, `parent_status`, `deleted_at`.

## 2. `product_attributes`
- **Mục đích**: Định nghĩa thuộc tính tùy chỉnh (color, size…).
- **Cột**:
  - `id`, `name`, `slug` (unique).
  - `type` `ENUM('text','select','multiselect','color','image')`.
  - `is_required`, `is_variation`, `is_filterable` `BOOLEAN`.
  - `sort_order`, `status`.
  - Audit fields, timestamps, `deleted_at`.
- **Indexes**: name, slug, type, required, variation, filterable, status, sort_order, combos.

## 3. `product_attribute_values`
- **Mục đích**: Giá trị cho thuộc tính (Ví dụ: Đỏ, 128GB).
- **Cột**:
  - `id`.
  - `product_attribute_id` → FK `product_attributes(id)` `ON DELETE CASCADE`.
  - `value` `VARCHAR(255)`.
  - `color_code` `VARCHAR(7)` (nullable).
  - `image` `VARCHAR(500)` (nullable).
  - `sort_order`, `status`.
  - Audit, timestamps, `deleted_at`.
- **Indexes**: theo attribute, value, color_code, status, sort_order, combos.

## 4. `products`
- **Mục đích**: Thông tin chung của sản phẩm (không chứa giá/stock).
- **Cột**:
  - `id`, `name`, `slug` (unique), `sku` (unique).
  - `description` (longtext), `short_description`.
  - `min_stock_level`.
  - `image`, `gallery` (JSON).
  - `status` `ENUM('active','inactive','draft')`.
  - `is_featured`, `is_variable`, `is_digital` (boolean).
  - `download_limit` (nullable).
  - Trường SEO (`meta_title`, `meta_description`, `canonical_url`, `og_*`).
  - Audit, timestamps, `deleted_at`.
- **Indexes**: name, slug, sku, status, is_featured, is_variable, is_digital, combos `status_featured`, `status_created`, `deleted_at`.

## 5. `product_variants`
- **Mục đích**: Biến thể cụ thể (SKU con, giá, tồn kho).
- **Cột**:
  - `id`, `product_id` → FK `products(id)` `ON DELETE CASCADE`.
  - `sku` (unique), `name`.
  - `price`, `sale_price`, `cost_price` (`DECIMAL(15,2)`).
  - `stock_quantity` `INT`.
  - `weight` `DECIMAL(8,2)` (nullable).
  - `image` `VARCHAR(500)` (nullable).
  - `status` `ENUM('active','inactive')`.
  - Audit, timestamps, `deleted_at`.
- **Constraints**: `CHECK (sale_price <= price OR sale_price IS NULL)`, `CHECK (stock_quantity >= 0)`.
- **Indexes**: product_id, sku, name, price, sale_price, stock_quantity, status, combos `product_status`, `status_stock`, `deleted_at`.

## 6. `product_variant_attributes`
- **Mục đích**: Bảng nối variant ↔ thuộc tính ↔ giá trị.
- **Cột**:
  - `id`.
  - `product_variant_id` → FK `product_variants(id)` `ON DELETE CASCADE`.
  - `product_attribute_id` → FK `product_attributes(id)` `ON DELETE CASCADE`.
  - `product_attribute_value_id` → FK `product_attribute_values(id)` `ON DELETE CASCADE`.
  - `created_at`, `updated_at`.
- **Constraint**: `UNIQUE (product_variant_id, product_attribute_id)`.
- **Indexes**: variant, attribute, value.

## 7. `product_category`
- **Mục đích**: Pivot many-to-many giữa products và product_categories.
- **Cột**:
  - `id`.
  - `product_id` → FK `products(id)` `ON DELETE CASCADE`.
  - `product_category_id` → FK `product_categories(id)` `ON DELETE CASCADE`.
  - `created_at`, `updated_at`.
- **Constraint**: `UNIQUE (product_id, product_category_id)`.
- **Indexes**: product_id, product_category_id.

## 8. `cart_headers`
- **Mục đích**: Thông tin tổng quan giỏ hàng.
- **Cột**:
  - `id` `BIGINT` PK auto increment.
  - `uuid` `VARCHAR(36)` – mã public (unique, nullable).
  - `owner_key` `VARCHAR(120)` – khóa định danh giỏ (ví dụ `user:123`, `guest:xyz`).
  - `user_id` `BIGINT` (nullable) – set khi user đăng nhập.
  - `currency` `VARCHAR(10)` – mặc định `VND`.
  - `subtotal`, `tax_amount`, `shipping_amount`, `discount_amount`, `total_amount` `DECIMAL(15,2)`.
  - Audit fields, `created_at`, `updated_at`.
- **Constraints**:
  - `CHECK (total_amount >= 0)`.
  - `CHECK (owner_key <> '')`.
- **Indexes**: owner_key, user_id.

## 9. `carts`
- **Mục đích**: Dòng sản phẩm trong giỏ hàng.
- **Cột**:
  - `id`.
  - `cart_header_id` → FK `cart_headers(id)` `ON DELETE CASCADE`.
  - `product_id` → FK `products(id)`.
  - `product_variant_id` → FK `product_variants(id)` (nullable nhưng logic yêu cầu).
  - `product_name`, `product_sku`, `variant_name`.
  - `quantity` `INT`, `unit_price` `DECIMAL(15,2)`, `total_price` `DECIMAL(15,2)`.
  - `product_attributes` `JSON` (snapshot).
  - Audit, timestamps.
- **Constraints**:
  - `UNIQUE (cart_header_id, product_id, product_variant_id)`.
  - `CHECK (quantity > 0)`.
- **Indexes**: header, product, variant, quantity.

## 10. `orders`
- **Mục đích**: Đơn hàng.
- **Cột**:
  - `id`.
  - `order_number` `VARCHAR(50)` **unique**.
  - `user_id` (nullable).
  - `customer_name`, `customer_email`, `customer_phone`.
  - `shipping_address`, `billing_address` (JSON).
  - `shipping_method_id` `BIGINT` (nullable) → FK `shipping_methods(id)`.
  - `status` `ENUM('pending','confirmed','processing','shipped','delivered','cancelled')`.
  - `payment_status` `ENUM('pending','paid','failed','refunded','partially_refunded')`.
  - `shipping_status` `ENUM('pending','preparing','shipped','delivered','returned')`.
  - `subtotal`, `tax_amount`, `shipping_amount`, `discount_amount`, `total_amount` `DECIMAL(15,2)`.
  - `currency` `VARCHAR(3)`.
  - `notes`, `tracking_number` (nullable).
  - `shipped_at`, `delivered_at` (nullable).
  - Audit, timestamps, `deleted_at`.
- **Constraints**: `CHECK (total_amount >= 0)`.
- **Indexes**: người dùng, email, phone, status, payment_status, shipping_status, total_amount, tracking_number, combos `status_created`, `payment_created`, `user_status`, `deleted_at`, `shipping_method_id`.

## 11. `order_items`
- **Mục đích**: Dòng sản phẩm trong đơn hàng (snapshot).
- **Cột**:
  - `id`.
  - `order_id` → FK `orders(id)` `ON DELETE RESTRICT`.
  - `product_id` → FK `products(id)`.
  - `product_variant_id` → FK `product_variants(id)` (nullable).
  - `product_name`, `product_sku`, `variant_name`.
  - `quantity`, `unit_price`, `total_price`.
  - `product_attributes` `JSON`.
  - Audit, timestamps.
- **Constraints**: `CHECK (quantity > 0)`.
- **Indexes**: order_id, product_id, product_variant_id, product_sku, quantity, (unit_price, total_price).

## 12. `shipping_methods`
- **Mục đích**: Danh sách phương thức vận chuyển.
- **Cột**:
  - `id`.
  - `name`, `code` (unique).
  - `description` (nullable).
  - `base_cost` `DECIMAL(10,2)` – hiện tại mặc định 0 (chưa tính phí).
  - `estimated_days` `INT` (nullable).
  - `status` `ENUM('active','inactive')`.
  - Audit, timestamps, `deleted_at`.
- **Indexes**: code (unique), status.

## 13. `payment_methods`
- **Mục đích**: Phương thức thanh toán khả dụng.
- **Cột**:
  - `id`.
  - `name`, `code` (unique).
  - `description` `TEXT` (nullable).
  - `provider` `VARCHAR(100)` (nullable).
  - `config` `JSON` – lưu thông tin cấu hình gateway.
  - `status` `ENUM('active','inactive')`.
  - Audit, timestamps, `deleted_at`.
- **Indexes**: code (unique), status.

## 14. `payments`
- **Mục đích**: Lịch sử thanh toán của đơn hàng.
- **Cột**:
  - `id`.
  - `order_id` → FK `orders(id)` `ON DELETE CASCADE`.
  - `payment_method_id` → FK `payment_methods(id)` `ON DELETE RESTRICT`.
  - `status` `ENUM('pending','processing','completed','failed','refunded')`.
  - `amount` `DECIMAL(15,2)`.
  - `transaction_id`, `payment_gateway` (nullable).
  - `paid_at`, `refunded_at` (nullable).
  - `notes` `TEXT` (nullable).
  - `created_at`, `updated_at`.
- **Indexes**: order_id, payment_method_id, status.

---

### Ghi chú chung
- **Audit fields**: hầu hết bảng chính có `created_user_id`, `updated_user_id`, `created_at`, `updated_at`, `deleted_at`.
- **Soft delete**: áp dụng cho bảng nội dung (sản phẩm, danh mục, phương thức shipping/payment).
- **Snapshots**: `carts` và `order_items` lưu tên SKU, giá, thuộc tính để đảm bảo dữ liệu không đổi khi sản phẩm cập nhật.
- **Foreign keys**: sử dụng `ON DELETE CASCADE/SET NULL/RESTRICT` phù hợp với ngữ cảnh để đảm bảo toàn vẹn dữ liệu.

