## Tài liệu tích hợp FE – Admin Product Variant API

Tài liệu này mô tả chi tiết cách **FE tích hợp API quản lý biến thể sản phẩm (Product Variant)** trong trang quản trị, bao gồm:

- **Các endpoint chính FE cần dùng**
- **Cấu trúc request/response**
- **Field nào bắt buộc / optional / backend tự sinh**
- **Field nào lấy từ API khác**
- **Gợi ý mapping vào giao diện tạo/cập nhật biến thể**

---

## 1. Thông tin chung

- **Base URL**: `http://localhost:8000/api`
- **Auth**: JWT Bearer Token (bắt buộc)
- **Content-Type**: `application/json`
- **Module**: `Admin / Product Variant`

---

## 2. Danh sách endpoint FE sử dụng

- **Lấy danh sách biến thể**: `GET /api/admin/product-variants`
- **Lấy chi tiết biến thể**: `GET /api/admin/product-variants/:id`
- **Lấy biến thể theo sản phẩm**: `GET /api/admin/product-variants/product/:productId`
- **Tạo biến thể mới**: `POST /api/admin/product-variants`
- **Cập nhật biến thể**: `PUT /api/admin/product-variants/:id`
- **Cập nhật tồn kho**: `PUT /api/admin/product-variants/:id/stock`

Các endpoint GET đã được mô tả chi tiết trong `docs/api/ecommerce/admin/product-variant.md`. Tài liệu này tập trung vào **tạo/cập nhật** để FE build form đúng.

---

## 3. API tạo biến thể – `POST /api/admin/product-variants`

### 3.1. Body request chuẩn

```json
{
  "product_id": 1,
  "sku": "IP15PRO-512GB-WHITE",
  "name": "iPhone 15 Pro - 512GB - Trắng",
  "price": 39990000,
  "sale_price": 37990000,
  "cost_price": 35000000,
  "stock_quantity": 20,
  "weight": 0.2,
  "image": "https://example.com/iphone15pro-white.jpg",
  "status": "active",
  "attributes": [
    {
      "attribute_id": 1,
      "attribute_value_id": 2
    },
    {
      "attribute_id": 2,
      "attribute_value_id": 4
    }
  ]
}
```

> **Lưu ý**: Tài liệu này chỉ liệt kê các field **thực sự tồn tại trong database và DTO**. Các field trong bảng bên dưới là chính xác theo code hiện tại.

### 3.2. Bảng field – tạo biến thể

#### 3.2.1. Trường dữ liệu chính

| Field              | Kiểu       | Bắt buộc | Mô tả                                                                 | Nguồn / Gợi ý UI                                    |
|--------------------|-----------|----------|-----------------------------------------------------------------------|-----------------------------------------------------|
| `product_id`       | number    | **Có**   | ID sản phẩm cha                                                      | Dropdown chọn từ **Admin Product API**              |
| `sku`              | string    | **Có**   | Mã SKU duy nhất cho biến thể                                        | Input text, validate trùng (409 Conflict nếu trùng) |
| `name`             | string    | **Có**   | Tên biến thể hiển thị                                                | Input text; gợi ý auto = tên sản phẩm + thuộc tính  |
| `price`            | number    | **Có**   | Giá bán chính                                                        | Input number                                        |
| `sale_price`       | number    | Không    | Giá khuyến mãi, nếu có                                               | Input number; rule: `sale_price <= price`           |
| `cost_price`       | number    | Không    | Giá vốn (chỉ nội bộ)                                                 | Input number (tab nâng cao)                         |
| `stock_quantity`   | number    | **Có**   | Số lượng tồn kho hiện tại (>= 0)                                    | Input number                                        |
| `weight`           | number    | Không    | Cân nặng (kg) cho vận chuyển                                        | Input number                                        |
| `image`            | string    | Không    | Ảnh đại diện chính của biến thể (URL)                               | Input URL hoặc chọn từ media                        |
| `status`           | string    | **Có**   | Trạng thái: `active`, `inactive`                                    | Select box                                          |

#### 3.2.2. Trường thuộc tính biến thể (`attributes`)

