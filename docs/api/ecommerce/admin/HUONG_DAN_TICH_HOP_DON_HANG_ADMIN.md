# Hướng Dẫn Tích Hợp API Đơn Hàng Admin

Tài liệu này cung cấp hướng dẫn chi tiết để tích hợp các API quản lý đơn hàng (orders) dành cho Frontend Admin.

---

## 📋 Mục Lục

1. [Thông Tin Chung](#thông-tin-chung)
2. [API Đơn Hàng (Orders)](#api-đơn-hàng-orders)
3. [API Quản Lý Thanh Toán (Payments)](#api-quản-lý-thanh-toán-payments)
4. [API Quản Lý Vận Chuyển (Shipping Methods)](#api-quản-lý-vận-chuyển-shipping-methods)
5. [API Quản Lý Phương Thức Thanh Toán (Payment Methods)](#api-quản-lý-phương-thức-thanh-toán-payment-methods)
6. [Quy Trình Xử Lý Đơn Hàng](#quy-trình-xử-lý-đơn-hàng)
7. [Các API Liên Quan](#các-api-liên-quan)
8. [Cấu Trúc Dữ Liệu Chi Tiết](#cấu-trúc-dữ-liệu-chi-tiết)

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
- **Order APIs**: Cần permission `read:orders`, `update:orders`
- **Payment APIs**: Cần permission `read:payments`, `update:payments` (nếu có)
- **Shipping Method APIs**: Cần permission `shipping-method:read`, `shipping-method:update`
- **Payment Method APIs**: Cần permission `payment-method:read`, `payment-method:update`

---

## 📦 API Đơn Hàng (Orders)

### 1. Lấy Danh Sách Đơn Hàng

**Endpoint:** `GET /api/admin/orders`

**Permission:** `read:orders`

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả | Ví dụ |
|---------|------|----------|-------|-------|
| `page` | number | ❌ | Số trang (mặc định: 1) | `1` |
| `limit` | number | ❌ | Số lượng mỗi trang (mặc định: 10) | `20` |
| `status` | string | ❌ | Lọc theo trạng thái: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled` | `"pending"` |
| `paymentStatus` | string | ❌ | Lọc theo trạng thái thanh toán: `pending`, `paid`, `failed`, `refunded`, `partially_refunded` | `"paid"` |
| `shippingStatus` | string | ❌ | Lọc theo trạng thái vận chuyển: `pending`, `preparing`, `shipped`, `delivered`, `returned` | `"shipped"` |
| `customerEmail` | string | ❌ | Tìm kiếm theo email khách hàng | `"customer@example.com"` |
| `startDate` | string (ISO date) | ❌ | Lọc từ ngày | `"2025-01-01"` |
| `endDate` | string (ISO date) | ❌ | Lọc đến ngày | `"2025-12-31"` |

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách đơn hàng thành công",
  "data": [
    {
      "id": 1,
      "order_number": "ORD-20250111-000001",
      "user_id": 5,
      "customer_name": "Nguyễn Văn A",
      "customer_email": "customer@example.com",
      "customer_phone": "0123456789",
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
      "billing_address": {
        "name": "Nguyễn Văn A",
        "phone": "0123456789",
        "address": "123 ABC Street",
        "ward": "Phường 1",
        "district": "Quận 1",
        "city": "Hà Nội",
        "province": "Hà Nội",
        "postal_code": "100000"
      },
      "shipping_method_id": 1,
      "payment_method_id": 1,
      "status": "confirmed",
      "payment_status": "pending",
      "shipping_status": "pending",
      "subtotal": "29990000.00",
      "tax_amount": "0.00",
      "shipping_amount": "30000.00",
      "discount_amount": "50000.00",
      "total_amount": "29970000.00",
      "currency": "VND",
      "notes": "Giao hàng giờ hành chính",
      "tracking_number": null,
      "shipped_at": null,
      "delivered_at": null,
      "created_at": "2025-01-11T05:00:00.000Z",
      "updated_at": "2025-01-11T05:00:00.000Z",
      "deleted_at": null,
      "user": {
        "id": 5,
        "name": "Nguyễn Văn A",
        "email": "customer@example.com"
      },
      "shipping_method": {
        "id": 1,
        "name": "Giao hàng nhanh",
        "code": "FAST"
      },
      "order_items": [
        {
          "id": 1,
          "order_id": 1,
          "product_id": 10,
          "product_variant_id": 1,
          "product_name": "iPhone 15 Pro",
          "product_sku": "IP15PRO-128GB-BLACK",
          "variant_name": "128GB - Đen",
          "quantity": 1,
          "unit_price": "29990000.00",
          "total_price": "29990000.00",
          "product_attributes": null,
          "product": {
            "id": 10,
            "name": "iPhone 15 Pro"
          },
          "variant": {
            "id": 1,
            "sku": "IP15PRO-128GB-BLACK",
            "name": "128GB - Đen"
          }
        }
      ],
      "payments": [
        {
          "id": 1,
          "order_id": 1,
          "payment_method_id": 1,
          "status": "pending",
          "amount": "29970000.00",
          "transaction_id": null,
          "payment_method": {
            "id": 1,
            "name": "Chuyển khoản ngân hàng",
            "code": "BANK_TRANSFER"
          }
        }
      ]
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

### 2. Lấy Chi Tiết Đơn Hàng

**Endpoint:** `GET /api/admin/orders/:id`

**Permission:** `read:orders`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `id` | number | ✅ | ID của đơn hàng |

**Response:** Tương tự như item trong danh sách, nhưng chỉ trả về 1 object trong `data`.

---

### 3. Cập Nhật Trạng Thái Đơn Hàng

**Endpoint:** `PATCH /api/admin/orders/:id/status`

**Permission:** `update:orders`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `id` | number | ✅ | ID của đơn hàng |

**Request Body:**

```json
{
  "status": "shipped",
  "notes": "Đơn hàng đã được giao cho đơn vị vận chuyển"
}
```

**Các trường bắt buộc:**
- ✅ `status` - Trạng thái đơn hàng: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`

**Các trường tùy chọn:**
- ❌ `notes` - Ghi chú (string)

**Response:**
```json
{
  "success": true,
  "message": "Cập nhật trạng thái đơn hàng thành công",
  "data": {
    "id": 1,
    "status": "shipped",
    "notes": "Đơn hàng đã được giao cho đơn vị vận chuyển",
    "shipped_at": "2025-01-11T08:00:00.000Z",
    "updated_at": "2025-01-11T08:00:00.000Z"
  }
}
```

**Lưu ý quan trọng:**
- ❌ **Không thể thay đổi trạng thái** của đơn hàng đã `cancelled` (trừ khi giữ nguyên `cancelled`)
- ❌ **Không thể thay đổi trạng thái** của đơn hàng đã `delivered` (trừ khi giữ nguyên `delivered`)
- ✅ Khi cập nhật status = `shipped`, hệ thống tự động cập nhật `shipped_at` = thời gian hiện tại
- ✅ Khi cập nhật status = `delivered`, hệ thống tự động cập nhật `delivered_at` = thời gian hiện tại

---

### 4. Cập Nhật Thông Tin Đơn Hàng

**Endpoint:** `PATCH /api/admin/orders/:id`

**Permission:** `update:orders`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `id` | number | ✅ | ID của đơn hàng |

**Request Body:**

```json
{
  "customer_name": "Nguyễn Văn B",
  "customer_email": "newemail@example.com",
  "customer_phone": "0987654321",
  "shipping_address": {
    "name": "Nguyễn Văn B",
    "phone": "0987654321",
    "address": "456 XYZ Street",
    "ward": "Phường 2",
    "district": "Quận 2",
    "city": "TP. Hồ Chí Minh",
    "province": "TP. Hồ Chí Minh",
    "postal_code": "700000"
  },
  "billing_address": {
    "name": "Nguyễn Văn B",
    "phone": "0987654321",
    "address": "456 XYZ Street",
    "ward": "Phường 2",
    "district": "Quận 2",
    "city": "TP. Hồ Chí Minh",
    "province": "TP. Hồ Chí Minh",
    "postal_code": "700000"
  },
  "shipping_method_id": 2,
  "notes": "Giao hàng buổi chiều",
  "tracking_number": "TRACK123456"
}
```

**Các trường tùy chọn (Partial Update):**
- ❌ `customer_name` - Tên khách hàng (string)
- ❌ `customer_email` - Email khách hàng (string)
- ❌ `customer_phone` - Số điện thoại khách hàng (string)
- ❌ `shipping_address` - Địa chỉ giao hàng (object JSON)
- ❌ `billing_address` - Địa chỉ thanh toán (object JSON)
- ❌ `shipping_method_id` - ID phương thức vận chuyển (number). Lấy từ API `/api/public/shipping-methods`
- ❌ `notes` - Ghi chú (string)
- ❌ `tracking_number` - Mã vận đơn (string, tối đa 100 ký tự)

**Lưu ý quan trọng:**
- ⚠️ **Chỉ có thể cập nhật** các trường `customer_name`, `customer_email`, `customer_phone`, `shipping_address`, `billing_address` khi đơn hàng có status là `pending` hoặc `confirmed`
- ✅ Các trường khác (`notes`, `tracking_number`, `shipping_method_id`) có thể cập nhật ở bất kỳ trạng thái nào (trừ `cancelled` và `delivered`)

**Response:** Trả về object đơn hàng đã cập nhật

---

## 💳 API Quản Lý Thanh Toán (Payments)

### 1. Lấy Danh Sách Thanh Toán

**Endpoint:** `GET /api/public/payments`

**Permission:** Không cần (public API, nhưng có thể filter theo user nếu có token)

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả | Ví dụ |
|---------|------|----------|-------|-------|
| `page` | number | ❌ | Số trang (mặc định: 1) | `1` |
| `limit` | number | ❌ | Số lượng mỗi trang (mặc định: 10) | `20` |
| `status` | string | ❌ | Lọc theo trạng thái: `pending`, `processing`, `completed`, `failed`, `refunded` | `"completed"` |
| `order_id` | number | ❌ | Lọc theo ID đơn hàng | `1` |
| `payment_method_id` | number | ❌ | Lọc theo phương thức thanh toán | `1` |

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách thanh toán thành công",
  "data": [
    {
      "id": 1,
      "order_id": 1,
      "payment_method_id": 1,
      "status": "completed",
      "amount": "29970000.00",
      "transaction_id": "TXN123456789",
      "payment_gateway": "vnpay",
      "paid_at": "2025-01-11T10:00:00.000Z",
      "refunded_at": null,
      "notes": "Thanh toán thành công qua VNPay",
      "created_at": "2025-01-11T09:00:00.000Z",
      "updated_at": "2025-01-11T10:00:00.000Z",
      "order": {
        "id": 1,
        "order_number": "ORD-20250111-000001",
        "total_amount": "29970000.00"
      },
      "payment_method": {
        "id": 1,
        "name": "VNPay",
        "code": "vnpay"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 100,
    "totalPages": 10
  }
}
```

---

### 2. Lấy Chi Tiết Thanh Toán

**Endpoint:** `GET /api/public/payments/:id`

**Permission:** Không cần (public API)

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `id` | number | ✅ | ID của thanh toán |

**Response:** Tương tự như item trong danh sách, nhưng chỉ trả về 1 object trong `data`.

---

### 3. Tạo Thanh Toán Mới

**Endpoint:** `POST /api/public/payments`

**Permission:** Không cần (public API)

**Request Body:**

```json
{
  "order_id": 1,
  "payment_method_id": 1,
  "amount": "29970000.00",
  "notes": "Thanh toán đơn hàng"
}
```

**Các trường bắt buộc:**
- ✅ `order_id` - ID đơn hàng (number)
- ✅ `payment_method_id` - ID phương thức thanh toán (number)
- ✅ `amount` - Số tiền thanh toán (string, decimal format)

**Các trường tùy chọn:**
- ❌ `notes` - Ghi chú (string)

**Response:**
```json
{
  "success": true,
  "message": "Tạo thanh toán thành công",
  "data": {
    "id": 1,
    "order_id": 1,
    "payment_method_id": 1,
    "status": "pending",
    "amount": "29970000.00",
    "transaction_id": null,
    "payment_gateway": null,
    "paid_at": null,
    "refunded_at": null,
    "notes": "Thanh toán đơn hàng",
    "created_at": "2025-01-11T09:00:00.000Z",
    "updated_at": "2025-01-11T09:00:00.000Z"
  }
}
```

---

### 4. Tạo Payment URL (Cho Payment Gateway)

**Endpoint:** `POST /api/public/payments/create-url`

**Permission:** Không cần (public API)

**Request Body:**

```json
{
  "order_id": 1,
  "payment_method_id": 1,
  "return_url": "https://yoursite.com/payment/return",
  "cancel_url": "https://yoursite.com/payment/cancel"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tạo payment URL thành công",
  "data": {
    "payment_id": 1,
    "payment_url": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
    "expires_at": "2025-01-11T10:00:00.000Z"
  }
}
```

---

### 5. Xác Minh Thanh Toán (Verify Payment)

**Endpoint:** `GET /api/public/payments/verify/:gateway`

**Permission:** Không cần (public API)

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `gateway` | string | ✅ | Tên gateway: `vnpay`, `momo`, `zalopay`, etc. |

**Query Parameters:**
- Các tham số từ payment gateway callback (tùy theo từng gateway)

**Response:**
```json
{
  "success": true,
  "message": "Xác minh thanh toán thành công",
  "data": {
    "payment_id": 1,
    "status": "completed",
    "transaction_id": "TXN123456789",
    "amount": "29970000.00"
  }
}
```

---

### 6. Webhook Handler (Nhận Callback từ Payment Gateway)

**Endpoint:** `POST /api/public/payments/webhook/:gateway`

**Permission:** Không cần (public API, nhưng nên có secret key validation)

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `gateway` | string | ✅ | Tên gateway: `vnpay`, `momo`, `zalopay`, etc. |

**Request Body:** Payload từ payment gateway (tùy theo từng gateway)

**Response:**
```json
{
  "success": true,
  "message": "Webhook xử lý thành công"
}
```

**Lưu ý:** Webhook này được gọi tự động bởi payment gateway, không cần gọi từ frontend.

---

## 🚚 API Quản Lý Vận Chuyển (Shipping Methods)

### 1. Lấy Danh Sách Phương Thức Vận Chuyển (Admin)

**Endpoint:** `GET /api/admin/shipping-methods`

**Permission:** `shipping-method:read`

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả | Ví dụ |
|---------|------|----------|-------|-------|
| `page` | number | ❌ | Số trang (mặc định: 1) | `1` |
| `limit` | number | ❌ | Số lượng mỗi trang (mặc định: 10) | `20` |
| `status` | string | ❌ | Lọc theo trạng thái: `active`, `inactive` | `"active"` |
| `code` | string | ❌ | Tìm kiếm theo code | `"FAST"` |

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách phương thức vận chuyển thành công",
  "data": [
    {
      "id": 1,
      "name": "Giao hàng nhanh",
      "code": "FAST",
      "description": "Giao hàng trong 2-3 ngày",
      "base_cost": "30000.00",
      "estimated_days": "2-3",
      "status": "active",
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
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

---

### 2. Lấy Danh Sách Phương Thức Vận Chuyển Đang Hoạt Động

**Endpoint:** `GET /api/admin/shipping-methods/active`

**Permission:** `shipping-method:read`

**Response:** Tương tự như trên, nhưng chỉ trả về các phương thức có `status = "active"`.

---

### 3. Lấy Chi Tiết Phương Thức Vận Chuyển

**Endpoint:** `GET /api/admin/shipping-methods/:id`

**Permission:** `shipping-method:read`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `id` | number | ✅ | ID phương thức vận chuyển |

---

### 4. Tạo Phương Thức Vận Chuyển Mới

**Endpoint:** `POST /api/admin/shipping-methods`

**Permission:** `shipping-method:create`

**Request Body:**

```json
{
  "name": "Giao hàng tiết kiệm",
  "code": "ECONOMY",
  "description": "Giao hàng trong 5-7 ngày",
  "base_cost": "20000.00",
  "estimated_days": "5-7",
  "status": "active"
}
```

**Các trường bắt buộc:**
- ✅ `name` - Tên phương thức (string)
- ✅ `code` - Mã code (string, unique)
- ✅ `base_cost` - Phí cơ bản (string, decimal format)

**Các trường tùy chọn:**
- ❌ `description` - Mô tả (string)
- ❌ `estimated_days` - Số ngày ước tính (string)
- ❌ `status` - Trạng thái: `active`, `inactive` (mặc định: `active`)

---

### 5. Cập Nhật Phương Thức Vận Chuyển

**Endpoint:** `PUT /api/admin/shipping-methods/:id`

**Permission:** `shipping-method:update`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `id` | number | ✅ | ID phương thức vận chuyển |

**Request Body:** Tương tự như tạo mới, tất cả fields đều optional (partial update).

---

### 6. Xóa Phương Thức Vận Chuyển

**Endpoint:** `DELETE /api/admin/shipping-methods/:id`

**Permission:** `shipping-method:delete`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `id` | number | ✅ | ID phương thức vận chuyển |

**Lưu ý:** Xóa mềm (soft delete), có thể khôi phục bằng API restore.

---

### 7. Khôi Phục Phương Thức Vận Chuyển

**Endpoint:** `PUT /api/admin/shipping-methods/:id/restore`

**Permission:** `shipping-method:update`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `id` | number | ✅ | ID phương thức vận chuyển |

---

## 💰 API Quản Lý Phương Thức Thanh Toán (Payment Methods)

### 1. Lấy Danh Sách Phương Thức Thanh Toán (Admin)

**Endpoint:** `GET /api/admin/payment-methods`

**Permission:** `payment-method:read`

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả | Ví dụ |
|---------|------|----------|-------|-------|
| `page` | number | ❌ | Số trang (mặc định: 1) | `1` |
| `limit` | number | ❌ | Số lượng mỗi trang (mặc định: 10) | `20` |
| `is_active` | boolean | ❌ | Lọc theo trạng thái hoạt động | `true` |
| `code` | string | ❌ | Tìm kiếm theo code | `"vnpay"` |

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách phương thức thanh toán thành công",
  "data": [
    {
      "id": 1,
      "name": "VNPay",
      "code": "vnpay",
      "description": "Thanh toán qua VNPay",
      "is_active": true,
      "display_order": 1,
      "icon": "https://example.com/vnpay-icon.png",
      "config": {
        "tmn_code": "YOUR_TMN_CODE",
        "hash_secret": "YOUR_HASH_SECRET"
      },
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
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

---

### 2. Lấy Chi Tiết Phương Thức Thanh Toán

**Endpoint:** `GET /api/admin/payment-methods/:id`

**Permission:** `payment-method:read`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `id` | number | ✅ | ID phương thức thanh toán |

---

### 3. Tạo Phương Thức Thanh Toán Mới

**Endpoint:** `POST /api/admin/payment-methods`

**Permission:** `payment-method:create`

**Request Body:**

```json
{
  "name": "MoMo",
  "code": "momo",
  "description": "Thanh toán qua ví MoMo",
  "is_active": true,
  "display_order": 2,
  "icon": "https://example.com/momo-icon.png",
  "config": {
    "partner_code": "MOMO_PARTNER",
    "access_key": "YOUR_ACCESS_KEY",
    "secret_key": "YOUR_SECRET_KEY"
  }
}
```

**Các trường bắt buộc:**
- ✅ `name` - Tên phương thức (string)
- ✅ `code` - Mã code (string, unique, lowercase, underscore)

**Các trường tùy chọn:**
- ❌ `description` - Mô tả (string)
- ❌ `is_active` - Trạng thái hoạt động (boolean, mặc định: `true`)
- ❌ `display_order` - Thứ tự hiển thị (number)
- ❌ `icon` - URL icon (string)
- ❌ `config` - Cấu hình JSON (object, tùy theo từng phương thức)

---

### 4. Cập Nhật Phương Thức Thanh Toán

**Endpoint:** `PUT /api/admin/payment-methods/:id`

**Permission:** `payment-method:update`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `id` | number | ✅ | ID phương thức thanh toán |

**Request Body:** Tương tự như tạo mới, tất cả fields đều optional (partial update).

---

### 5. Xóa Phương Thức Thanh Toán

**Endpoint:** `DELETE /api/admin/payment-methods/:id`

**Permission:** `payment-method:delete`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `id` | number | ✅ | ID phương thức thanh toán |

**Lưu ý:** Xóa mềm (soft delete), có thể khôi phục bằng API restore.

---

### 6. Khôi Phục Phương Thức Thanh Toán

**Endpoint:** `PUT /api/admin/payment-methods/:id/restore`

**Permission:** `payment-method:update`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `id` | number | ✅ | ID phương thức thanh toán |

---

## 🔄 Quy Trình Xử Lý Đơn Hàng

### 1. Quy Trình Đơn Hàng Chuẩn

```
1. Khách hàng đặt hàng (Public API)
   ↓
2. Đơn hàng được tạo với status = "pending"
   ↓
3. Admin xác nhận đơn hàng (status = "confirmed")
   ↓
4. Admin xử lý đơn hàng (status = "processing")
   ↓
5. Admin giao hàng (status = "shipped")
   - Tự động cập nhật shipped_at
   - Có thể cập nhật tracking_number
   ↓
6. Đơn hàng được giao thành công (status = "delivered")
   - Tự động cập nhật delivered_at
```

---

### 2. Quy Trình Thanh Toán

```
1. Đơn hàng được tạo → Payment tự động được tạo với status = "pending"
   ↓
2. Khách hàng chọn phương thức thanh toán
   ↓
3a. Nếu thanh toán online (VNPay, MoMo, etc.):
    - Tạo payment URL
    - Redirect khách hàng đến payment gateway
    - Payment gateway callback → Webhook
    - Cập nhật payment status = "completed"
    - Tự động cập nhật order.payment_status = "paid"
    
3b. Nếu thanh toán chuyển khoản:
    - Admin xác nhận đã nhận tiền
    - Cập nhật payment status = "completed" (qua Payment API)
    - Tự động cập nhật order.payment_status = "paid"
    
3c. Nếu COD (Cash on Delivery):
    - Thanh toán khi nhận hàng
    - Admin cập nhật payment status = "completed" sau khi giao hàng
```

---

### 3. Quy Trình Vận Chuyển

```
1. Đơn hàng được xác nhận (status = "confirmed")
   → shipping_status = "pending"
   ↓
2. Admin chuẩn bị hàng
   → shipping_status = "preparing" (tự động hoặc thủ công)
   ↓
3. Admin giao hàng cho đơn vị vận chuyển
   → status = "shipped"
   → shipping_status = "shipped"
   → Tự động cập nhật shipped_at
   → Cập nhật tracking_number
   ↓
4. Đơn hàng được giao thành công
   → status = "delivered"
   → shipping_status = "delivered"
   → Tự động cập nhật delivered_at
   
5. Trường hợp trả hàng:
   → shipping_status = "returned"
   → Có thể cập nhật payment_status = "refunded"
```

---

### 4. Quy Trình Hủy Đơn Hàng

```
1. Admin hoặc khách hàng yêu cầu hủy
   ↓
2. Kiểm tra trạng thái đơn hàng:
   - Nếu status = "pending" hoặc "confirmed" → Có thể hủy
   - Nếu status = "shipped" hoặc "delivered" → Không thể hủy
   ↓
3. Cập nhật status = "cancelled"
   ↓
4. Nếu đã thanh toán → Xử lý hoàn tiền:
   - Tạo refund payment
   - Cập nhật payment status = "refunded"
   - Cập nhật order.payment_status = "refunded"
```

---

### 5. Quy Trình Hoàn Tiền

```
1. Xác định lý do hoàn tiền:
   - Hủy đơn hàng
   - Trả hàng
   - Lỗi sản phẩm
   ↓
2. Tạo refund payment:
   - order_id: ID đơn hàng
   - payment_method_id: Phương thức hoàn tiền
   - amount: Số tiền hoàn (có thể một phần)
   - status: "refunded"
   ↓
3. Cập nhật payment gốc:
   - Nếu hoàn toàn bộ: status = "refunded"
   - Nếu hoàn một phần: status = "refunded" (cần tạo payment mới cho phần còn lại)
   ↓
4. Cập nhật order.payment_status:
   - Nếu hoàn toàn bộ: "refunded"
   - Nếu hoàn một phần: "partially_refunded"
```

---

## 🔗 Các API Liên Quan

## 📊 Cấu Trúc Dữ Liệu Chi Tiết

### Đơn Hàng (Order)

**Giải thích các trường:**

| Trường | Kiểu | Bắt buộc | Tự động sinh | Mô tả | Ghi chú |
|--------|------|----------|--------------|-------|---------|
| `id` | number | ✅ | ✅ | ID đơn hàng | **Tự động sinh**, chỉ đọc |
| `order_number` | string | ✅ | ✅ | Số đơn hàng (duy nhất) | **Tự động sinh** khi tạo đơn, format: `ORD-YYYYMMDD-XXXXXX` |
| `user_id` | number \| null | ✅ | ❌ | ID người dùng (nếu có đăng nhập) | Có thể null nếu khách hàng không đăng nhập |
| `customer_name` | string | ✅ | ❌ | Tên khách hàng | **Bắt buộc**, tối đa 255 ký tự. Chỉ có thể sửa khi status = `pending` hoặc `confirmed` |
| `customer_email` | string | ✅ | ❌ | Email khách hàng | **Bắt buộc**, tối đa 255 ký tự. Chỉ có thể sửa khi status = `pending` hoặc `confirmed` |
| `customer_phone` | string | ✅ | ❌ | Số điện thoại khách hàng | **Bắt buộc**, tối đa 20 ký tự. Chỉ có thể sửa khi status = `pending` hoặc `confirmed` |
| `shipping_address` | object (JSON) | ✅ | ❌ | Địa chỉ giao hàng | **Bắt buộc**, object JSON. Chỉ có thể sửa khi status = `pending` hoặc `confirmed` |
| `billing_address` | object (JSON) | ✅ | ❌ | Địa chỉ thanh toán | **Bắt buộc**, object JSON. Chỉ có thể sửa khi status = `pending` hoặc `confirmed` |
| `shipping_method_id` | number \| null | ✅ | ❌ | ID phương thức vận chuyển | Có thể null. Lấy từ API `/api/public/shipping-methods` |
| `payment_method_id` | number \| null | ✅ | ❌ | ID phương thức thanh toán | Có thể null. Lấy từ API `/api/payment-methods` |
| `status` | enum | ✅ | ✅ | Trạng thái đơn hàng | **Tự động sinh** mặc định `pending`. Giá trị: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled` |
| `payment_status` | enum | ✅ | ✅ | Trạng thái thanh toán | **Tự động sinh** mặc định `pending`. Giá trị: `pending`, `paid`, `failed`, `refunded`, `partially_refunded`. **Không thể cập nhật trực tiếp qua Order API** |
| `shipping_status` | enum | ✅ | ✅ | Trạng thái vận chuyển | **Tự động sinh** mặc định `pending`. Giá trị: `pending`, `preparing`, `shipped`, `delivered`, `returned`. **Không thể cập nhật trực tiếp qua Order API** |
| `subtotal` | string (decimal) | ✅ | ❌ | Tổng tiền sản phẩm | **Bắt buộc**, format: `"29990000.00"` |
| `tax_amount` | string (decimal) | ✅ | ✅ | Thuế | **Tự động sinh** mặc định `"0.00"` |
| `shipping_amount` | string (decimal) | ✅ | ✅ | Phí vận chuyển | **Tự động sinh** mặc định `"0.00"` |
| `discount_amount` | string (decimal) | ✅ | ✅ | Giảm giá | **Tự động sinh** mặc định `"0.00"` |
| `total_amount` | string (decimal) | ✅ | ❌ | Tổng tiền thanh toán | **Bắt buộc**, format: `"29970000.00"` |
| `currency` | string | ✅ | ✅ | Loại tiền tệ | **Tự động sinh** mặc định `"VND"` |
| `notes` | string \| null | ❌ | ❌ | Ghi chú từ khách hàng | Tùy chọn, có thể cập nhật |
| `tracking_number` | string \| null | ❌ | ❌ | Mã vận đơn | Tùy chọn, tối đa 100 ký tự, có thể cập nhật |
| `shipped_at` | datetime \| null | ✅ | ✅ | Thời gian giao hàng | **Tự động cập nhật** khi status = `shipped` |
| `delivered_at` | datetime \| null | ✅ | ✅ | Thời gian giao thành công | **Tự động cập nhật** khi status = `delivered` |
| `created_at` | datetime | ✅ | ✅ | Ngày tạo | **Tự động sinh**, chỉ đọc |
| `updated_at` | datetime | ✅ | ✅ | Ngày cập nhật | **Tự động sinh**, chỉ đọc |
| `deleted_at` | datetime \| null | ✅ | ✅ | Ngày xóa (soft delete) | **Tự động sinh**, chỉ đọc |

**Quan hệ (Relations):**

| Quan hệ | Kiểu | Mô tả |
|---------|------|-------|
| `user` | object \| null | Thông tin người dùng (nếu có đăng nhập). Lấy từ bảng `users` |
| `shipping_method` | object \| null | Thông tin phương thức vận chuyển. Lấy từ bảng `shipping_methods` |
| `order_items` | array | Danh sách sản phẩm trong đơn hàng |
| `payments` | array | Danh sách thanh toán của đơn hàng |

---

### Đơn Hàng Chi Tiết (Order Item)

**Giải thích các trường:**

| Trường | Kiểu | Bắt buộc | Tự động sinh | Mô tả | Ghi chú |
|--------|------|----------|--------------|-------|---------|
| `id` | number | ✅ | ✅ | ID chi tiết đơn hàng | **Tự động sinh**, chỉ đọc |
| `order_id` | number | ✅ | ✅ | ID đơn hàng | **Tự động sinh** khi tạo đơn |
| `product_id` | number | ✅ | ❌ | ID sản phẩm | **Bắt buộc**. Lấy từ API `/api/admin/products` |
| `product_variant_id` | number \| null | ✅ | ❌ | ID biến thể sản phẩm | Có thể null. Lấy từ API `/api/admin/product-variants` |
| `product_name` | string | ✅ | ❌ | Tên sản phẩm (snapshot) | **Bắt buộc**, tối đa 255 ký tự. Lưu snapshot tại thời điểm đặt hàng |
| `product_sku` | string | ✅ | ❌ | Mã SKU sản phẩm (snapshot) | **Bắt buộc**, tối đa 100 ký tự. Lưu snapshot tại thời điểm đặt hàng |
| `variant_name` | string \| null | ✅ | ❌ | Tên biến thể (snapshot) | Có thể null, tối đa 255 ký tự. Lưu snapshot tại thời điểm đặt hàng |
| `quantity` | number | ✅ | ❌ | Số lượng | **Bắt buộc**, số >= 1 |
| `unit_price` | string (decimal) | ✅ | ❌ | Giá đơn vị (snapshot) | **Bắt buộc**, format: `"29990000.00"`. Lưu snapshot tại thời điểm đặt hàng |
| `total_price` | string (decimal) | ✅ | ❌ | Tổng tiền (snapshot) | **Bắt buộc**, format: `"29990000.00"`. Lưu snapshot tại thời điểm đặt hàng |
| `product_attributes` | object (JSON) \| null | ❌ | ❌ | Thuộc tính sản phẩm (snapshot) | Object JSON, lưu snapshot tại thời điểm đặt hàng |
| `created_at` | datetime | ✅ | ✅ | Ngày tạo | **Tự động sinh**, chỉ đọc |
| `updated_at` | datetime | ✅ | ✅ | Ngày cập nhật | **Tự động sinh**, chỉ đọc |

**Quan hệ (Relations):**

| Quan hệ | Kiểu | Mô tả |
|---------|------|-------|
| `product` | object | Thông tin sản phẩm. Lấy từ bảng `products` |
| `variant` | object \| null | Thông tin biến thể sản phẩm. Lấy từ bảng `product_variants` |

**Lưu ý quan trọng:**
- ⚠️ **Không thể sửa/xóa** order items sau khi đơn hàng đã được tạo
- 📸 Tất cả thông tin sản phẩm (`product_name`, `product_sku`, `variant_name`, `unit_price`, `total_price`) là **snapshot** tại thời điểm đặt hàng, không thay đổi theo sản phẩm hiện tại

---

### Thanh Toán (Payment)

**Giải thích các trường:**

| Trường | Kiểu | Bắt buộc | Tự động sinh | Mô tả | Ghi chú |
|--------|------|----------|--------------|-------|---------|
| `id` | number | ✅ | ✅ | ID thanh toán | **Tự động sinh**, chỉ đọc |
| `order_id` | number | ✅ | ❌ | ID đơn hàng | **Bắt buộc**. Liên kết với bảng `orders` |
| `payment_method_id` | number | ✅ | ❌ | ID phương thức thanh toán | **Bắt buộc**. Liên kết với bảng `payment_methods` |
| `status` | enum | ✅ | ✅ | Trạng thái thanh toán | **Tự động sinh** mặc định `pending`. Giá trị: `pending`, `processing`, `completed`, `failed`, `refunded` |
| `amount` | string (decimal) | ✅ | ❌ | Số tiền thanh toán | **Bắt buộc**, format: `"29970000.00"` |
| `transaction_id` | string \| null | ❌ | ❌ | Mã giao dịch từ payment gateway | Tùy chọn, tối đa 255 ký tự. Được cập nhật khi thanh toán thành công |
| `payment_gateway` | string \| null | ❌ | ❌ | Tên payment gateway | Tùy chọn, tối đa 100 ký tự. Ví dụ: `"vnpay"`, `"momo"` |
| `paid_at` | datetime \| null | ✅ | ✅ | Thời gian thanh toán | **Tự động cập nhật** khi status = `completed` |
| `refunded_at` | datetime \| null | ✅ | ✅ | Thời gian hoàn tiền | **Tự động cập nhật** khi status = `refunded` |
| `notes` | string \| null | ❌ | ❌ | Ghi chú | Tùy chọn |
| `created_at` | datetime | ✅ | ✅ | Ngày tạo | **Tự động sinh**, chỉ đọc |
| `updated_at` | datetime | ✅ | ✅ | Ngày cập nhật | **Tự động sinh**, chỉ đọc |

**Quan hệ (Relations):**

| Quan hệ | Kiểu | Mô tả |
|---------|------|-------|
| `order` | object | Thông tin đơn hàng. Lấy từ bảng `orders` |
| `payment_method` | object | Thông tin phương thức thanh toán. Lấy từ bảng `payment_methods` |

**Lưu ý quan trọng:**
- 💳 Một đơn hàng có thể có nhiều payment (ví dụ: thanh toán một phần, hoàn tiền)
- 🔄 Khi payment status = `completed`, hệ thống tự động cập nhật `order.payment_status = "paid"`
- 🔄 Khi payment status = `refunded`, hệ thống tự động cập nhật `order.payment_status = "refunded"` hoặc `"partially_refunded"`

---

### Phương Thức Vận Chuyển (Shipping Method)

**Giải thích các trường:**

| Trường | Kiểu | Bắt buộc | Tự động sinh | Mô tả | Ghi chú |
|--------|------|----------|--------------|-------|---------|
| `id` | number | ✅ | ✅ | ID phương thức vận chuyển | **Tự động sinh**, chỉ đọc |
| `name` | string | ✅ | ❌ | Tên phương thức | **Bắt buộc**, tối đa 255 ký tự |
| `code` | string | ✅ | ❌ | Mã code (unique) | **Bắt buộc**, tối đa 50 ký tự, unique |
| `description` | string \| null | ❌ | ❌ | Mô tả | Tùy chọn |
| `base_cost` | string (decimal) | ✅ | ❌ | Phí cơ bản | **Bắt buộc**, format: `"30000.00"` |
| `estimated_days` | string \| null | ❌ | ❌ | Số ngày ước tính | Tùy chọn, ví dụ: `"2-3"` |
| `status` | enum | ✅ | ✅ | Trạng thái | **Tự động sinh** mặc định `active`. Giá trị: `active`, `inactive` |
| `created_at` | datetime | ✅ | ✅ | Ngày tạo | **Tự động sinh**, chỉ đọc |
| `updated_at` | datetime | ✅ | ✅ | Ngày cập nhật | **Tự động sinh**, chỉ đọc |
| `deleted_at` | datetime \| null | ✅ | ✅ | Ngày xóa (soft delete) | **Tự động sinh**, chỉ đọc |

---

### Phương Thức Thanh Toán (Payment Method)

**Giải thích các trường:**

| Trường | Kiểu | Bắt buộc | Tự động sinh | Mô tả | Ghi chú |
|--------|------|----------|--------------|-------|---------|
| `id` | number | ✅ | ✅ | ID phương thức thanh toán | **Tự động sinh**, chỉ đọc |
| `name` | string | ✅ | ❌ | Tên phương thức | **Bắt buộc**, tối đa 255 ký tự |
| `code` | string | ✅ | ❌ | Mã code (unique) | **Bắt buộc**, tối đa 50 ký tự, unique, lowercase, underscore |
| `description` | string \| null | ❌ | ❌ | Mô tả | Tùy chọn |
| `is_active` | boolean | ✅ | ✅ | Trạng thái hoạt động | **Tự động sinh** mặc định `true` |
| `display_order` | number | ❌ | ✅ | Thứ tự hiển thị | Tự động sinh, mặc định 0 |
| `icon` | string \| null | ❌ | ❌ | URL icon | Tùy chọn |
| `config` | object (JSON) \| null | ❌ | ❌ | Cấu hình | Object JSON, tùy theo từng phương thức |
| `created_at` | datetime | ✅ | ✅ | Ngày tạo | **Tự động sinh**, chỉ đọc |
| `updated_at` | datetime | ✅ | ✅ | Ngày cập nhật | **Tự động sinh**, chỉ đọc |
| `deleted_at` | datetime \| null | ✅ | ✅ | Ngày xóa (soft delete) | **Tự động sinh**, chỉ đọc |

**Các mã phương thức thanh toán phổ biến:**
- `bank_transfer` - Chuyển khoản ngân hàng
- `vnpay` - VNPay
- `momo` - MoMo
- `zalopay` - ZaloPay
- `cod` - Thu tiền khi nhận hàng (Cash on Delivery)
- `credit_card` - Thẻ tín dụng
- `debit_card` - Thẻ ghi nợ

---

## 📝 Các Trạng Thái

### Trạng Thái Đơn Hàng (Order Status)

| Giá trị | Mã | Mô tả | Có thể chuyển sang |
|---------|-----|-------|-------------------|
| Chờ xử lý | `pending` | Đơn hàng mới tạo, chờ xử lý | `confirmed`, `cancelled` |
| Đã xác nhận | `confirmed` | Đơn hàng đã được xác nhận | `processing`, `cancelled` |
| Đang xử lý | `processing` | Đơn hàng đang được xử lý/đóng gói | `shipped`, `cancelled` |
| Đã giao hàng | `shipped` | Đơn hàng đã được giao cho đơn vị vận chuyển | `delivered` |
| Đã giao thành công | `delivered` | Đơn hàng đã được giao thành công | ❌ Không thể thay đổi |
| Đã hủy | `cancelled` | Đơn hàng đã bị hủy | ❌ Không thể thay đổi |

**Lưu ý:**
- ❌ Không thể chuyển từ `cancelled` sang bất kỳ trạng thái nào khác
- ❌ Không thể chuyển từ `delivered` sang bất kỳ trạng thái nào khác
- ✅ Khi chuyển sang `shipped`, hệ thống tự động cập nhật `shipped_at`
- ✅ Khi chuyển sang `delivered`, hệ thống tự động cập nhật `delivered_at`

---

### Trạng Thái Thanh Toán (Payment Status)

| Giá trị | Mã | Mô tả |
|---------|-----|-------|
| Chờ thanh toán | `pending` | Chờ khách hàng thanh toán |
| Đã thanh toán | `paid` | Đã thanh toán thành công |
| Thanh toán thất bại | `failed` | Thanh toán thất bại |
| Đã hoàn tiền | `refunded` | Đã hoàn tiền toàn bộ |
| Hoàn tiền một phần | `partially_refunded` | Đã hoàn tiền một phần |

**Lưu ý:**
- ⚠️ **Không thể cập nhật trực tiếp** qua Order API
- ✅ Phải sử dụng Payment API để cập nhật trạng thái thanh toán

---

### Trạng Thái Vận Chuyển (Shipping Status)

| Giá trị | Mã | Mô tả |
|---------|-----|-------|
| Chờ xử lý | `pending` | Chờ xử lý vận chuyển |
| Đang chuẩn bị hàng | `preparing` | Đang chuẩn bị hàng |
| Đã giao cho đơn vị vận chuyển | `shipped` | Đã giao cho đơn vị vận chuyển |
| Đã giao hàng thành công | `delivered` | Đã giao hàng thành công |
| Hàng bị trả lại | `returned` | Hàng bị trả lại |

**Lưu ý:**
- ⚠️ **Không thể cập nhật trực tiếp** qua Order API
- ✅ Thường được cập nhật tự động theo `status` của đơn hàng

---

## 🔗 Các API Liên Quan

### 1. Lấy Danh Sách Phương Thức Vận Chuyển

**Endpoint:** `GET /api/public/shipping-methods`

**Mục đích:** Lấy danh sách phương thức vận chuyển để chọn cho `shipping_method_id` trong Order

**Query Parameters:**
- `page`, `limit`, `status`, `sortBy`, `sortOrder`

**Response:** Danh sách shipping methods với các trường: `id`, `name`, `code`, `description`, `base_cost`, `status`, ...

---

### 2. Lấy Danh Sách Phương Thức Thanh Toán

**Endpoint:** `GET /api/payment-methods`

**Mục đích:** Lấy danh sách phương thức thanh toán để hiển thị trong đơn hàng

**Query Parameters:**
- `page`, `limit`, `status`, `sortBy`, `sortOrder`

**Response:** Danh sách payment methods với các trường: `id`, `name`, `code`, `description`, `status`, ...

---

### 3. Lấy Danh Sách Người Dùng

**Endpoint:** `GET /api/admin/users` hoặc `GET /api/admin/customers`

**Mục đích:** Lấy danh sách người dùng/khách hàng để hiển thị thông tin trong đơn hàng

**Query Parameters:**
- `page`, `limit`, `search`, `status`, `sortBy`, `sortOrder`

**Response:** Danh sách users với các trường: `id`, `name`, `email`, `phone`, `status`, ...

---

### 4. Lấy Danh Sách Sản Phẩm

**Endpoint:** `GET /api/admin/products`

**Mục đích:** Lấy danh sách sản phẩm để hiển thị thông tin trong order items

**Query Parameters:**
- `page`, `limit`, `search`, `status`, `category_id`, `sortBy`, `sortOrder`

**Response:** Danh sách products với các trường: `id`, `name`, `slug`, `price`, `status`, ...

---

### 5. Lấy Danh Sách Biến Thể Sản Phẩm

**Endpoint:** `GET /api/admin/product-variants`

**Mục đích:** Lấy danh sách biến thể sản phẩm để hiển thị thông tin trong order items

**Query Parameters:**
- `page`, `limit`, `search`, `product_id`, `status`, `sortBy`, `sortOrder`

**Response:** Danh sách product variants với các trường: `id`, `sku`, `name`, `product_id`, `price`, ...

---

## 📝 Tóm Tắt Các Trường Tự Động Sinh (Không Cần Hiển Thị Ở Form)

### Order:
- ✅ `id` - Tự động sinh khi tạo mới
- ✅ `order_number` - Tự động sinh khi tạo mới (format: `ORD-YYYYMMDD-XXXXXX`)
- ✅ `status` - Mặc định `pending` khi tạo mới
- ✅ `payment_status` - Mặc định `pending` khi tạo mới
- ✅ `shipping_status` - Mặc định `pending` khi tạo mới
- ✅ `tax_amount` - Mặc định `"0.00"` khi tạo mới
- ✅ `shipping_amount` - Mặc định `"0.00"` khi tạo mới (có thể tính tự động theo shipping method)
- ✅ `discount_amount` - Mặc định `"0.00"` khi tạo mới
- ✅ `currency` - Mặc định `"VND"` khi tạo mới
- ✅ `shipped_at` - Tự động cập nhật khi status = `shipped`
- ✅ `delivered_at` - Tự động cập nhật khi status = `delivered`
- ✅ `created_at` - Tự động sinh
- ✅ `updated_at` - Tự động sinh
- ✅ `deleted_at` - null (chỉ có khi soft delete)

### Order Item:
- ✅ `id` - Tự động sinh khi tạo mới
- ✅ `order_id` - Tự động gán khi tạo mới
- ✅ `created_at` - Tự động sinh
- ✅ `updated_at` - Tự động sinh

---

## ⚠️ Lưu Ý Quan Trọng

### 1. Validation và Quy Tắc Nghiệp Vụ

**Trạng thái đơn hàng:**
- ❌ Không thể thay đổi trạng thái của đơn hàng đã `cancelled`
- ❌ Không thể thay đổi trạng thái của đơn hàng đã `delivered`
- ✅ Khi cập nhật status = `shipped`, tự động cập nhật `shipped_at`
- ✅ Khi cập nhật status = `delivered`, tự động cập nhật `delivered_at`

**Cập nhật thông tin:**
- ⚠️ Chỉ có thể cập nhật `customer_name`, `customer_email`, `customer_phone`, `shipping_address`, `billing_address` khi đơn hàng có status là `pending` hoặc `confirmed`
- ✅ Có thể cập nhật `notes`, `tracking_number`, `shipping_method_id` ở bất kỳ trạng thái nào (trừ `cancelled` và `delivered`)

**Order Items:**
- ❌ **Không thể sửa/xóa** order items sau khi đơn hàng đã được tạo
- 📸 Thông tin sản phẩm trong order items là **snapshot** tại thời điểm đặt hàng

### 2. Permissions

- Đảm bảo user có đủ quyền trước khi gọi API:
  - `read:orders` - Để xem danh sách và chi tiết đơn hàng
  - `update:orders` - Để cập nhật trạng thái và thông tin đơn hàng
- Nếu thiếu quyền, API sẽ trả về `403 Forbidden`

### 3. Error Handling

- Luôn kiểm tra `success` trong response
- Xử lý các mã lỗi:
  - `400 Bad Request` - Dữ liệu không hợp lệ
  - `401 Unauthorized` - Chưa đăng nhập
  - `403 Forbidden` - Không có quyền truy cập
  - `404 Not Found` - Đơn hàng không tồn tại
  - `409 Conflict` - Không thể cập nhật trạng thái (ví dụ: đơn hàng đã cancelled)
  - `422 Validation Error` - Dữ liệu validation không đúng
  - `500 Internal Server Error` - Lỗi server

### 4. Data Relationships

- `shipping_method_id` phải tồn tại trong bảng `shipping_methods`
- `payment_method_id` phải tồn tại trong bảng `payment_methods`
- `product_id` và `product_variant_id` trong order items phải tồn tại
- `user_id` có thể null (khách hàng không đăng nhập)

### 5. Format Dữ Liệu

- **Số tiền (decimal):** Tất cả các trường tiền tệ (`subtotal`, `tax_amount`, `shipping_amount`, `discount_amount`, `total_amount`, `unit_price`, `total_price`) đều là **string** format decimal với 2 chữ số thập phân, ví dụ: `"29990000.00"`
- **Ngày giờ:** Tất cả các trường datetime (`created_at`, `updated_at`, `shipped_at`, `delivered_at`) đều là ISO 8601 format, ví dụ: `"2025-01-11T08:00:00.000Z"`
- **JSON Fields:** Các trường JSON (`shipping_address`, `billing_address`, `product_attributes`) là object/array JSON

### 6. Pagination

- Sử dụng `page` và `limit` để phân trang
- Response có `meta` object chứa thông tin phân trang:
  - `page` - Trang hiện tại
  - `limit` - Số lượng mỗi trang
  - `totalItems` - Tổng số items
  - `totalPages` - Tổng số trang
  - `hasNextPage` - Có trang tiếp theo không
  - `hasPreviousPage` - Có trang trước không

### 7. Các Trường Hợp Đặc Biệt

**Hủy đơn hàng:**
- Chỉ có thể hủy khi status = `pending` hoặc `confirmed`
- Khi hủy, cần xử lý hoàn tiền nếu đã thanh toán
- Sau khi hủy, không thể thay đổi trạng thái

**Hoàn tiền:**
- Có thể hoàn toàn bộ hoặc một phần
- Tạo payment mới với status = `refunded`
- Cập nhật order.payment_status tương ứng

**Trả hàng:**
- Cập nhật shipping_status = `returned`
- Có thể kết hợp với hoàn tiền
- Cần xử lý inventory nếu có

**Thanh toán thất bại:**
- Payment status = `failed`
- Order payment_status vẫn = `pending`
- Có thể tạo payment mới để thử lại

**Thanh toán một phần:**
- Một đơn hàng có thể có nhiều payment
- Tổng số tiền các payment có thể nhỏ hơn total_amount (nếu có giảm giá sau)
- Order payment_status = `paid` khi tổng payment >= total_amount

### 8. Best Practices

**Xử lý đơn hàng:**
- Luôn kiểm tra trạng thái trước khi cập nhật
- Ghi log các thay đổi quan trọng
- Thông báo khách hàng khi có thay đổi trạng thái

**Xử lý thanh toán:**
- Luôn verify payment từ gateway trước khi cập nhật status
- Lưu transaction_id để tra cứu sau
- Xử lý webhook một cách an toàn (validate signature)

**Xử lý vận chuyển:**
- Cập nhật tracking_number ngay khi có
- Thông báo khách hàng khi đơn hàng được giao
- Xử lý trả hàng kịp thời

**Error Handling:**
- Luôn kiểm tra `success` trong response
- Xử lý các lỗi validation
- Retry logic cho các API quan trọng
- Logging đầy đủ cho debugging

---

## 📞 Hỗ Trợ

Nếu có thắc mắc hoặc cần hỗ trợ, vui lòng liên hệ team Backend.

---

---

## 📚 Tài Liệu Tham Khảo

- [Admin Payment Methods API](../../payment-method/admin/payment-method.md)
- [Public Payment Methods API](../../payment-method/public/payment-method.md)
- [Public Payment API](../public/payment.md)
- [Public Shipping Methods API](../public/shipping-method.md)
- [Database Schema - Orders](../../../database_schema/orders.md)
- [Database Schema - Payments](../../../database_schema/payments.md)
- [Database Schema - Shipping Methods](../../../database_schema/shipping-methods.md)
- [Database Schema - Payment Methods](../../../database_schema/payment-methods.md)

---

**Cập nhật lần cuối:** 2025-12-06

