# Admin Coupon API

API quản lý mã giảm giá (coupons) dành cho quản trị viên - yêu cầu authentication và permissions.

## Cấu trúc

- Base URL: `http://localhost:3000/api`
- Authentication: JWT Bearer Token (bắt buộc)
- Headers: `Content-Type: application/json`
- Required Permission: `coupon:*` (tùy theo endpoint)

---

## 1. Get Coupons List (Lấy danh sách mã giảm giá)

Lấy danh sách tất cả mã giảm giá với phân trang và bộ lọc.

### Endpoint
```
GET /api/admin/coupons
```

### Query Parameters
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| page | number | Không | Số trang (mặc định: 1) |
| limit | number | Không | Số lượng mỗi trang (mặc định: 10) |
| search | string | Không | Tìm kiếm theo tên hoặc mã |
| status | string | Không | Lọc theo trạng thái (active/inactive) |
| discount_type | string | Không | Lọc theo loại giảm giá |
| start_date | string | Không | Lọc theo ngày bắt đầu (YYYY-MM-DD) |
| end_date | string | Không | Lọc theo ngày kết thúc (YYYY-MM-DD) |
| sortBy | string | Không | Sắp xếp theo trường |
| sortOrder | string | Không | Thứ tự sắp xếp (ASC/DESC) |

### Request Example

```bash
curl -X GET "http://localhost:3000/api/admin/coupons?page=1&limit=10&status=active" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
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
      "discount_type": "percentage",
      "discount_value": 10,
      "minimum_order_amount": 100000,
      "maximum_discount_amount": 50000,
      "usage_limit": 100,
      "usage_count": 25,
      "user_usage_limit": 1,
      "start_date": "2025-01-01T00:00:00.000Z",
      "end_date": "2025-12-31T23:59:59.999Z",
      "is_active": true,
      "applicable_for": "all",
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## 2. Get Coupon by ID (Lấy chi tiết mã giảm giá)

Lấy thông tin chi tiết của một mã giảm giá cụ thể.

### Endpoint
```
GET /api/admin/coupons/:id
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của mã giảm giá |

### Request Example

```bash
curl -X GET "http://localhost:3000/api/admin/coupons/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy thông tin mã giảm giá thành công",
  "data": {
    "id": 1,
    "code": "WELCOME10",
    "name": "Giảm giá chào mừng",
    "description": "Giảm 10% cho đơn hàng đầu tiên",
    "discount_type": "percentage",
    "discount_value": 10,
    "minimum_order_amount": 100000,
    "maximum_discount_amount": 50000,
    "usage_limit": 100,
    "usage_count": 25,
    "user_usage_limit": 1,
    "start_date": "2025-01-01T00:00:00.000Z",
    "end_date": "2025-12-31T23:59:59.999Z",
    "is_active": true,
    "applicable_for": "all",
    "applicable_products": [],
    "applicable_categories": [],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-15T10:30:00.000Z"
  }
}
```

---

## 3. Get Coupon Stats (Lấy thống kê sử dụng mã giảm giá)

Lấy thống kê sử dụng của một mã giảm giá.