| Field                     | Kiểu     | Bắt buộc | Mô tả                                               | Nguồn / Gợi ý UI                                                                 |
|---------------------------|----------|----------|-----------------------------------------------------|----------------------------------------------------------------------------------|
| `attributes`              | array    | **Có**   | Danh sách các thuộc tính cấu thành biến thể        | Bắt buộc có ít nhất 1 phần tử                                                   |
| `attributes[].attribute_id`       | number   | **Có**   | ID của thuộc tính (vd: Màu sắc, Dung lượng)        | Dropdown từ **Product Attribute API**                                           |
| `attributes[].attribute_value_id` | number   | **Có**   | ID giá trị thuộc tính (vd: Đen, 128GB)             | Dropdown từ **Product Attribute Value API**, filter theo `attribute_id` đã chọn |

**Nguồn dữ liệu cho attributes:**

- **Admin Product Attribute API** – để lấy danh sách thuộc tính (`attribute_id`):
  - Ví dụ: `GET /api/admin/product-attributes`
- **Admin Product Attribute Value API** – để lấy danh sách giá trị của từng thuộc tính (`attribute_value_id`):
  - Ví dụ: `GET /api/admin/product-attribute-values?attribute_id=1`

FE cần đảm bảo **combo (attribute_id, attribute_value_id)** là hợp lệ theo dữ liệu từ backend.

### 3.3. Trường backend tự sinh (FE không gửi)

Các field dưới đây **không cần (và không nên) xuất hiện trong form tạo/cập nhật**, backend tự quản lý:

| Field             | Kiểu    | Mô tả                                                       |
|-------------------|---------|-------------------------------------------------------------|
| `id`              | number  | Khóa chính, auto-increment khi tạo mới                     |
| `created_at`      | date    | Thời gian tạo, backend tự set                              |
| `updated_at`      | date    | Thời gian cập nhật, backend tự set                         |
| `deleted_at`      | date    | Thời gian xóa mềm (nếu có), backend tự set                 |
| `created_user_id` | number  | ID user tạo, lấy từ token đăng nhập                        |
| `updated_user_id` | number  | ID user cập nhật, lấy từ token đăng nhập                   |

FE chỉ cần đọc các field này ở response để hiển thị (nếu cần), **không cần gửi vào request**.

### 3.4. Response mẫu khi tạo thành công

```json
{
  "success": true,
  "message": "Tạo biến thể sản phẩm thành công",
  "data": {
    "id": 15,
    "product_id": 1,
    "sku": "IP15PRO-512GB-WHITE",
    "name": "iPhone 15 Pro - 512GB - Trắng",
    "price": 39990000,
    "sale_price": 37990000,
    "stock_quantity": 20,
    "status": "active",
    "created_at": "2025-01-20T08:30:00.000Z",
    "updated_at": "2025-01-20T08:30:00.000Z"
  }
}
```

---

## 4. API cập nhật biến thể – `PUT /api/admin/product-variants/:id`

### 4.1. Path parameters

- **`id`** (number) – ID biến thể cần cập nhật.  
  - FE lấy từ:
    - Danh sách biến thể: `GET /api/admin/product-variants`
    - Hoặc theo sản phẩm: `GET /api/admin/product-variants/product/:productId`

### 4.2. Body request

Body là **các field muốn cập nhật**, cùng cấu trúc với API tạo. Ví dụ đơn giản:

```json
{
  "name": "iPhone 15 Pro - 512GB - Trắng (Cập nhật)",
  "price": 40990000,
  "sale_price": 38990000,
  "stock_quantity": 25,
  "status": "active"
}
```

**Lưu ý:**  
- Không cập nhật các field hệ thống: `id`, `product_id`, `created_at`, `created_user_id`, …  
- FE có thể gửi 1 phần field (partial update), backend sẽ merge và lưu.

### 4.3. Một số field thường được cập nhật

- `name`
- `price`, `sale_price`, `cost_price`
- `stock_quantity`
- `weight`
- `image`
- `status`
- `attributes` (thay đổi tổ hợp thuộc tính nếu cần)

---

## 5. API cập nhật tồn kho – `PUT /api/admin/product-variants/:id/stock`

Endpoint chuyên dụng cho case cập nhật tồn kho, FE dùng ở màn hình **quản lý kho**.

### 5.1. Body request

```json
{
  "stock_quantity": 100,
  "min_stock_level": 10,
  "max_stock_level": 200,
  "reason": "Nhập hàng mới từ nhà cung cấp"
}
```

