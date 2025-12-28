# Admin Orders API

API quản lý đơn hàng (orders) trong hệ thống admin.

## Cấu trúc

- Base URL: `http://localhost:3000/api`
- Authentication: JWT Bearer Token (bắt buộc)
- Permission: `order:read`, `order:create`, `order:update`, `order:delete`
- Headers: `Content-Type: application/json`

---

## 1. Get Orders List (Lấy danh sách đơn hàng)

### Request

```bash
curl -X GET "http://localhost:3000/api/admin/orders?page=1&limit=10" \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

### Query Parameters

- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số lượng mỗi trang (mặc định: 10)
- `status` (optional): Lọc theo trạng thái
- `payment_status` (optional): Lọc theo trạng thái thanh toán
- `user_id` (optional): Lọc theo người dùng
- `from_date` (optional): Từ ngày
- `to_date` (optional): Đến ngày
- `sortBy` (optional): Trường sắp xếp
- `sortOrder` (optional): Thứ tự (`ASC` hoặc `DESC`)

### Response

**Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "order_code": "ORD-2025-001",
      "user_id": 5,
      "user": {
        "id": 5,
        "name": "Nguyễn Văn A",
        "email": "user@example.com"
      },
      "status": "confirmed",
      "payment_status": "pending",
      "payment_method": "bank_transfer",
      "shipping_method": "standard",
      "subtotal": 1000000,
      "shipping_fee": 30000,
      "discount": 50000,
      "total_amount": 980000,
      "shipping_address": {
        "name": "Nguyễn Văn A",
        "phone": "0123456789",
        "address": "123 ABC Street",
        "city": "Hà Nội",
        "province": "Hà Nội",
        "postal_code": "100000"
      },
      "note": "Giao hàng giờ hành chính",
      "created_at": "2025-01-11T05:00:00.000Z",
      "updated_at": "2025-01-11T05:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 500,
    "totalPages": 50,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## 2. Get Order by ID (Lấy thông tin đơn hàng)

### Request

```bash
curl -X GET http://localhost:3000/api/admin/orders/1 \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "order_code": "ORD-2025-001",
    "user_id": 5,
    "user": {
      "id": 5,
      "name": "Nguyễn Văn A",
      "email": "user@example.com",
      "phone": "0123456789"
    },
    "status": "confirmed",
    "payment_status": "pending",
    "payment_method": "bank_transfer",
    "shipping_method": "standard",
    "shipping_address": {
      "name": "Nguyễn Văn A",
      "phone": "0123456789",
      "address": "123 ABC Street",
      "ward": "Phường 1",
      "district": "Quận 1",
      "city": "Hà Nội",
      "province": "Hà Nội",
      "postal_code": "100000"
    },
    "items": [
      {
        "id": 1,
        "product_id": 10,
        "product_name": "iPhone 15 Pro",
        "variant_id": 1,
        "variant_name": "128GB - Đen",
        "sku": "IP15PRO-128GB-BLACK",
        "quantity": 1,
        "price": 29990000,
        "discount": 0,
        "total": 29990000
      }
    ],
    "subtotal": 29990000,
    "shipping_fee": 30000,
    "discount": 50000,
    "tax": 0,
    "total_amount": 29970000,
    "note": "Giao hàng giờ hành chính",
    "admin_note": "",
    "tracking_number": "",
    "status_history": [
      {
        "status": "pending",
        "note": "Đơn hàng được tạo",
        "created_by": 5,
        "created_at": "2025-01-11T05:00:00.000Z"
      },
      {
        "status": "confirmed",
        "note": "Đơn hàng đã được xác nhận",
        "created_by": 1,
        "created_at": "2025-01-11T06:00:00.000Z"
      }
    ],
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T06:00:00.000Z"
  },
  "message": "Thành công"
}
```

---

## 3. Create Order (Tạo đơn hàng)

### Request

```bash
curl -X POST http://localhost:3000/api/admin/orders \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 5,
    "items": [
      {
        "product_id": 10,
        "variant_id": 1,
        "quantity": 1,
        "price": 29990000
      }
    ],
    "shipping_address": {
      "name": "Nguyễn Văn A",
      "phone": "0123456789",
      "address": "123 ABC Street",
      "city": "Hà Nội",
      "province": "Hà Nội"
    },
    "payment_method": "bank_transfer",
    "shipping_method": "standard"
  }'
