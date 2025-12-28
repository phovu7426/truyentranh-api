# Admin Payment Methods API

API quản lý phương thức thanh toán (payment methods) trong hệ thống admin.

## Cấu trúc

- Base URL: `http://localhost:3000/api`
- Authentication: JWT Bearer Token (bắt buộc)
- Permission: `payment-method:read`, `payment-method:create`, `payment-method:update`, `payment-method:delete`
- Headers: `Content-Type: application/json`

---

## 1. Create Payment Method (Tạo phương thức thanh toán)

### Request

```bash
curl -X POST http://localhost:3000/api/admin/payment-methods \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MoMo",
    "code": "momo",
    "description": "Thanh toán qua ví MoMo",
    "is_active": true,
    "display_order": 3,
    "icon": "https://example.com/momo-icon.png",
    "config": {
      "partner_code": "MOMO_PARTNER",
      "access_key": "YOUR_ACCESS_KEY"
    }
  }'
```

### Request Body

```json
{
  "name": "MoMo",
  "code": "momo",
  "description": "Thanh toán qua ví MoMo",
  "is_active": true,
  "display_order": 3,
  "icon": "https://example.com/momo-icon.png",
  "config": {
    "partner_code": "MOMO_PARTNER",
    "access_key": "YOUR_ACCESS_KEY"
  }
}
```

**Fields:**
- `name` (required): Tên phương thức thanh toán
- `code` (required): Mã code (unique, lowercase, underscore)
- `description` (optional): Mô tả
- `is_active` (optional): Trạng thái hoạt động (mặc định: true)
- `display_order` (optional): Thứ tự hiển thị
- `icon` (optional): URL icon
- `config` (optional): Cấu hình JSON (tùy theo từng phương thức)

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 6,
    "name": "MoMo",
    "code": "momo",
    "description": "Thanh toán qua ví MoMo",
    "is_active": true,
    "display_order": 3,
    "icon": "https://example.com/momo-icon.png",
    "created_at": "2025-01-11T06:00:00.000Z",
    "updated_at": "2025-01-11T06:00:00.000Z"
  },
  "message": "Thành công"
}
```

---

## 2. Get Payment Methods List (Lấy danh sách phương thức thanh toán)

### Request

```bash
curl -X GET "http://localhost:3000/api/admin/payment-methods?page=1&limit=10" \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

### Query Parameters

- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số lượng mỗi trang (mặc định: 10)
- `sortBy` (optional): Trường sắp xếp
- `sortOrder` (optional): Thứ tự (`ASC` hoặc `DESC`)
- `filters` (optional): JSON filters

### Response

**Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Chuyển khoản ngân hàng",
      "code": "bank_transfer",
      "description": "Thanh toán qua chuyển khoản ngân hàng",
      "is_active": true,
      "display_order": 1,
      "icon": "https://example.com/bank-icon.png",
      "config": {
        "bank_name": "Vietcombank",
        "account_number": "1234567890",
        "account_holder": "CÔNG TY ABC"
      },
      "created_at": "2025-01-11T05:00:00.000Z",
      "updated_at": "2025-01-11T05:00:00.000Z"
    },
    {
      "id": 2,
      "name": "VNPay",
      "code": "vnpay",
      "description": "Thanh toán qua VNPay",
      "is_active": true,
      "display_order": 2,
      "icon": "https://example.com/vnpay-icon.png",
      "created_at": "2025-01-11T05:00:00.000Z",
      "updated_at": "2025-01-11T05:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 5,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

---

## 3. Get Payment Method by ID (Lấy thông tin phương thức thanh toán)

### Request

```bash
curl -X GET http://localhost:3000/api/admin/payment-methods/1 \
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
    "name": "Chuyển khoản ngân hàng",
    "code": "bank_transfer",
    "description": "Thanh toán qua chuyển khoản ngân hàng",
    "is_active": true,
    "display_order": 1,
    "icon": "https://example.com/bank-icon.png",
    "config": {
      "bank_name": "Vietcombank",
      "account_number": "1234567890",
      "account_holder": "CÔNG TY ABC"
    },
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T05:00:00.000Z"
  },
  "message": "Thành công"
}
```

---

## 4. Update Payment Method (Cập nhật phương thức thanh toán)

### Request

```bash
curl -X PATCH http://localhost:3000/api/admin/payment-methods/1 \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tên đã cập nhật",
    "is_active": false
  }'
```

### Request Body

Tất cả fields đều optional.

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Tên đã cập nhật",
    "is_active": false,
    "updated_at": "2025-01-11T06:05:00.000Z"
  },
  "message": "Cập nhật thành công"
}
```

---

## 5. Delete Payment Method (Xóa phương thức thanh toán)

### Request

```bash
curl -X DELETE http://localhost:3000/api/admin/payment-methods/1 \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Xóa thành công"
}
```

---

## 6. Restore Payment Method (Khôi phục phương thức thanh toán)

### Request

```bash
curl -X PATCH http://localhost:3000/api/admin/payment-methods/1/restore \
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
    "name": "Chuyển khoản ngân hàng",
    "is_active": true,
    "deleted_at": null,
    "updated_at": "2025-01-11T06:10:00.000Z"
  },
  "message": "Khôi phục thành công"
}
```

---

## Payment Method Codes

Các mã phương thức thanh toán phổ biến:

- `cash`: Tiền mặt
- `bank_transfer`: Chuyển khoản ngân hàng
- `vnpay`: VNPay
- `momo`: MoMo
- `zalopay`: ZaloPay
- `credit_card`: Thẻ tín dụng
- `debit_card`: Thẻ ghi nợ
- `cod`: Thu tiền khi nhận hàng (Cash on Delivery)

---

## Config Structure

Mỗi phương thức thanh toán có cấu trúc config riêng:

### Bank Transfer
```json
{
  "config": {
    "bank_name": "Vietcombank",
    "account_number": "1234567890",
    "account_holder": "CÔNG TY ABC",
    "branch": "Chi nhánh Hà Nội"
  }
}
```

### VNPay
```json
{
  "config": {
    "tmn_code": "YOUR_TMN_CODE",
    "hash_secret": "YOUR_HASH_SECRET",
    "return_url": "https://yoursite.com/payment/vnpay/return"
  }
}
```

### MoMo
```json
{
  "config": {
    "partner_code": "MOMO_PARTNER",
    "access_key": "YOUR_ACCESS_KEY",
    "secret_key": "YOUR_SECRET_KEY",
    "redirect_url": "https://yoursite.com/payment/momo/return",
    "ipn_url": "https://yoursite.com/payment/momo/ipn"
  }
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Validation failed |
| 401 | Unauthorized |
| 403 | Forbidden - Permission denied |
| 404 | Not Found - Payment method not found |
| 409 | Conflict - Code already exists |
| 500 | Internal Server Error |

---

**Xem thêm:**
- [Public Payment Methods API](./../public/payment-method.md)
- [Public Payment API](./../public/payment.md)
- [User Payment API](./../user/payment.md)