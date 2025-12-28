# Hướng Dẫn Tích Hợp API Khuyến Mãi và Kho Hàng Admin

Tài liệu này cung cấp hướng dẫn chi tiết để tích hợp các API quản lý khuyến mãi (coupons) và kho hàng (warehouse/inventory) dành cho Frontend Admin.

---

## 📋 Mục Lục

1. [Thông Tin Chung](#thông-tin-chung)
2. [API Khuyến Mãi (Coupons)](#api-khuyến-mãi-coupons)
3. [API Kho Hàng (Warehouse)](#api-kho-hàng-warehouse)
4. [API Tồn Kho (Inventory)](#api-tồn-kho-inventory)
5. [API Chuyển Kho (Stock Transfer)](#api-chuyển-kho-stock-transfer)
6. [Các API Liên Quan](#các-api-liên-quan)

---

## 🔧 Thông Tin Chung

### Base URL
```
http://localhost:8000/api
```

### Authentication
- **Bắt buộc**: JWT Bearer Token
- **Header**: `Authorization: Bearer YOUR_JWT_TOKEN`
- **Content-Type**: `application/json`

### Response Format
Tất cả API đều trả về format chuẩn:
```json
{
  "success": true,
  "message": "Thông báo",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": {},
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "timestamp": "2025-12-05T10:00:00+07:00"
}
```

### Quyền Truy Cập
- **Coupon APIs**: Cần permission `coupon:read`, `coupon:create`, `coupon:update`, `coupon:delete`
- **Warehouse APIs**: Cần permission `warehouse:read`, `warehouse:create`, `warehouse:update`, `warehouse:delete`, `warehouse:transfer`

---

## 🎟️ API Khuyến Mãi (Coupons)

### 1. Lấy Danh Sách Mã Giảm Giá

**Endpoint:** `GET /api/admin/coupons`

**Permission:** `coupon:read`

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả | Ví dụ |
|---------|------|----------|-------|-------|
| `page` | number | ❌ | Số trang (mặc định: 1) | `1` |
| `limit` | number | ❌ | Số lượng mỗi trang (mặc định: 10) | `20` |
| `search` | string | ❌ | Tìm kiếm theo tên hoặc mã | `"WELCOME"` |
| `status` | string | ❌ | Lọc theo trạng thái: `active`, `inactive`, `expired` | `"active"` |
| `type` | string | ❌ | Lọc theo loại: `percentage`, `fixed_amount`, `free_shipping` | `"percentage"` |
| `sortBy` | string | ❌ | Sắp xếp theo trường | `"created_at"` |
| `sortOrder` | string | ❌ | Thứ tự: `ASC` hoặc `DESC` | `"DESC"` |

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách mã giảm giá thành công",
  "data": [
    {
      "id": 1,
      "code": "WELCOME10",
      "name": "Giảm giá chào mừng",
      "description": "Giảm 10% cho đơn hàng đầu tiên",
      "type": "percentage",
      "value": "10.00",
      "min_order_value": "100000.00",
      "max_discount_amount": "50000.00",
      "usage_limit": 100,
      "usage_per_customer": 1,
      "used_count": 25,
      "start_date": "2025-01-01T00:00:00.000Z",
      "end_date": "2025-12-31T23:59:59.999Z",
      "status": "active",
      "applicable_products": [1, 2, 3],
      "applicable_categories": [5, 6],
      "excluded_products": [],
      "first_order_only": false,
      "created_user_id": 1,
      "updated_user_id": 1,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-15T10:30:00.000Z",
      "deleted_at": null
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 50,
    "totalPages": 5
  }
}
```

**Giải thích các trường:**

| Trường | Kiểu | Bắt buộc | Tự động sinh | Mô tả | Ghi chú |
|--------|------|----------|--------------|-------|---------|
| `id` | number | ✅ | ✅ | ID mã giảm giá | **Không cần hiển thị ở form tạo mới** |
| `code` | string | ✅ | ❌ | Mã giảm giá (duy nhất) | **Bắt buộc nhập**, tối đa 50 ký tự |
| `name` | string | ✅ | ❌ | Tên mã giảm giá | **Bắt buộc nhập**, tối đa 255 ký tự |
| `description` | string | ❌ | ❌ | Mô tả chi tiết | Tùy chọn |
| `type` | enum | ✅ | ❌ | Loại giảm giá | **Bắt buộc chọn**: `percentage`, `fixed_amount`, `free_shipping` |
| `value` | string (decimal) | ✅ | ❌ | Giá trị giảm giá | **Bắt buộc nhập**. Nếu `type=percentage` thì là phần trăm (ví dụ: 10 = 10%), nếu `type=fixed_amount` thì là số tiền |
| `min_order_value` | string (decimal) | ✅ | ❌ | Giá trị đơn hàng tối thiểu | **Bắt buộc nhập**, mặc định 0 |
| `max_discount_amount` | string (decimal) | ❌ | ❌ | Giá trị giảm tối đa | Chỉ áp dụng khi `type=percentage` |
| `usage_limit` | number | ❌ | ❌ | Số lần sử dụng tối đa | Nếu null = không giới hạn |
| `usage_per_customer` | number | ✅ | ❌ | Số lần sử dụng tối đa mỗi khách hàng | **Bắt buộc nhập**, mặc định 1, tối đa 100 |
| `used_count` | number | ✅ | ✅ | Số lần đã sử dụng | **Tự động cập nhật**, chỉ hiển thị (read-only) |
| `start_date` | datetime | ✅ | ❌ | Ngày bắt đầu hiệu lực | **Bắt buộc nhập** |
| `end_date` | datetime | ✅ | ❌ | Ngày kết thúc hiệu lực | **Bắt buộc nhập**, phải sau `start_date` |
| `status` | enum | ✅ | ✅ | Trạng thái | **Tự động sinh** mặc định `active`. Có thể cập nhật: `active`, `inactive`, `expired` |
| `applicable_products` | number[] | ❌ | ❌ | Danh sách ID sản phẩm áp dụng | Lấy từ API `/api/admin/products` |
| `applicable_categories` | number[] | ❌ | ❌ | Danh sách ID danh mục áp dụng | Lấy từ API `/api/admin/product-categories` |
| `excluded_products` | number[] | ❌ | ❌ | Danh sách ID sản phẩm loại trừ | Lấy từ API `/api/admin/products` |
| `first_order_only` | boolean | ❌ | ❌ | Chỉ áp dụng cho đơn hàng đầu tiên | Mặc định `false` |
| `created_user_id` | number | ✅ | ✅ | ID người tạo | **Tự động lấy từ token**, không cần gửi |
| `updated_user_id` | number | ✅ | ✅ | ID người cập nhật | **Tự động lấy từ token**, không cần gửi |
| `created_at` | datetime | ✅ | ✅ | Ngày tạo | **Tự động sinh**, chỉ hiển thị |
| `updated_at` | datetime | ✅ | ✅ | Ngày cập nhật | **Tự động sinh**, chỉ hiển thị |
| `deleted_at` | datetime | ✅ | ✅ | Ngày xóa (soft delete) | **Tự động sinh**, chỉ hiển thị |

---

### 2. Lấy Chi Tiết Mã Giảm Giá

**Endpoint:** `GET /api/admin/coupons/:id`

**Permission:** `coupon:read`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `id` | number | ✅ | ID của mã giảm giá |

**Response:** Tương tự như item trong danh sách, nhưng chỉ trả về 1 object trong `data`.

---

### 3. Lấy Thống Kê Mã Giảm Giá

**Endpoint:** `GET /api/admin/coupons/:id/stats`

**Permission:** `coupon:read`

**Response:**
```json
{
  "success": true,
  "message": "Lấy thống kê mã giảm giá thành công",
  "data": {
    "total_usage": 25,
    "remaining": 75,
    "usage_rate": 25.0
  }
}
```

**Giải thích các trường:**

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `total_usage` | number | Tổng số lần đã sử dụng (từ `used_count`) |
| `remaining` | number \| null | Số lần còn lại (chỉ có nếu `usage_limit` không null) |
| `usage_rate` | number \| null | Tỷ lệ sử dụng % (chỉ có nếu `usage_limit` không null) |

---

### 4. Tạo Mã Giảm Giá Mới

**Endpoint:** `POST /api/admin/coupons`

**Permission:** `coupon:create`

**Request Body:**

```json
{
  "code": "SUMMER2025",
  "name": "Giảm giá hè 2025",
  "description": "Giảm 15% cho tất cả sản phẩm mùa hè",
  "type": "percentage",
  "value": 15,
  "min_order_value": 200000,
  "max_discount_amount": 100000,
  "usage_limit": 500,
  "usage_per_customer": 3,
  "start_date": "2025-06-01T00:00:00.000Z",
  "end_date": "2025-08-31T23:59:59.999Z",
  "applicable_products": [1, 2, 3],
  "applicable_categories": [5, 6],
  "excluded_products": [],
  "first_order_only": false
}
```

**Các trường bắt buộc:**
- ✅ `code` - Mã giảm giá (duy nhất, tối đa 50 ký tự)
- ✅ `name` - Tên mã giảm giá (tối đa 255 ký tự)
- ✅ `type` - Loại giảm giá (`percentage`, `fixed_amount`, `free_shipping`)
- ✅ `value` - Giá trị giảm giá (số >= 0)
- ✅ `min_order_value` - Giá trị đơn hàng tối thiểu (số >= 0)
- ✅ `usage_per_customer` - Số lần sử dụng mỗi khách hàng (1-100)
- ✅ `start_date` - Ngày bắt đầu (ISO datetime)
- ✅ `end_date` - Ngày kết thúc (ISO datetime, phải sau start_date)

**Các trường tùy chọn:**
- ❌ `description` - Mô tả
- ❌ `max_discount_amount` - Giá trị giảm tối đa (chỉ khi type=percentage)
- ❌ `usage_limit` - Số lần sử dụng tối đa (null = không giới hạn)
- ❌ `applicable_products` - Danh sách ID sản phẩm
- ❌ `applicable_categories` - Danh sách ID danh mục
- ❌ `excluded_products` - Danh sách ID sản phẩm loại trừ
- ❌ `first_order_only` - Chỉ cho đơn hàng đầu tiên (mặc định: false)

**Các trường KHÔNG cần gửi (tự động sinh):**
- ❌ `id` - Tự động sinh
- ❌ `used_count` - Mặc định 0
- ❌ `status` - Mặc định `active`
- ❌ `created_user_id` - Tự động lấy từ token
- ❌ `updated_user_id` - Tự động lấy từ token
- ❌ `created_at` - Tự động sinh
- ❌ `updated_at` - Tự động sinh
- ❌ `deleted_at` - null

**Response:** Trả về object mã giảm giá đã tạo (tương tự GET /:id)

---

### 5. Cập Nhật Mã Giảm Giá

**Endpoint:** `PUT /api/admin/coupons/:id`

**Permission:** `coupon:update`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `id` | number | ✅ | ID của mã giảm giá |

**Request Body:** Tất cả các trường đều tùy chọn (Partial Update). Có thể gửi bất kỳ trường nào cần cập nhật.

```json
{
  "name": "Giảm giá hè 2025 (Cập nhật)",
  "description": "Giảm 20% cho tất cả sản phẩm mùa hè",
  "value": 20,
  "max_discount_amount": 150000,
  "usage_limit": 1000,
  "end_date": "2025-09-30T23:59:59.999Z",
  "status": "active"
}
```

**Lưu ý:**
- Có thể cập nhật `status` trực tiếp: `active`, `inactive`, `expired`
- Không thể cập nhật `code` sau khi tạo (để đảm bảo tính nhất quán)
- `used_count` không thể cập nhật thủ công (tự động tăng khi có đơn hàng sử dụng)

**Response:** Trả về object mã giảm giá đã cập nhật

---

### 6. Xóa Mã Giảm Giá

**Endpoint:** `DELETE /api/admin/coupons/:id`

**Permission:** `coupon:delete`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `id` | number | ✅ | ID của mã giảm giá |

**Response:**
```json
{
  "success": true,
  "message": "Xóa mã giảm giá thành công",
  "data": null
}
```

**Lưu ý:** Đây là soft delete, dữ liệu không bị xóa vĩnh viễn. Có thể khôi phục sau.

---

## 📦 API Kho Hàng (Warehouse)

### 1. Lấy Danh Sách Kho

**Endpoint:** `GET /api/admin/warehouses`

**Permission:** `warehouse:read`

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả | Ví dụ |
|---------|------|----------|-------|-------|
| `page` | number | ❌ | Số trang (mặc định: 1) | `1` |
| `limit` | number | ❌ | Số lượng mỗi trang (mặc định: 10) | `20` |
| `search` | string | ❌ | Tìm kiếm theo tên hoặc mã | `"HCM"` |
| `sortBy` | string | ❌ | Sắp xếp theo trường | `"name"` |
| `sortOrder` | string | ❌ | Thứ tự: `ASC` hoặc `DESC` | `"ASC"` |

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách kho thành công",
  "data": [
    {
      "id": 1,
      "code": "WH-HCM-01",
      "name": "Kho Chính - TP.HCM",
      "address": "123 Nguyễn Văn Linh, Quận 7",
      "city": "TP. Hồ Chí Minh",
      "district": "Quận 7",
      "latitude": "10.7300000",
      "longitude": "106.7200000",
      "phone": "02812345678",
      "manager_name": "Nguyễn Văn A",
      "priority": 10,
      "is_active": true,
      "created_user_id": 1,
      "updated_user_id": 1,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 5,
    "totalPages": 1
  }
}
```

**Giải thích các trường:**

| Trường | Kiểu | Bắt buộc | Tự động sinh | Mô tả | Ghi chú |
|--------|------|----------|--------------|-------|---------|
| `id` | number | ✅ | ✅ | ID kho | **Không cần hiển thị ở form tạo mới** |
| `code` | string | ✅ | ❌ | Mã kho (duy nhất) | **Bắt buộc nhập**, tối đa 100 ký tự, phải duy nhất |
| `name` | string | ✅ | ❌ | Tên kho | **Bắt buộc nhập**, tối đa 255 ký tự |
| `address` | string | ❌ | ❌ | Địa chỉ | Tùy chọn |
| `city` | string | ❌ | ❌ | Thành phố | Tùy chọn, tối đa 100 ký tự |
| `district` | string | ❌ | ❌ | Quận/Huyện | Tùy chọn, tối đa 100 ký tự |
| `latitude` | string (decimal) | ❌ | ❌ | Vĩ độ | Tùy chọn, format: "10.7300000" |
| `longitude` | string (decimal) | ❌ | ❌ | Kinh độ | Tùy chọn, format: "106.7200000" |
| `phone` | string | ❌ | ❌ | Số điện thoại | Tùy chọn, tối đa 20 ký tự |
| `manager_name` | string | ❌ | ❌ | Tên người quản lý | Tùy chọn, tối đa 255 ký tự |
| `priority` | number | ❌ | ❌ | Độ ưu tiên | Tùy chọn, mặc định 0, số >= 0. Kho có priority cao hơn được ưu tiên |
| `is_active` | boolean | ❌ | ❌ | Trạng thái hoạt động | Tùy chọn, mặc định `true` |
| `created_user_id` | number | ✅ | ✅ | ID người tạo | **Tự động lấy từ token**, không cần gửi |
| `updated_user_id` | number | ✅ | ✅ | ID người cập nhật | **Tự động lấy từ token**, không cần gửi |
| `created_at` | datetime | ✅ | ✅ | Ngày tạo | **Tự động sinh**, chỉ hiển thị |
| `updated_at` | datetime | ✅ | ✅ | Ngày cập nhật | **Tự động sinh**, chỉ hiển thị |

---

### 2. Lấy Chi Tiết Kho

**Endpoint:** `GET /api/admin/warehouses/:id`

**Permission:** `warehouse:read`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `id` | number | ✅ | ID của kho |

**Response:** Tương tự như item trong danh sách, nhưng chỉ trả về 1 object trong `data`.

---

### 3. Tạo Kho Mới

**Endpoint:** `POST /api/admin/warehouses`

**Permission:** `warehouse:create`

**Request Body:**

```json
{
  "code": "WH-HN-01",
  "name": "Kho Chi Nhánh - Hà Nội",
  "address": "456 Lê Duẩn, Quận Hoàn Kiếm",
  "city": "Hà Nội",
  "district": "Quận Hoàn Kiếm",
  "latitude": 21.0285,
  "longitude": 105.8542,
  "phone": "02412345678",
  "manager_name": "Trần Văn B",
  "priority": 5,
  "is_active": true
}
```

**Các trường bắt buộc:**
- ✅ `code` - Mã kho (duy nhất, tối đa 100 ký tự)
- ✅ `name` - Tên kho (tối đa 255 ký tự)

**Các trường tùy chọn:**
- ❌ `address` - Địa chỉ
- ❌ `city` - Thành phố (tối đa 100 ký tự)
- ❌ `district` - Quận/Huyện (tối đa 100 ký tự)
- ❌ `latitude` - Vĩ độ (number)
- ❌ `longitude` - Kinh độ (number)
- ❌ `phone` - Số điện thoại (tối đa 20 ký tự)
- ❌ `manager_name` - Tên người quản lý (tối đa 255 ký tự)
- ❌ `priority` - Độ ưu tiên (number >= 0, mặc định 0)
- ❌ `is_active` - Trạng thái hoạt động (boolean, mặc định true)

**Các trường KHÔNG cần gửi (tự động sinh):**
- ❌ `id` - Tự động sinh
- ❌ `created_user_id` - Tự động lấy từ token
- ❌ `updated_user_id` - Tự động lấy từ token
- ❌ `created_at` - Tự động sinh
- ❌ `updated_at` - Tự động sinh

**Response:** Trả về object kho đã tạo

---

### 4. Cập Nhật Kho

**Endpoint:** `PUT /api/admin/warehouses/:id`

**Permission:** `warehouse:update`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `id` | number | ✅ | ID của kho |

**Request Body:** Tất cả các trường đều tùy chọn (Partial Update)

```json
{
  "name": "Kho Chi Nhánh - Hà Nội (Cập nhật)",
  "phone": "02412345679",
  "manager_name": "Trần Văn C",
  "is_active": true
}
```

**Lưu ý:** Không thể cập nhật `code` sau khi tạo (để đảm bảo tính nhất quán)

**Response:** Trả về object kho đã cập nhật

---

### 5. Xóa Kho

**Endpoint:** `DELETE /api/admin/warehouses/:id`

**Permission:** `warehouse:delete`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `id` | number | ✅ | ID của kho |

**Response:**
```json
{
  "success": true,
  "message": "Xóa kho thành công",
  "data": null
}
```

**Lưu ý:** Đây là soft delete. Không thể xóa kho nếu còn tồn kho hoặc có phiếu chuyển kho liên quan.

---

## 📊 API Tồn Kho (Inventory)

### 1. Lấy Tồn Kho Theo Kho

**Endpoint:** `GET /api/admin/warehouses/:id/inventory`

**Permission:** `warehouse:read`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `id` | number | ✅ | ID của kho |

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả | Ví dụ |
|---------|------|----------|-------|-------|
| `low_stock` | boolean | ❌ | Chỉ hiển thị sản phẩm tồn kho thấp | `true` |

**Response:**
```json
{
  "success": true,
  "message": "Lấy tồn kho thành công",
  "data": [
    {
      "id": 1,
      "warehouse_id": 1,
      "product_variant_id": 1,
      "quantity": 50,
      "reserved_quantity": 5,
      "min_stock_level": 10,
      "updated_at": "2025-01-15T10:30:00.000Z",
      "variant": {
        "id": 1,
        "sku": "IP15PRO-128GB-BLACK",
        "name": "iPhone 15 Pro 128GB - Đen",
        "product": {
          "id": 1,
          "name": "iPhone 15 Pro"
        }
      }
    }
  ]
}
```

**Giải thích các trường:**

| Trường | Kiểu | Bắt buộc | Tự động sinh | Mô tả | Ghi chú |
|--------|------|----------|--------------|-------|---------|
| `id` | number | ✅ | ✅ | ID bản ghi tồn kho | **Tự động sinh** |
| `warehouse_id` | number | ✅ | ❌ | ID kho | **Bắt buộc** khi cập nhật |
| `product_variant_id` | number | ✅ | ❌ | ID biến thể sản phẩm | **Bắt buộc** khi cập nhật. Lấy từ API `/api/admin/product-variants` |
| `quantity` | number | ✅ | ❌ | Số lượng tồn kho hiện tại | **Bắt buộc nhập**, số >= 0 |
| `reserved_quantity` | number | ✅ | ✅ | Số lượng đã đặt trước (cho đơn hàng đang chờ) | **Tự động cập nhật**, chỉ hiển thị (read-only) |
| `min_stock_level` | number | ❌ | ❌ | Mức tồn kho tối thiểu | Tùy chọn, mặc định 0, số >= 0. Dùng để cảnh báo khi `quantity <= min_stock_level` |
| `updated_at` | datetime | ✅ | ✅ | Ngày cập nhật | **Tự động sinh**, chỉ hiển thị |
| `variant` | object | ✅ | ❌ | Thông tin biến thể sản phẩm | **Lấy từ API khác** (join data) |

**Lưu ý:**
- `reserved_quantity` là số lượng đã được đặt trước cho các đơn hàng đang chờ xử lý, không thể cập nhật thủ công
- Số lượng khả dụng thực tế = `quantity - reserved_quantity`
- Khi `quantity <= min_stock_level`, nên hiển thị cảnh báo tồn kho thấp

---

### 2. Cập Nhật Tồn Kho

**Endpoint:** `PUT /api/admin/warehouses/inventory/update`

**Permission:** `warehouse:update`

**Request Body:**

```json
{
  "warehouse_id": 1,
  "product_variant_id": 1,
  "quantity": 100,
  "min_stock_level": 10
}
```

**Các trường bắt buộc:**
- ✅ `warehouse_id` - ID kho (number >= 1)
- ✅ `product_variant_id` - ID biến thể sản phẩm (number >= 1)
- ✅ `quantity` - Số lượng tồn kho mới (number >= 0)

**Các trường tùy chọn:**
- ❌ `min_stock_level` - Mức tồn kho tối thiểu (number >= 0)

**Response:**
```json
{
  "success": true,
  "message": "Cập nhật tồn kho thành công",
  "data": {
    "id": 1,
    "warehouse_id": 1,
    "product_variant_id": 1,
    "quantity": 100,
    "reserved_quantity": 5,
    "min_stock_level": 10,
    "updated_at": "2025-01-20T09:15:00.000Z"
  }
}
```

**Lưu ý:**
- Nếu bản ghi tồn kho chưa tồn tại, API sẽ tự động tạo mới
- Nếu đã tồn tại, API sẽ cập nhật
- `reserved_quantity` không thể cập nhật thủ công (tự động quản lý bởi hệ thống đơn hàng)

---

## 🔄 API Chuyển Kho (Stock Transfer)

### 1. Tạo Phiếu Chuyển Kho

**Endpoint:** `POST /api/admin/warehouses/transfers`

**Permission:** `warehouse:transfer`

**Request Body:**

```json
{
  "from_warehouse_id": 1,
  "to_warehouse_id": 2,
  "product_variant_id": 1,
  "quantity": 20,
  "notes": "Chuyển hàng tồn kho dư"
}
```

**Các trường bắt buộc:**
- ✅ `from_warehouse_id` - ID kho xuất (number >= 1)
- ✅ `to_warehouse_id` - ID kho nhận (number >= 1, phải khác `from_warehouse_id`)
- ✅ `product_variant_id` - ID biến thể sản phẩm (number >= 1)
- ✅ `quantity` - Số lượng chuyển (number >= 1)

**Các trường tùy chọn:**
- ❌ `notes` - Ghi chú (string)

**Response:**
```json
{
  "success": true,
  "message": "Tạo phiếu chuyển kho thành công",
  "data": {
    "id": 1,
    "transfer_number": "TRF-20250120-001",
    "from_warehouse_id": 1,
    "to_warehouse_id": 2,
    "product_variant_id": 1,
    "quantity": 20,
    "status": "pending",
    "notes": "Chuyển hàng tồn kho dư",
    "created_by": 1,
    "approved_by": null,
    "approved_at": null,
    "completed_at": null,
    "created_at": "2025-01-20T09:15:00.000Z",
    "updated_at": "2025-01-20T09:15:00.000Z"
  }
}
```

**Giải thích các trường:**

| Trường | Kiểu | Bắt buộc | Tự động sinh | Mô tả | Ghi chú |
|--------|------|----------|--------------|-------|---------|
| `id` | number | ✅ | ✅ | ID phiếu chuyển kho | **Tự động sinh** |
| `transfer_number` | string | ✅ | ✅ | Số phiếu chuyển kho | **Tự động sinh** (format: TRF-YYYYMMDD-XXX) |
| `from_warehouse_id` | number | ✅ | ❌ | ID kho xuất | **Bắt buộc nhập** |
| `to_warehouse_id` | number | ✅ | ❌ | ID kho nhận | **Bắt buộc nhập**, phải khác `from_warehouse_id` |
| `product_variant_id` | number | ✅ | ❌ | ID biến thể sản phẩm | **Bắt buộc nhập**. Lấy từ API `/api/admin/product-variants` |
| `quantity` | number | ✅ | ❌ | Số lượng chuyển | **Bắt buộc nhập**, số >= 1 |
| `status` | enum | ✅ | ✅ | Trạng thái | **Tự động sinh** mặc định `pending`. Các giá trị: `pending`, `in_transit`, `completed`, `cancelled` |
| `notes` | string | ❌ | ❌ | Ghi chú | Tùy chọn |
| `created_by` | number | ✅ | ✅ | ID người tạo | **Tự động lấy từ token**, không cần gửi |
| `approved_by` | number \| null | ✅ | ✅ | ID người duyệt | **Tự động cập nhật** khi duyệt, chỉ hiển thị |
| `approved_at` | datetime \| null | ✅ | ✅ | Ngày duyệt | **Tự động cập nhật** khi duyệt, chỉ hiển thị |
| `completed_at` | datetime \| null | ✅ | ✅ | Ngày hoàn thành | **Tự động cập nhật** khi hoàn thành, chỉ hiển thị |
| `created_at` | datetime | ✅ | ✅ | Ngày tạo | **Tự động sinh**, chỉ hiển thị |
| `updated_at` | datetime | ✅ | ✅ | Ngày cập nhật | **Tự động sinh**, chỉ hiển thị |

---

### 2. Lấy Danh Sách Phiếu Chuyển Kho

**Endpoint:** `GET /api/admin/warehouses/transfers/list`

**Permission:** `warehouse:read`

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả | Ví dụ |
|---------|------|----------|-------|-------|
| `status` | string | ❌ | Lọc theo trạng thái | `"pending"` |
| `warehouse_id` | number | ❌ | Lọc theo ID kho (kho xuất hoặc kho nhận) | `1` |

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách phiếu chuyển kho thành công",
  "data": [
    {
      "id": 1,
      "transfer_number": "TRF-20250120-001",
      "from_warehouse_id": 1,
      "to_warehouse_id": 2,
      "product_variant_id": 1,
      "quantity": 20,
      "status": "pending",
      "notes": "Chuyển hàng tồn kho dư",
      "created_by": 1,
      "approved_by": null,
      "approved_at": null,
      "completed_at": null,
      "created_at": "2025-01-20T09:15:00.000Z",
      "updated_at": "2025-01-20T09:15:00.000Z",
      "from_warehouse": {
        "id": 1,
        "name": "Kho Chính - TP.HCM",
        "code": "WH-HCM-01"
      },
      "to_warehouse": {
        "id": 2,
        "name": "Kho Chi Nhánh - Hà Nội",
        "code": "WH-HN-01"
      },
      "variant": {
        "id": 1,
        "sku": "IP15PRO-128GB-BLACK",
        "name": "iPhone 15 Pro 128GB - Đen"
      }
    }
  ]
}
```

---

### 3. Duyệt Phiếu Chuyển Kho

**Endpoint:** `PUT /api/admin/warehouses/transfers/:id/approve`

**Permission:** `warehouse:transfer`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `id` | number | ✅ | ID của phiếu chuyển kho |

**Response:**
```json
{
  "success": true,
  "message": "Duyệt phiếu chuyển kho thành công",
  "data": {
    "id": 1,
    "status": "in_transit",
    "approved_by": 1,
    "approved_at": "2025-01-20T10:00:00.000Z"
  }
}
```

**Lưu ý:**
- Chỉ có thể duyệt phiếu có `status = "pending"`
- Sau khi duyệt, `status` chuyển thành `"in_transit"`
- `approved_by` và `approved_at` được tự động cập nhật

---

### 4. Hoàn Thành Phiếu Chuyển Kho

**Endpoint:** `PUT /api/admin/warehouses/transfers/:id/complete`

**Permission:** `warehouse:transfer`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `id` | number | ✅ | ID của phiếu chuyển kho |

**Response:**
```json
{
  "success": true,
  "message": "Hoàn thành phiếu chuyển kho thành công",
  "data": {
    "id": 1,
    "status": "completed",
    "completed_at": "2025-01-20T11:00:00.000Z"
  }
}
```

**Lưu ý:**
- Chỉ có thể hoàn thành phiếu có `status = "in_transit"`
- Sau khi hoàn thành:
  - `status` chuyển thành `"completed"`
  - Tồn kho kho xuất (`from_warehouse_id`) giảm đi `quantity`
  - Tồn kho kho nhận (`to_warehouse_id`) tăng thêm `quantity`
- `completed_at` được tự động cập nhật

---

### 5. Hủy Phiếu Chuyển Kho

**Endpoint:** `PUT /api/admin/warehouses/transfers/:id/cancel`

**Permission:** `warehouse:transfer`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `id` | number | ✅ | ID của phiếu chuyển kho |

**Response:**
```json
{
  "success": true,
  "message": "Hủy phiếu chuyển kho thành công",
  "data": {
    "id": 1,
    "status": "cancelled"
  }
}
```

**Lưu ý:**
- Chỉ có thể hủy phiếu có `status = "pending"` hoặc `"in_transit"`
- Sau khi hủy, `status` chuyển thành `"cancelled"`
- Không thể hoàn thành hoặc duyệt lại phiếu đã hủy

---

## 🔗 Các API Liên Quan

### 1. Lấy Danh Sách Sản Phẩm

**Endpoint:** `GET /api/admin/products`

**Mục đích:** Lấy danh sách sản phẩm để chọn cho `applicable_products` và `excluded_products` trong Coupon

**Query Parameters:**
- `page`, `limit`, `search`, `status`, `sortBy`, `sortOrder`

**Response:** Danh sách sản phẩm với các trường: `id`, `name`, `slug`, `status`, ...

---

### 2. Lấy Danh Sách Biến Thể Sản Phẩm

**Endpoint:** `GET /api/admin/product-variants`

**Mục đích:** Lấy danh sách biến thể sản phẩm để chọn cho `product_variant_id` trong Inventory và Stock Transfer

**Query Parameters:**
- `page`, `limit`, `search`, `product_id`, `status`, `sortBy`, `sortOrder`

**Response:** Danh sách biến thể với các trường: `id`, `sku`, `name`, `product_id`, `price`, ...

---

### 3. Lấy Danh Sách Danh Mục Sản Phẩm

**Endpoint:** `GET /api/admin/product-categories`

**Mục đích:** Lấy danh sách danh mục để chọn cho `applicable_categories` trong Coupon

**Query Parameters:**
- `page`, `limit`, `search`, `status`, `parent_id`, `tree`, `sortBy`, `sortOrder`

**Response:** Danh sách danh mục với các trường: `id`, `name`, `slug`, `parent_id`, `status`, ...

---

## 📝 Tóm Tắt Các Trường Tự Động Sinh (Không Cần Hiển Thị Ở Form)

### Coupon:
- ✅ `id` - Tự động sinh khi tạo mới
- ✅ `used_count` - Tự động cập nhật khi có đơn hàng sử dụng
- ✅ `status` - Mặc định `active` khi tạo mới
- ✅ `created_user_id` - Tự động lấy từ JWT token
- ✅ `updated_user_id` - Tự động lấy từ JWT token
- ✅ `created_at` - Tự động sinh
- ✅ `updated_at` - Tự động sinh
- ✅ `deleted_at` - null (chỉ có khi soft delete)

### Warehouse:
- ✅ `id` - Tự động sinh khi tạo mới
- ✅ `created_user_id` - Tự động lấy từ JWT token
- ✅ `updated_user_id` - Tự động lấy từ JWT token
- ✅ `created_at` - Tự động sinh
- ✅ `updated_at` - Tự động sinh

### Inventory:
- ✅ `id` - Tự động sinh khi tạo mới (nếu chưa tồn tại)
- ✅ `reserved_quantity` - Tự động cập nhật bởi hệ thống đơn hàng
- ✅ `updated_at` - Tự động sinh

### Stock Transfer:
- ✅ `id` - Tự động sinh khi tạo mới
- ✅ `transfer_number` - Tự động sinh (format: TRF-YYYYMMDD-XXX)
- ✅ `status` - Mặc định `pending` khi tạo mới
- ✅ `created_by` - Tự động lấy từ JWT token
- ✅ `approved_by` - Tự động cập nhật khi duyệt
- ✅ `approved_at` - Tự động cập nhật khi duyệt
- ✅ `completed_at` - Tự động cập nhật khi hoàn thành
- ✅ `created_at` - Tự động sinh
- ✅ `updated_at` - Tự động sinh

---

## ⚠️ Lưu Ý Quan Trọng

1. **Validation:**
   - `code` trong Coupon và Warehouse phải duy nhất
   - `end_date` phải sau `start_date` trong Coupon
   - `to_warehouse_id` phải khác `from_warehouse_id` trong Stock Transfer
   - `quantity` phải >= 0 trong Inventory, >= 1 trong Stock Transfer

2. **Permissions:**
   - Đảm bảo user có đủ quyền trước khi gọi API
   - Nếu thiếu quyền, API sẽ trả về 403 Forbidden

3. **Error Handling:**
   - Luôn kiểm tra `success` trong response
   - Xử lý các mã lỗi: 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 409 (Conflict), 422 (Validation Error)

4. **Data Relationships:**
   - `product_variant_id` phải tồn tại trong bảng `product_variants`
   - `warehouse_id` phải tồn tại trong bảng `warehouses`
   - `applicable_products` và `applicable_categories` phải là các ID hợp lệ

5. **Soft Delete:**
   - Coupon sử dụng soft delete, có thể khôi phục sau
   - Warehouse có thể soft delete, nhưng không thể xóa nếu còn tồn kho hoặc phiếu chuyển kho

---

## 📞 Hỗ Trợ

Nếu có thắc mắc hoặc cần hỗ trợ, vui lòng liên hệ team Backend.

---

**Cập nhật lần cuối:** 2025-12-05