### Endpoint
```
GET /api/admin/coupons/:id/stats
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của mã giảm giá |

### Request Example

```bash
curl -X GET "http://localhost:3000/api/admin/coupons/1/stats" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy thống kê mã giảm giá thành công",
  "data": {
    "coupon_id": 1,
    "total_usage": 25,
    "unique_users": 20,
    "total_discount_amount": 1250000,
    "average_discount": 50000,
    "usage_by_date": [
      {
        "date": "2025-01-15",
        "count": 5,
        "discount_amount": 250000
      },
      {
        "date": "2025-01-14",
        "count": 3,
        "discount_amount": 150000
      }
    ],
    "usage_by_status": [
      {
        "status": "completed",
        "count": 20,
        "discount_amount": 1000000
      },
      {
        "status": "pending",
        "count": 5,
        "discount_amount": 250000
      }
    ]
  }
}
```

---

## 4. Create Coupon (Tạo mã giảm giá mới)

Tạo một mã giảm giá mới.

### Endpoint
```
POST /api/admin/coupons
```

### Request Body
```json
{
  "code": "SUMMER2025",
  "name": "Giảm giá hè 2025",
  "description": "Giảm 15% cho tất cả sản phẩm mùa hè",
  "discount_type": "percentage",
  "discount_value": 15,
  "minimum_order_amount": 200000,
  "maximum_discount_amount": 100000,
  "usage_limit": 500,
  "user_usage_limit": 3,
  "start_date": "2025-06-01T00:00:00.000Z",
  "end_date": "2025-08-31T23:59:59.999Z",
  "is_active": true,
  "applicable_for": "all",
  "applicable_products": [],
  "applicable_categories": []
}
```

**Fields:**
- `code` (required): Mã giảm giá (duy nhất)
- `name` (required): Tên mã giảm giá
- `description` (optional): Mô tả chi tiết
- `discount_type` (required): Loại giảm giá (percentage, fixed_amount, shipping)
- `discount_value` (required): Giá trị giảm giá
- `minimum_order_amount` (optional): Giá trị đơn hàng tối thiểu
- `maximum_discount_amount` (optional): Giá trị giảm tối đa
- `usage_limit` (optional): Số lần sử dụng tối đa
- `user_usage_limit` (optional): Số lần sử dụng tối đa cho mỗi user
- `start_date` (required): Ngày bắt đầu hiệu lực
- `end_date` (required): Ngày kết thúc hiệu lực
- `is_active` (required): Trạng thái kích hoạt
- `applicable_for` (required): Phạm vi áp dụng (all, products, categories)
- `applicable_products` (optional): Danh sách sản phẩm áp dụng
- `applicable_categories` (optional): Danh mục áp dụng

### Request Example

```bash
curl -X POST "http://localhost:3000/api/admin/coupons" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "code": "SUMMER2025",
    "name": "Giảm giá hè 2025",
    "description": "Giảm 15% cho tất cả sản phẩm mùa hè",
    "discount_type": "percentage",
    "discount_value": 15,
    "minimum_order_amount": 200000,
    "maximum_discount_amount": 100000,
    "usage_limit": 500,
    "user_usage_limit": 3,
    "start_date": "2025-06-01T00:00:00.000Z",
    "end_date": "2025-08-31T23:59:59.999Z",
    "is_active": true,
    "applicable_for": "all"
  }'
```

### Response

**Success (201):**
```json
{
  "success": true,
  "message": "Tạo mã giảm giá thành công",
  "data": {
    "id": 10,
    "code": "SUMMER2025",
    "name": "Giảm giá hè 2025",
    "description": "Giảm 15% cho tất cả sản phẩm mùa hè",
    "discount_type": "percentage",
    "discount_value": 15,
    "minimum_order_amount": 200000,
    "maximum_discount_amount": 100000,
    "usage_limit": 500,
    "usage_count": 0,
    "user_usage_limit": 3,
    "start_date": "2025-06-01T00:00:00.000Z",
    "end_date": "2025-08-31T23:59:59.999Z",
    "is_active": true,
    "applicable_for": "all",
    "created_at": "2025-01-20T08:30:00.000Z",
    "updated_at": "2025-01-20T08:30:00.000Z"
  }
}
```

---

## 5. Update Coupon (Cập nhật mã giảm giá)

Cập nhật thông tin của một mã giảm giá.

### Endpoint
```
PUT /api/admin/coupons/:id
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của mã giảm giá |

### Request Body
```json
{
  "name": "Giảm giá hè 2025 (Cập nhật)",
  "description": "Giảm 20% cho tất cả sản phẩm mùa hè",
  "discount_value": 20,
  "maximum_discount_amount": 150000,
  "usage_limit": 1000,
  "end_date": "2025-09-30T23:59:59.999Z"
}
```

### Request Example

```bash
curl -X PUT "http://localhost:3000/api/admin/coupons/10" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Giảm giá hè 2025 (Cập nhật)",
    "description": "Giảm 20% cho tất cả sản phẩm mùa hè",
    "discount_value": 20,
    "maximum_discount_amount": 150000,
    "usage_limit": 1000,
    "end_date": "2025-09-30T23:59:59.999Z"
  }'
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Cập nhật mã giảm giá thành công",
  "data": {
    "id": 10,
    "code": "SUMMER2025",
    "name": "Giảm giá hè 2025 (Cập nhật)",
    "description": "Giảm 20% cho tất cả sản phẩm mùa hè",
    "discount_type": "percentage",
    "discount_value": 20,
    "minimum_order_amount": 200000,
    "maximum_discount_amount": 150000,
    "usage_limit": 1000,
    "usage_count": 0,
    "user_usage_limit": 3,
    "start_date": "2025-06-01T00:00:00.000Z",
    "end_date": "2025-09-30T23:59:59.999Z",
    "is_active": true,
    "applicable_for": "all",
    "updated_at": "2025-01-20T09:15:00.000Z"
  }
}
```