```

### Request Body

```json
{
  "user_id": 5,
  "items": [
    {
      "product_id": 10,
      "variant_id": 1,
      "quantity": 1,
      "price": 29990000
    }
  ],
  "shipping_address": {
    "name": "Nguyễn Văn A",
    "phone": "0123456789",
    "address": "123 ABC Street",
    "ward": "Phường 1",
    "district": "Quận 1",
    "city": "Hà Nội",
    "province": "Hà Nội",
    "postal_code": "100000"
  },
  "payment_method": "bank_transfer",
  "shipping_method": "standard",
  "note": "Giao hàng giờ hành chính",
  "admin_note": "Khách VIP"
}
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 501,
    "order_code": "ORD-2025-501",
    "status": "pending",
    "total_amount": 30020000,
    "created_at": "2025-01-11T07:00:00.000Z"
  },
  "message": "Tạo đơn hàng thành công"
}
```

---

## 4. Update Order Status (Cập nhật trạng thái)

### Request

```bash
curl -X PATCH http://localhost:3000/api/admin/orders/1/status \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shipping",
    "note": "Đang giao hàng",
    "tracking_number": "TRACK123456"
  }'
```

### Request Body

```json
{
  "status": "shipping",
  "note": "Đang giao hàng",
  "tracking_number": "TRACK123456"
}
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "shipping",
    "tracking_number": "TRACK123456",
    "updated_at": "2025-01-11T08:00:00.000Z"
  },
  "message": "Cập nhật trạng thái thành công"
}
```

---

## 5. Cancel Order (Hủy đơn hàng)

### Request

```bash
curl -X PATCH http://localhost:3000/api/admin/orders/1/cancel \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Khách hàng yêu cầu hủy"
  }'
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "cancelled",
    "cancelled_at": "2025-01-11T09:00:00.000Z"
  },
  "message": "Hủy đơn hàng thành công"
}
```

---

## 6. Update Payment Status (Cập nhật trạng thái thanh toán)

### Request

```bash
curl -X PATCH http://localhost:3000/api/admin/orders/1/payment-status \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_status": "completed",
    "payment_note": "Đã nhận chuyển khoản"
  }'
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "payment_status": "completed",
    "paid_at": "2025-01-11T10:00:00.000Z"
  },
  "message": "Cập nhật trạng thái thanh toán thành công"
}
```

---

## Order Status Flow

```
pending → confirmed → processing → shipping → delivered → completed
                ↓
            cancelled
```

**Status:**
- `pending` - Chờ xác nhận
- `confirmed` - Đã xác nhận
- `processing` - Đang xử lý
- `shipping` - Đang giao hàng
- `delivered` - Đã giao hàng
- `completed` - Hoàn thành
- `cancelled` - Đã hủy
- `refunded` - Đã hoàn tiền

---

## Payment Status

- `pending` - Chờ thanh toán
- `processing` - Đang xử lý
- `completed` - Đã thanh toán
- `failed` - Thanh toán thất bại
- `refunded` - Đã hoàn tiền

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Validation failed |
| 401 | Unauthorized |
| 403 | Forbidden - Permission denied |
| 404 | Not Found - Order not found |
| 409 | Conflict - Cannot update order status |
| 500 | Internal Server Error |

---

**Xem thêm:**
- [Public Orders API](../public/order.md)
- [User Orders API](../user/order.md)
- [Admin Products API](./product.md)