| Field             | Kiểu    | Bắt buộc | Mô tả                                      |
|-------------------|---------|----------|--------------------------------------------|
| `stock_quantity`  | number  | **Có**   | Số lượng tồn kho mới                      |

> **Lưu ý**: Endpoint này chỉ cập nhật `stock_quantity`. Các field khác như `min_stock_level`, `max_stock_level`, `reason` không có trong database hiện tại.

---

## 6. Nguồn dữ liệu từ API khác (để FE mapping)

### 6.1. Lấy danh sách sản phẩm cho `product_id`

- **API gợi ý**: Admin Product API
  - Ví dụ: `GET /api/admin/products`
  - FE hiển thị danh sách sản phẩm (tên sản phẩm), khi chọn sẽ lưu **`product_id`**.

### 6.2. Lấy danh sách thuộc tính & giá trị cho `attributes`

- **Lấy thuộc tính sản phẩm (attribute)**:
  - Ví dụ: `GET /api/admin/product-attributes`
  - Dùng cho dropdown chọn **loại thuộc tính** (Màu sắc, Dung lượng, Size, …).
- **Lấy giá trị thuộc tính (attribute values)**:
  - Ví dụ: `GET /api/admin/product-attribute-values?attribute_id={id}`
  - Dùng cho dropdown chọn **giá trị** (Đen, Trắng, 128GB, 256GB, …) sau khi đã chọn `attribute_id`.

FE cần:

- Khi user chọn **thuộc tính** → load danh sách **giá trị** tương ứng.
- Khi submit, gửi mảng `attributes` với `attribute_id` và `attribute_value_id` tương ứng.

---

## 7. Gợi ý thiết kế form FE

### 7.1. Tab/thông tin cơ bản

- **Trường nên hiển thị bắt buộc**:
  - Chọn **Sản phẩm cha** → `product_id`
  - `sku`
  - `name`
  - `price`
  - `stock_quantity`
  - `status`
  - Nhóm chọn **Thuộc tính** + **Giá trị** (`attributes`)

### 7.2. Tab/thông tin nâng cao

- `sale_price`
- `cost_price`
- `weight`
- `image`

### 7.3. Thông tin chỉ hiển thị (read-only) / ẩn

- **Read-only (nếu cần)**:
  - `id`
  - `created_at`, `updated_at`
  - `created_user_id`, `updated_user_id` (thường chỉ dùng cho audit nội bộ)
- **Ẩn với user** (FE không cần mapping):
  - `deleted_at`

---

## 8. Lỗi thường gặp & xử lý ở FE

| Status Code | Ý nghĩa                                  | Tình huống thường gặp                                      |
|------------|-------------------------------------------|------------------------------------------------------------|
| `400`      | Bad Request – dữ liệu không hợp lệ       | Sai kiểu dữ liệu, thiếu field bắt buộc                    |
| `401`      | Unauthorized – chưa đăng nhập / token lỗi| Thiếu / sai JWT                                            |
| `403`      | Forbidden – thiếu quyền                  | User không có permission `product-variant:*`               |
| `404`      | Not Found – không tìm thấy biến thể      | ID không tồn tại hoặc đã bị xóa                            |
| `409`      | Conflict – trùng SKU                     | Gửi `sku` đã tồn tại trong hệ thống                        |
| `422`      | Validation failed                        | Vi phạm rule validation (vd: `stock_quantity < 0`, ...)    |

FE nên:

- Validate cơ bản trước khi gọi API (required fields, kiểu dữ liệu, `sale_price <= price`, `stock_quantity >= 0`, …).
- Hiển thị thông báo rõ ràng khi nhận lỗi `409` (SKU đã tồn tại).

---

## 9. Tóm tắt nhanh cho FE

- **Tạo/Cập nhật** biến thể sử dụng các field đã liệt kê ở mục 3 (table field).  
- **Không gửi** các field hệ thống (`id`, `created_at`, `created_user_id`, …).  
- `product_id` và các cặp `attribute_id`/`attribute_value_id` phải **lấy từ các API khác** (Product, Product Attribute, Product Attribute Value) để đảm bảo đúng ID.  
- Đảm bảo mapping form đúng kiểu dữ liệu và rule validation để tránh lỗi HTTP 4xx khi tích hợp.