---

## 6. Delete Coupon (Xóa mã giảm giá)

Xóa mềm một mã giảm giá (soft delete).

### Endpoint
```
DELETE /api/admin/coupons/:id
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của mã giảm giá |

### Request Example

```bash
curl -X DELETE "http://localhost:3000/api/admin/coupons/10" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Xóa mã giảm giá thành công",
  "data": null
}
```

---

## 7. Restore Coupon (Khôi phục mã giảm giá)

Khôi phục một mã giảm giá đã bị xóa.

### Endpoint
```
PUT /api/admin/coupons/:id/restore
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của mã giảm giá |

### Request Example

```bash
curl -X PUT "http://localhost:3000/api/admin/coupons/10/restore" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Khôi phục mã giảm giá thành công",
  "data": {
    "id": 10,
    "code": "SUMMER2025",
    "name": "Giảm giá hè 2025 (Cập nhật)",
    "is_active": true,
    "deleted_at": null,
    "updated_at": "2025-01-20T10:30:00.000Z"
  }
}
```

---

## 8. Toggle Coupon Status (Bật/tắt trạng thái mã giảm giá)

Bật hoặc tắt trạng thái kích hoạt của mã giảm giá.

### Endpoint
```
PUT /api/admin/coupons/:id/toggle-status
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của mã giảm giá |

### Request Example

```bash
curl -X PUT "http://localhost:3000/api/admin/coupons/10/toggle-status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Cập nhật trạng thái mã giảm giá thành công",
  "data": {
    "id": 10,
    "code": "SUMMER2025",
    "is_active": false,
    "updated_at": "2025-01-20T11:00:00.000Z"
  }
}
```

---

## Discount Types

| Type | Description | Example |
|------|-------------|---------|
| `percentage` | Giảm theo phần trăm | Giảm 15% trên tổng đơn hàng |
| `fixed_amount` | Giảm số tiền cố định | Giảm 100.000đ |
| `shipping` | Miễn phí vận chuyển | Miễn phí phí ship |

---

## Applicable For Values

| Value | Description |
|-------|-------------|
| `all` | Áp dụng cho tất cả sản phẩm |
| `products` | Chỉ áp dụng cho sản phẩm cụ thể |
| `categories` | Chỉ áp dụng cho danh mục cụ thể |

---

## Use Cases

### Use Case 1: Tạo mã giảm giá theo mùa

```bash
# 1. Tạo mã giảm giá mùa hè
POST /api/admin/coupons
{
  "code": "SUMMER2025",
  "name": "Giảm giá hè 2025",
  "discount_type": "percentage",
  "discount_value": 20,
  "start_date": "2025-06-01T00:00:00.000Z",
  "end_date": "2025-08-31T23:59:59.999Z",
  "applicable_for": "categories",
  "applicable_categories": [1, 2, 3]  # Danh mục mùa hè
}

# 2. Xem thống kê sử dụng
GET /api/admin/coupons/10/stats

# 3. Cập nhật nếu cần
PUT /api/admin/coupons/10
{
  "discount_value": 25,
  "usage_limit": 1000
}
```

### Use Case 2: Quản lý mã giảm giá theo dịp đặc biệt

```bash
# 1. Tạo mã giảm giá Black Friday
POST /api/admin/coupons
{
  "code": "BLACKFRIDAY2025",
  "name": "Black Friday 2025",
  "discount_type": "fixed_amount",
  "discount_value": 500000,
  "minimum_order_amount": 2000000,
  "usage_limit": 1000,
  "user_usage_limit": 1,
  "start_date": "2025-11-29T00:00:00.000Z",
  "end_date": "2025-11-29T23:59:59.999Z"
}

# 2. Theo dõi sử dụng real-time
GET /api/admin/coupons/11/stats

# 3. Tắt sớm nếu hết lượt sử dụng
PUT /api/admin/coupons/11/toggle-status
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid data |
| 401 | Unauthorized - Invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Coupon not found |
| 409 | Conflict - Duplicate coupon code |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error |

---

**Xem thêm:**
- [Public Discount API](../public/discount.md)
- [Admin Order API](./order.md)
- [Admin Product API](./product.md)