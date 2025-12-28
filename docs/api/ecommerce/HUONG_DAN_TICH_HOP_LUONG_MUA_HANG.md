# HƯỚNG DẪN TÍCH HỢP LUỒNG MUA HÀNG

Tài liệu hướng dẫn chi tiết tích hợp luồng mua hàng cho Frontend, bao gồm:
- **Luồng người dùng**: Xem sản phẩm → Thêm giỏ hàng → Đặt hàng → Thanh toán → Theo dõi đơn hàng
- **Luồng admin**: Xem đơn hàng → Xử lý đơn hàng → Cập nhật trạng thái → Xử lý thanh toán

---

## 📋 MỤC LỤC

1. [Tổng quan hệ thống](#tổng-quan-hệ-thống)
2. [Cấu trúc API](#cấu-trúc-api)
3. [Luồng người dùng mua hàng](#luồng-người-dùng-mua-hàng)
4. [Luồng admin xử lý đơn hàng](#luồng-admin-xử-lý-đơn-hàng)
5. [Các trạng thái đơn hàng](#các-trạng-thái-đơn-hàng)
6. [Chi tiết API endpoints](#chi-tiết-api-endpoints)
7. [Xử lý lỗi](#xử-lý-lỗi)

---

## 🔧 TỔNG QUAN HỆ THỐNG

### Base URLs
- **Public API**: `http://localhost:8000/api/public`
- **Admin API**: `http://localhost:8000/api/admin`

### Authentication

**Public APIs (Người dùng):**
- Không bắt buộc authentication (hỗ trợ cả guest và logged-in users)
- Nếu có JWT token, gửi trong header: `Authorization: Bearer YOUR_JWT_TOKEN`
- Hệ thống tự động nhận diện user từ JWT token

**Admin APIs:**
- Bắt buộc authentication với JWT token
- Header: `Authorization: Bearer ADMIN_JWT_TOKEN`
- Yêu cầu các permissions tương ứng

### Headers mặc định
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN (optional cho public, required cho admin)
```

---

## 📊 CẤU TRÚC API

### 1. Cart Management (Giỏ hàng)
- Base: `/api/public/cart`
- Hỗ trợ: Guest users (dùng `cart_uuid`) và Logged-in users (tự động dùng `user_id`)

### 2. Orders (Đơn hàng)
- Base Public: `/api/public/orders`
- Base Admin: `/api/admin/orders`

### 3. Payments (Thanh toán)
- Base: `/api/public/payments`

### 4. Discounts (Khuyến mãi/Mã giảm giá)
- Base: `/api/public/discounts`

### 5. Shipping Methods (Phương thức vận chuyển)
- Base: `/api/public/shipping-methods`

### 6. Payment Methods (Phương thức thanh toán)
- Base: `/api/public/payment-methods`

---

## 🛒 LUỒNG NGƯỜI DÙNG MUA HÀNG

### Tổng quan luồng

```
1. Xem sản phẩm
   ↓
2. Thêm vào giỏ hàng
   ↓
3. Xem giỏ hàng
   ↓
4. Cập nhật giỏ hàng (số lượng, xóa items)
   ↓
5. Áp dụng mã giảm giá (nếu có)
   ↓
6. Xem phương thức vận chuyển & tính phí
   ↓
7. Xem phương thức thanh toán
   ↓
8. Đặt hàng (tạo order từ cart)
   ↓
9. Thanh toán (nếu cần - redirect đến payment gateway hoặc COD)
   ↓
10. Xác nhận thanh toán
   ↓
11. Theo dõi đơn hàng
   ↓
12. Nhận hàng & hoàn thành
```

---

### BƯỚC 1: XEM SẢN PHẨM

#### 1.1. Lấy danh sách sản phẩm

**Endpoint:** `GET /api/public/products`

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| page | number | Không | Số trang (mặc định: 1) |
| limit | number | Không | Số sản phẩm mỗi trang (mặc định: 10) |
| category_id | number | Không | Lọc theo danh mục |
| search | string | Không | Tìm kiếm theo tên |
| min_price | number | Không | Giá tối thiểu |
| max_price | number | Không | Giá tối đa |
| sort | string | Không | Sắp xếp (price_asc, price_desc, newest, popular) |

**Request Example:**
```bash
curl -X GET "http://localhost:3000/api/public/products?page=1&limit=20&category_id=1"
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách sản phẩm thành công",
  "data": [
    {
      "id": 1,
      "name": "Áo thun nam",
      "slug": "ao-thun-nam",
      "sku": "SP001",
      "description": "Mô tả sản phẩm",
      "price": "299000",
      "sale_price": "199000",
      "stock_quantity": 100,
      "status": "active",
      "featured_image": "https://example.com/image.jpg",
      "images": ["https://example.com/image1.jpg"],
      "variants": [
        {
          "id": 1,
          "sku": "SP001-M",
          "price": "199000",
          "stock_quantity": 50,
          "attributes": {
            "size": "M",
            "color": "Đỏ"
          }
        }
      ]
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 100,
    "last_page": 5
  }
}
```

#### 1.2. Xem chi tiết sản phẩm

**Endpoint:** `GET /api/public/products/:slug`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| slug | string | ✅ | Slug của sản phẩm |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Áo thun nam",
    "slug": "ao-thun-nam",
    "description": "Mô tả chi tiết",
    "price": "299000",
    "sale_price": "199000",
    "stock_quantity": 100,
    "variants": [
      {
        "id": 1,
        "sku": "SP001-M-RED",
        "price": "199000",
        "stock_quantity": 50,
        "attributes": {
          "size": "M",
          "color": "Đỏ"
        }
      }
    ],
    "categories": [],
    "images": []
  }
}
```

---

### BƯỚC 2: THÊM VÀO GIỎ HÀNG

#### 2.1. Thêm sản phẩm vào giỏ hàng

**Endpoint:** `POST /api/public/cart/add`

**Request Body:**

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| product_variant_id | number | ✅ | ID của product variant (bắt buộc) |
| quantity | number | ✅ | Số lượng (tối thiểu: 1) |
| cart_uuid | string | Không | UUID của giỏ hàng (cho guest user) |

**Request Example:**
```bash
curl -X POST "http://localhost:3000/api/public/cart/add" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "product_variant_id": 1,
    "quantity": 2
  }'
```

**Response (Success 200):**
```json
{
  "success": true,
  "message": "Thêm vào giỏ hàng thành công",
  "data": {
    "cart": {
      "id": 1,
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "items": [
        {
          "id": 1,
          "product_variant_id": 1,
          "product_name": "Áo thun nam",
          "variant_name": "M - Đỏ",
          "quantity": 2,
          "unit_price": "199000",
          "total_price": "398000"
        }
      ],
      "subtotal": "398000",
      "tax_amount": "0",
      "shipping_amount": "0",
      "discount_amount": "0",
      "total_amount": "398000",
      "items_count": 1
    }
  }
}
```

**Response (Error - Hết hàng 400):**
```json
{
  "success": false,
  "message": "Chỉ còn 1 sản phẩm trong kho",
  "statusCode": 400
}
```

**Lưu ý quan trọng:**
- **Guest user**: Cần lưu `cart_uuid` để truyền vào các request tiếp theo, hoặc dùng `session_id`
- **Logged-in user**: Không cần truyền `cart_uuid`, hệ thống tự động dùng `user_id` từ JWT token
- Nếu sản phẩm đã có trong giỏ, số lượng sẽ được cộng dồn
- Hệ thống tự động validate stock trước khi thêm vào giỏ

---

### BƯỚC 3: XEM GIỎ HÀNG

#### 3.1. Lấy thông tin giỏ hàng

**Endpoint:** `GET /api/public/cart`

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| cart_uuid | string | Không | UUID của giỏ hàng (cho guest user) |
| session_id | string | Không | Session ID (cho guest user) |

**Request Example:**
```bash
# Logged-in user
curl -X GET "http://localhost:3000/api/public/cart" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Guest user với cart_uuid
curl -X GET "http://localhost:3000/api/public/cart?cart_uuid=550e8400-e29b-41d4-a716-446655440000"
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy thông tin giỏ hàng thành công",
  "data": {
    "cart": {
      "id": 1,
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "items": [
        {
          "id": 1,
          "product_variant_id": 1,
          "product_name": "Áo thun nam",
          "variant_name": "M - Đỏ",
          "quantity": 2,
          "unit_price": "199000",
          "total_price": "398000",
          "product": {
            "id": 1,
            "name": "Áo thun nam",
            "slug": "ao-thun-nam",
            "featured_image": "https://example.com/image.jpg"
          },
          "variant": {
            "id": 1,
            "sku": "SP001-M-RED",
            "attributes": {
              "size": "M",
              "color": "Đỏ"
            }
          }
        }
      ],
      "subtotal": "398000",
      "tax_amount": "0",
      "shipping_amount": "0",
      "discount_amount": "0",
      "total_amount": "398000",
      "items_count": 1,
      "created_at": "2025-01-16T10:00:00Z",
      "updated_at": "2025-01-16T10:30:00Z"
    }
  }
}
```

---

### BƯỚC 4: CẬP NHẬT GIỎ HÀNG

#### 4.1. Cập nhật số lượng sản phẩm

**Endpoint:** `PUT /api/public/cart/items/:id`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| id | number | ✅ | ID của cart item |

**Request Body:**

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| quantity | number | ✅ | Số lượng mới (tối thiểu: 1, nếu <= 0 sẽ xóa item) |

**Request Example:**
```bash
curl -X PUT "http://localhost:3000/api/public/cart/items/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "quantity": 3
  }'
```

**Response:** Tương tự như GET cart, trả về giỏ hàng đã cập nhật

#### 4.2. Xóa sản phẩm khỏi giỏ hàng

**Endpoint:** `DELETE /api/public/cart/item/:id`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| id | number | ✅ | ID của cart item |

**Request Example:**
```bash
curl -X DELETE "http://localhost:3000/api/public/cart/item/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:** Tương tự như GET cart, trả về giỏ hàng sau khi xóa

#### 4.3. Xóa toàn bộ giỏ hàng

**Endpoint:** `DELETE /api/public/cart/clear`

**Request Example:**
```bash
curl -X DELETE "http://localhost:3000/api/public/cart/clear?cart_uuid=550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### BƯỚC 5: ÁP DỤNG MÃ GIẢM GIÁ (KHUYẾN MÃI)

#### 5.1. Lấy danh sách mã giảm giá khả dụng

**Endpoint:** `GET /api/public/discounts/coupons/available`

**Authentication:** Optional (JWT token cho user-specific coupons)

**Request Example:**
```bash
# Không có JWT token (lấy tất cả mã công khai)
curl -X GET "http://localhost:3000/api/public/discounts/coupons/available"

# Với JWT token (lấy mã dành cho user)
curl -X GET "http://localhost:3000/api/public/discounts/coupons/available" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách mã giảm giá thành công",
  "data": [
    {
      "id": 1,
      "code": "WELCOME10",
      "name": "Giảm 10% cho khách hàng mới",
      "description": "Giảm 10% cho đơn hàng đầu tiên",
      "discount_type": "percentage",
      "discount_value": 10,
      "minimum_order_amount": 0,
      "maximum_discount_amount": null,
      "usage_limit": 100,
      "usage_count": 0,
      "start_date": "2025-01-01T00:00:00Z",
      "end_date": "2025-12-31T23:59:59Z",
      "is_active": true,
      "applicable_for": "all",
      "user_usage_count": 0,
      "can_use": true
    },
    {
      "id": 2,
      "code": "SAVE20",
      "name": "Giảm 20%",
      "description": "Giảm 20% cho đơn hàng trên 500.000đ",
      "discount_type": "percentage",
      "discount_value": 20,
      "minimum_order_amount": 500000,
      "maximum_discount_amount": 200000,
      "usage_limit": 50,
      "usage_count": 10,
      "start_date": "2025-01-01T00:00:00Z",
      "end_date": "2025-06-30T23:59:59Z",
      "is_active": true,
      "applicable_for": "all",
      "user_usage_count": 0,
      "can_use": true
    },
    {
      "id": 3,
      "code": "FREESHIP",
      "name": "Miễn phí vận chuyển",
      "description": "Miễn phí vận chuyển cho đơn hàng trên 300.000đ",
      "discount_type": "free_shipping",
      "discount_value": 0,
      "minimum_order_amount": 300000,
      "maximum_discount_amount": null,
      "usage_limit": null,
      "usage_count": 0,
      "start_date": "2025-01-01T00:00:00Z",
      "end_date": "2025-12-31T23:59:59Z",
      "is_active": true,
      "applicable_for": "all",
      "user_usage_count": 0,
      "can_use": true
    }
  ]
}
```

**Response Fields:**

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| id | number | ID của mã giảm giá |
| code | string | Mã giảm giá (ví dụ: "SAVE20") |
| name | string | Tên mã giảm giá |
| description | string | Mô tả |
| discount_type | string | Loại giảm giá: `percentage`, `fixed_amount`, `free_shipping` |
| discount_value | number | Giá trị giảm giá (% hoặc số tiền cố định) |
| minimum_order_amount | number | Giá trị đơn hàng tối thiểu để áp dụng |
| maximum_discount_amount | number \| null | Giá trị giảm tối đa (nếu có) |
| usage_limit | number \| null | Giới hạn số lần sử dụng (null = không giới hạn) |
| usage_count | number | Số lần đã sử dụng |
| start_date | string | Ngày bắt đầu (ISO 8601) |
| end_date | string | Ngày kết thúc (ISO 8601) |
| is_active | boolean | Trạng thái hoạt động |
| applicable_for | string | Áp dụng cho: `all`, `first_order`, `specific_users` |
| user_usage_count | number | Số lần user đã sử dụng (nếu có user_id) |
| can_use | boolean | User có thể sử dụng mã này không |

#### 5.2. Kiểm tra tính hợp lệ của mã giảm giá (không áp dụng)

**Endpoint:** `POST /api/public/discounts/validate-coupon`

**Authentication:** Optional (JWT token cho user-specific validation)

**Request Body:**

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| coupon_code | string | ✅ | Mã giảm giá cần kiểm tra |
| cart_total | number | Không | Giá trị giỏ hàng (để tính discount ước tính) |

**Request Example:**
```bash
curl -X POST "http://localhost:3000/api/public/discounts/validate-coupon" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "coupon_code": "SAVE20",
    "cart_total": 500000
  }'
```

**Response (Success 200):**
```json
{
  "success": true,
  "message": "Mã giảm giá hợp lệ",
  "data": {
    "id": 2,
    "code": "SAVE20",
    "name": "Giảm 20%",
    "description": "Giảm 20% cho đơn hàng trên 500.000đ",
    "discount_type": "percentage",
    "discount_value": 20,
    "minimum_order_amount": 500000,
    "maximum_discount_amount": 200000,
    "is_valid": true,
    "estimated_discount": 100000,
    "final_amount": 400000,
    "user_usage_count": 0,
    "remaining_usage": 40
  }
}
```

**Response (Error - Mã không hợp lệ 400):**
```json
{
  "success": false,
  "message": "Mã giảm giá không tồn tại",
  "statusCode": 400
}
```

**Response (Error - Chưa đạt giá trị tối thiểu 400):**
```json
{
  "success": false,
  "message": "Đơn hàng tối thiểu phải đạt 500000đ để sử dụng mã này",
  "statusCode": 400
}
```

**Response (Error - Mã đã hết hạn 400):**
```json
{
  "success": false,
  "message": "Mã giảm giá đã hết hạn",
  "statusCode": 400
}
```

**Response (Error - Đã đạt giới hạn sử dụng 400):**
```json
{
  "success": false,
  "message": "Mã giảm giá đã đạt giới hạn sử dụng",
  "statusCode": 400
}
```

#### 5.3. Áp dụng mã giảm giá vào giỏ hàng

**Endpoint:** `POST /api/public/discounts/apply-coupon`

**Authentication:** Required (JWT token)

**Request Body:**

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| coupon_code | string | ✅ | Mã giảm giá |
| cart_id | number | Không | ID của giỏ hàng (ưu tiên nếu có) |
| cart_uuid | string | Không | UUID của giỏ hàng (cho guest user) |

**Lưu ý:** Phải cung cấp ít nhất một trong `cart_id` hoặc `cart_uuid`

**Request Example:**
```bash
curl -X POST "http://localhost:3000/api/public/discounts/apply-coupon" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "cart_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "coupon_code": "SAVE20"
  }'
```

**Response (Success 200):**
```json
{
  "success": true,
  "message": "Áp dụng mã giảm giá thành công",
  "data": {
    "cart_id": 1,
    "cart_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "subtotal": 500000,
    "discount_amount": 100000,
    "coupon_code": "SAVE20",
    "shipping_amount": 30000,
    "tax_amount": 0,
    "total_amount": 430000,
    "applied_coupon": {
      "id": 2,
      "code": "SAVE20",
      "name": "Giảm 20%",
      "discount_type": "percentage",
      "discount_value": 20,
      "discount_amount": 100000
    },
    "items": [
      {
        "id": 1,
        "product_name": "Áo thun nam",
        "quantity": 2,
        "unit_price": 250000,
        "total_price": 500000
      }
    ]
  }
}
```

**Lưu ý quan trọng:**
- ✅ Chỉ có thể áp dụng **1 mã giảm giá** cho mỗi giỏ hàng
- ✅ Nếu áp dụng mã mới, mã cũ sẽ tự động bị thay thế
- ✅ Discount amount sẽ được tính toán và lưu vào database
- ✅ Cart total sẽ được cập nhật tự động sau khi áp dụng
- ✅ Hệ thống tự động validate:
  - Mã có tồn tại và đang hoạt động
  - Mã chưa hết hạn
  - Chưa đạt giới hạn sử dụng (nếu có)
  - Đơn hàng đạt giá trị tối thiểu (nếu có)
  - User chưa sử dụng quá số lần cho phép (nếu có)

**Response (Error - Mã không hợp lệ 400):**
```json
{
  "success": false,
  "message": "Mã giảm giá không tồn tại",
  "statusCode": 400
}
```

**Response (Error - Chưa đạt giá trị tối thiểu 400):**
```json
{
  "success": false,
  "message": "Đơn hàng tối thiểu phải đạt 500000đ để sử dụng mã này",
  "statusCode": 400
}
```

#### 5.4. Xóa mã giảm giá khỏi giỏ hàng

**Endpoint:** `DELETE /api/public/discounts/remove-coupon/:cart_id_or_uuid`

**Authentication:** Required (JWT token)

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| cart_id_or_uuid | string \| number | ✅ | ID (số) hoặc UUID (string) của giỏ hàng |

**Request Example:**
```bash
# Với cart UUID
curl -X DELETE "http://localhost:3000/api/public/discounts/remove-coupon/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Với cart ID
curl -X DELETE "http://localhost:3000/api/public/discounts/remove-coupon/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (Success 200):**
```json
{
  "success": true,
  "message": "Xóa mã giảm giá thành công",
  "data": {
    "cart_id": 1,
    "cart_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "subtotal": 500000,
    "discount_amount": 0,
    "coupon_code": null,
    "shipping_amount": 30000,
    "tax_amount": 0,
    "total_amount": 530000,
    "items": [
      {
        "id": 1,
        "product_name": "Áo thun nam",
        "quantity": 2,
        "unit_price": 250000,
        "total_price": 500000
      }
    ]
  }
}
```

**Lưu ý:**
- ✅ Sau khi xóa mã giảm giá, `discount_amount` sẽ được reset về 0
- ✅ Cart total sẽ được tính toán lại không có discount
- ✅ `coupon_code` sẽ được set thành `null`

---

### BƯỚC 6: XEM PHƯƠNG THỨC VẬN CHUYỂN & TÍNH PHÍ

#### 5.1. Lấy danh sách phương thức vận chuyển

**Endpoint:** `GET /api/public/shipping-methods/active`

**Request Example:**
```bash
curl -X GET "http://localhost:3000/api/public/shipping-methods/active"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Giao hàng nhanh",
      "description": "Giao hàng trong 2-3 ngày",
      "base_cost": "30000",
      "estimated_days": "2-3",
      "status": "active"
    },
    {
      "id": 2,
      "name": "Giao hàng tiết kiệm",
      "description": "Giao hàng trong 5-7 ngày",
      "base_cost": "20000",
      "estimated_days": "5-7",
      "status": "active"
    }
  ]
}
```

#### 5.2. Tính phí vận chuyển

**Endpoint:** `POST /api/public/shipping-methods/calculate`

**Request Body:**

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| shipping_method_id | number | ✅ | ID phương thức vận chuyển |
| cart_value | number | ✅ | Giá trị giỏ hàng (subtotal) |
| weight | number | Không | Tổng trọng lượng (kg) |
| destination | object | ✅ | Thông tin địa chỉ nhận hàng |

**Request Example:**
```bash
curl -X POST "http://localhost:3000/api/public/shipping-methods/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "shipping_method_id": 1,
    "cart_value": 398000,
    "weight": 0.5,
    "destination": {
      "ward_code": "26041",
      "district_id": 760
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shipping_cost": "30000",
    "estimated_days": "2-3"
  }
}
```

---

### BƯỚC 7: XEM PHƯƠNG THỨC THANH TOÁN

#### 7.1. Lấy danh sách phương thức thanh toán

**Endpoint:** `GET /api/public/payment-methods`

**Request Example:**
```bash
curl -X GET "http://localhost:3000/api/public/payment-methods"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Thanh toán khi nhận hàng (COD)",
      "code": "cod",
      "description": "Thanh toán khi nhận hàng",
      "status": "active"
    },
    {
      "id": 2,
      "name": "VNPay",
      "code": "vnpay",
      "description": "Thanh toán qua VNPay",
      "status": "active"
    },
    {
      "id": 3,
      "name": "MoMo",
      "code": "momo",
      "description": "Thanh toán qua MoMo",
      "status": "active"
    },
    {
      "id": 4,
      "name": "Chuyển khoản ngân hàng",
      "code": "bank_transfer",
      "description": "Chuyển khoản trực tiếp",
      "status": "active"
    }
  ]
}
```

---

### BƯỚC 8: ĐẶT HÀNG (TẠO ORDER TỪ CART)

#### 8.1. Tạo đơn hàng

**Endpoint:** `POST /api/public/orders`

**Request Body:**

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| customer_name | string | Không | Tên khách hàng (nếu không có sẽ lấy từ shipping_address) |
| customer_email | string | Không | Email khách hàng (nếu không có sẽ lấy từ shipping_address) |
| customer_phone | string | Không | Số điện thoại (nếu không có sẽ lấy từ shipping_address) |
| shipping_address | object | ✅ | Địa chỉ giao hàng (chi tiết bên dưới) |
| billing_address | object | Không | Địa chỉ thanh toán (nếu không có sẽ dùng shipping_address) |
| shipping_method_id | number | ✅ | ID phương thức vận chuyển |
| payment_method_id | number | Không | ID phương thức thanh toán (optional, có thể để null cho COD) |
| notes | string | Không | Ghi chú đơn hàng |
| cart_uuid | string | Không | UUID của giỏ hàng (cho guest user) |

**shipping_address structure:**
```typescript
{
  name: string;          // Tên người nhận
  phone: string;         // Số điện thoại
  email?: string;        // Email (optional)
  address: string;       // Địa chỉ chi tiết
  ward_code?: string;    // Mã phường/xã
  district_id?: number;  // ID quận/huyện
  province_id?: number;  // ID tỉnh/thành phố
  postal_code?: string;  // Mã bưu điện
}
```

**Request Example:**
```bash
curl -X POST "http://localhost:3000/api/public/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "customer_name": "Nguyễn Văn A",
    "customer_email": "nguyenvana@example.com",
    "customer_phone": "0901234567",
    "shipping_address": {
      "name": "Nguyễn Văn A",
      "phone": "0901234567",
      "email": "nguyenvana@example.com",
      "address": "123 Đường ABC, Phường XYZ",
      "ward_code": "26041",
      "district_id": 760,
      "province_id": 79
    },
    "shipping_method_id": 1,
    "payment_method_id": 1,
    "notes": "Giao giờ hành chính",
    "cart_uuid": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**Response (Success 200):**
```json
{
  "success": true,
  "message": "Tạo đơn hàng thành công",
  "data": {
    "order_id": 123,
    "order_number": "ORD-20250116-123456",
    "status": "pending",
    "total_amount": "428000",
    "items_count": 1
  }
}
```

**Lưu ý quan trọng:**
- ✅ Sau khi tạo order thành công, giỏ hàng sẽ tự động được xóa
- ✅ Hệ thống tự động validate:
  - Cart có tồn tại và thuộc về user/guest
  - Sản phẩm còn hàng
  - Shipping method hợp lệ
  - Payment method hợp lệ (nếu có)
- ✅ Order type sẽ tự động được xác định: `digital`, `physical`, hoặc `mixed`
- ✅ Payment record sẽ được tạo tự động với status `pending`
- ✅ Stock sẽ được trừ ngay khi tạo order thành công

**Response (Error - Hết hàng 400):**
```json
{
  "success": false,
  "message": "Sản phẩm đã hết hàng hoặc không đủ số lượng",
  "statusCode": 400
}
```

**Response (Error - Cart không tồn tại 404):**
```json
{
  "success": false,
  "message": "Cart not found",
  "statusCode": 404
}
```

---

### BƯỚC 9: THANH TOÁN

#### 9.1. Tạo Payment URL (Cho Online Payment)

**Endpoint:** `POST /api/public/payments/create-url`

**Request Body:**

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| order_id | number | ✅ | ID của đơn hàng |
| payment_method_id | number | ✅ | ID phương thức thanh toán (phải là online gateway như vnpay, momo) |
| return_url | string | Không | URL trả về sau khi thanh toán |
| cancel_url | string | Không | URL khi hủy thanh toán |

**Request Example:**
```bash
curl -X POST "http://localhost:3000/api/public/payments/create-url" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": 123,
    "payment_method_id": 2,
    "return_url": "https://yoursite.com/payment/return",
    "cancel_url": "https://yoursite.com/payment/cancel"
  }'
```

**Response (Success 200):**
```json
{
  "success": true,
  "message": "Tạo payment URL thành công",
  "data": {
    "payment_id": 456,
    "payment_url": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=42800000&vnp_Command=pay&...",
    "expires_at": "2025-01-16T11:00:00Z"
  }
}
```

**Lưu ý:**
- ✅ **COD (Thanh toán khi nhận hàng)**: Không cần tạo payment URL, order sẽ ở trạng thái `pending` chờ admin xác nhận
- ✅ **Online Payment (VNPay, MoMo)**: Cần redirect user đến `payment_url` để thanh toán
- ✅ Sau khi user thanh toán thành công, payment gateway sẽ gọi webhook để cập nhật trạng thái

#### 9.2. Xác minh thanh toán (Return từ Payment Gateway)

**Endpoint:** `GET /api/public/payments/verify/:gateway`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| gateway | string | ✅ | Tên gateway: `vnpay`, `momo`, `zalopay` |

**Query Parameters:** (Tùy theo từng gateway, VNPay ví dụ)
- `vnp_Amount`
- `vnp_BankCode`
- `vnp_CardType`
- `vnp_OrderInfo`
- `vnp_PayDate`
- `vnp_ResponseCode`
- `vnp_TmnCode`
- `vnp_TransactionNo`
- `vnp_TxnRef`
- `vnp_SecureHash`

**Request Example:**
```
GET /api/public/payments/verify/vnpay?vnp_Amount=42800000&vnp_BankCode=NCB&vnp_ResponseCode=00&vnp_TxnRef=ORD-20250116-123456&...
```

**Response (Success 200):**
```json
{
  "success": true,
  "message": "Thanh toán thành công",
  "data": {
    "order_id": 123,
    "order_number": "ORD-20250116-123456",
    "payment_status": "completed",
    "transaction_id": "VNPAY-1234567890",
    "amount": "428000"
  }
}
```

**Lưu ý quan trọng:**
- ✅ Payment gateway sẽ tự động gọi webhook để cập nhật trạng thái thanh toán
- ✅ Frontend nên redirect user đến trang "Thanh toán thành công" sau khi verify
- ✅ Đối với **digital orders**, sau khi thanh toán thành công, hệ thống sẽ tự động:
  - Gửi email chứa thông tin sản phẩm digital
  - Cập nhật order status thành `delivered`
  - Cập nhật shipping_status thành `delivered`

---

### BƯỚC 10: XÁC NHẬN ĐƠN HÀNG

#### 10.1. Lấy danh sách đơn hàng

**Endpoint:** `GET /api/public/orders`

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| page | number | Không | Số trang (mặc định: 1) |
| limit | number | Không | Số đơn hàng mỗi trang (mặc định: 10) |
| status | string | Không | Lọc theo trạng thái: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled` |

**Request Example:**
```bash
curl -X GET "http://localhost:3000/api/public/orders?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "order_number": "ORD-20250116-123456",
      "status": "pending",
      "payment_status": "pending",
      "shipping_status": "pending",
      "total_amount": "428000",
      "items": [
        {
          "id": 1,
          "product_name": "Áo thun nam",
          "variant_name": "M - Đỏ",
          "quantity": 2,
          "unit_price": "199000",
          "total_price": "398000"
        }
      ],
      "customer_name": "Nguyễn Văn A",
      "customer_email": "nguyenvana@example.com",
      "customer_phone": "0901234567",
      "shipping_address": {
        "name": "Nguyễn Văn A",
        "phone": "0901234567",
        "address": "123 Đường ABC"
      },
      "created_at": "2025-01-16T10:30:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 10,
    "total": 1,
    "last_page": 1
  }
}
```

#### 10.2. Lấy chi tiết đơn hàng

**Endpoint:** `GET /api/public/orders/:id`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| id | number | ✅ | ID của đơn hàng |

**Request Example:**
```bash
curl -X GET "http://localhost:3000/api/public/orders/123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "order_number": "ORD-20250116-123456",
    "status": "confirmed",
    "payment_status": "paid",
    "shipping_status": "processing",
    "order_type": "physical",
    "subtotal": "398000",
    "tax_amount": "0",
    "shipping_amount": "30000",
    "discount_amount": "0",
    "total_amount": "428000",
    "currency": "VND",
    "customer_name": "Nguyễn Văn A",
    "customer_email": "nguyenvana@example.com",
    "customer_phone": "0901234567",
    "shipping_address": {
      "name": "Nguyễn Văn A",
      "phone": "0901234567",
      "email": "nguyenvana@example.com",
      "address": "123 Đường ABC, Phường XYZ",
      "ward_code": "26041",
      "district_id": 760,
      "province_id": 79
    },
    "billing_address": { ... },
    "items": [
      {
        "id": 1,
        "product_variant_id": 1,
        "product_name": "Áo thun nam",
        "variant_name": "M - Đỏ",
        "quantity": 2,
        "unit_price": "199000",
        "total_price": "398000",
        "product": { ... },
        "variant": { ... }
      }
    ],
    "shipping_method": {
      "id": 1,
      "name": "Giao hàng nhanh",
      "description": "Giao hàng trong 2-3 ngày"
    },
    "payment_method": {
      "id": 1,
      "name": "Thanh toán khi nhận hàng (COD)",
      "code": "cod"
    },
    "payments": [
      {
        "id": 456,
        "status": "completed",
        "amount": "428000",
        "transaction_id": "VNPAY-1234567890",
        "paid_at": "2025-01-16T10:35:00Z"
      }
    ],
    "tracking_number": "GHN-1234567890",
    "shipped_at": "2025-01-16T11:00:00Z",
    "delivered_at": null,
    "notes": "Giao giờ hành chính",
    "created_at": "2025-01-16T10:30:00Z",
    "updated_at": "2025-01-16T11:00:00Z"
  }
}
```

---

### BƯỚC 11: HỦY ĐƠN HÀNG (Nếu cần)

#### 11.1. Hủy đơn hàng

**Endpoint:** `PUT /api/public/orders/:id/cancel`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| id | number | ✅ | ID của đơn hàng |

**Lưu ý:** Chỉ có thể hủy đơn hàng ở trạng thái `pending` hoặc `confirmed`

**Request Example:**
```bash
curl -X PUT "http://localhost:3000/api/public/orders/123/cancel" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Hủy đơn hàng thành công",
  "data": {
    "order_id": 123,
    "status": "cancelled"
  }
}
```

**Lưu ý:**
- ✅ Khi hủy đơn hàng, stock sẽ được tự động hoàn trả
- ✅ Nếu đã thanh toán, cần xử lý hoàn tiền riêng

---

## 👨‍💼 LUỒNG ADMIN XỬ LÝ ĐƠN HÀNG

### Tổng quan luồng admin

```
1. Xem danh sách đơn hàng
   ↓
2. Xem chi tiết đơn hàng
   ↓
3. Xác nhận đơn hàng (nếu COD hoặc đã thanh toán)
   ↓
4. Xử lý đơn hàng (đóng gói)
   ↓
5. Giao hàng (cập nhật tracking number)
   ↓
6. Hoàn thành (đánh dấu đã giao)
   ↓
7. Xử lý thanh toán (nếu COD/Bank Transfer)
   ↓
8. Xử lý hủy đơn hàng (nếu cần)
```

---

### BƯỚC 1: XEM DANH SÁCH ĐƠN HÀNG

#### 1.1. Lấy danh sách đơn hàng (Admin)

**Endpoint:** `GET /api/admin/orders`

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| page | number | Không | Số trang (mặc định: 1) |
| limit | number | Không | Số đơn hàng mỗi trang (mặc định: 10) |
| status | string | Không | Lọc theo trạng thái |
| payment_status | string | Không | Lọc theo trạng thái thanh toán |
| user_id | number | Không | Lọc theo user |
| from_date | string | Không | Từ ngày (format: YYYY-MM-DD) |
| to_date | string | Không | Đến ngày (format: YYYY-MM-DD) |
| sortBy | string | Không | Trường sắp xếp |
| sortOrder | string | Không | Thứ tự: `ASC` hoặc `DESC` |

**Request Example:**
```bash
curl -X GET "http://localhost:3000/api/admin/orders?page=1&limit=20&status=pending" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "order_number": "ORD-20250116-123456",
      "status": "pending",
      "payment_status": "pending",
      "shipping_status": "pending",
      "total_amount": "428000",
      "customer_name": "Nguyễn Văn A",
      "customer_email": "nguyenvana@example.com",
      "customer_phone": "0901234567",
      "items_count": 1,
      "created_at": "2025-01-16T10:30:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 50,
    "last_page": 3
  }
}
```

**Permission:** `read:orders`

---

### BƯỚC 2: XEM CHI TIẾT ĐƠN HÀNG

#### 2.1. Lấy chi tiết đơn hàng (Admin)

**Endpoint:** `GET /api/admin/orders/:id`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| id | number | ✅ | ID của đơn hàng |

**Request Example:**
```bash
curl -X GET "http://localhost:3000/api/admin/orders/123" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Response:** Tương tự như user endpoint nhưng với đầy đủ thông tin hơn

**Permission:** `read:orders`

---

### BƯỚC 3: XÁC NHẬN ĐƠN HÀNG

#### 3.1. Cập nhật trạng thái đơn hàng

**Endpoint:** `PATCH /api/admin/orders/:id/status`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| id | number | ✅ | ID của đơn hàng |

**Request Body:**

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| status | string | ✅ | Trạng thái mới: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled` |
| notes | string | Không | Ghi chú |

**Request Example:**
```bash
curl -X PATCH "http://localhost:3000/api/admin/orders/123/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "status": "confirmed",
    "notes": "Đã xác nhận đơn hàng"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Cập nhật trạng thái đơn hàng thành công",
  "data": {
    "id": 123,
    "status": "confirmed",
    "notes": "Đã xác nhận đơn hàng",
    "updated_at": "2025-01-16T11:00:00Z"
  }
}
```

**Permission:** `update:orders`

**Lưu ý quan trọng:**
- ✅ Khi cập nhật status = `shipped`, hệ thống tự động cập nhật `shipped_at` = thời gian hiện tại
- ✅ Khi cập nhật status = `delivered`, hệ thống tự động cập nhật `delivered_at` = thời gian hiện tại
- ❌ **Không thể thay đổi** trạng thái của đơn hàng đã `cancelled` (trừ khi giữ nguyên `cancelled`)
- ❌ **Không thể thay đổi** trạng thái của đơn hàng đã `delivered` (trừ khi giữ nguyên `delivered`)

**Luồng trạng thái hợp lệ:**
```
pending → confirmed → processing → shipped → delivered
   ↓          ↓
cancelled  cancelled
```

---

### BƯỚC 4: CẬP NHẬT THÔNG TIN ĐƠN HÀNG

#### 4.1. Cập nhật thông tin đơn hàng

**Endpoint:** `PATCH /api/admin/orders/:id`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| id | number | ✅ | ID của đơn hàng |

**Request Body:**

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| customer_name | string | Không | Tên khách hàng |
| customer_email | string | Không | Email khách hàng |
| customer_phone | string | Không | Số điện thoại |
| shipping_address | object | Không | Địa chỉ giao hàng |
| billing_address | object | Không | Địa chỉ thanh toán |
| shipping_method_id | number | Không | ID phương thức vận chuyển |
| notes | string | Không | Ghi chú |
| tracking_number | string | Không | Mã vận đơn |

**Request Example:**
```bash
curl -X PATCH "http://localhost:3000/api/admin/orders/123" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "tracking_number": "GHN-1234567890",
    "notes": "Đã giao cho đơn vị vận chuyển"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Cập nhật đơn hàng thành công",
  "data": {
    "id": 123,
    "tracking_number": "GHN-1234567890",
    "notes": "Đã giao cho đơn vị vận chuyển",
    "updated_at": "2025-01-16T11:30:00Z"
  }
}
```

**Permission:** `update:orders`

---

### BƯỚC 5: XỬ LÝ THANH TOÁN (COD/Bank Transfer)

#### 5.1. Xem danh sách thanh toán

**Endpoint:** `GET /api/admin/payments`

**Query Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| page | number | Không | Số trang |
| limit | number | Không | Số items mỗi trang |
| order_id | number | Không | Lọc theo đơn hàng |
| status | string | Không | Lọc theo trạng thái: `pending`, `processing`, `completed`, `failed` |

**Request Example:**
```bash
curl -X GET "http://localhost:3000/api/admin/payments?order_id=123&status=pending" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

#### 5.2. Cập nhật trạng thái thanh toán

**Endpoint:** `PATCH /api/admin/payments/:id/status`

**Path Parameters:**

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| id | number | ✅ | ID của payment |

**Request Body:**

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| status | string | ✅ | Trạng thái mới: `pending`, `processing`, `completed`, `failed` |
| notes | string | Không | Ghi chú |

**Request Example:**
```bash
curl -X PATCH "http://localhost:3000/api/admin/payments/456/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "status": "completed",
    "notes": "Đã nhận thanh toán COD"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Cập nhật trạng thái thanh toán thành công",
  "data": {
    "id": 456,
    "status": "completed",
    "notes": "Đã nhận thanh toán COD",
    "paid_at": "2025-01-16T12:00:00Z"
  }
}
```

**Lưu ý quan trọng:**
- ✅ Khi cập nhật payment status = `completed`, hệ thống sẽ tự động:
  - Cập nhật order `payment_status` = `paid`
  - Nếu order status = `pending`, sẽ tự động chuyển sang `confirmed`
  - Nếu là **digital order**, sẽ tự động chuyển order status thành `delivered` và gửi email sản phẩm digital

---

## 📊 CÁC TRẠNG THÁI ĐƠN HÀNG

### Order Status (Trạng thái đơn hàng)

| Trạng thái | Mô tả | Có thể chuyển sang |
|------------|-------|-------------------|
| `pending` | Chờ xử lý | `confirmed`, `cancelled` |
| `confirmed` | Đã xác nhận | `processing`, `cancelled` |
| `processing` | Đang xử lý/đóng gói | `shipped`, `cancelled` |
| `shipped` | Đã giao cho đơn vị vận chuyển | `delivered` |
| `delivered` | Đã giao thành công | - (không thể thay đổi) |
| `cancelled` | Đã hủy | - (không thể thay đổi) |

### Payment Status (Trạng thái thanh toán)

| Trạng thái | Mô tả |
|------------|-------|
| `pending` | Chờ thanh toán |
| `processing` | Đang xử lý |
| `paid` | Đã thanh toán |
| `failed` | Thanh toán thất bại |

### Shipping Status (Trạng thái vận chuyển)

| Trạng thái | Mô tả |
|------------|-------|
| `pending` | Chờ vận chuyển |
| `processing` | Đang xử lý |
| `shipped` | Đã giao cho đơn vị vận chuyển |
| `delivered` | Đã giao thành công |

### Order Type (Loại đơn hàng)

| Loại | Mô tả |
|------|-------|
| `digital` | Đơn hàng sản phẩm digital (tự động delivered sau khi thanh toán) |
| `physical` | Đơn hàng sản phẩm vật lý (cần giao hàng) |
| `mixed` | Đơn hàng hỗn hợp (có cả digital và physical) |

---

## 🔍 CHI TIẾT API ENDPOINTS

### Cart Endpoints

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/public/cart` | Lấy giỏ hàng | Optional |
| POST | `/api/public/cart/add` | Thêm vào giỏ hàng | Optional |
| PUT | `/api/public/cart/items/:id` | Cập nhật số lượng | Optional |
| DELETE | `/api/public/cart/item/:id` | Xóa sản phẩm | Optional |
| DELETE | `/api/public/cart/clear` | Xóa toàn bộ giỏ hàng | Optional |

### Discount Endpoints (Public)

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/public/discounts/coupons/available` | Danh sách mã giảm giá khả dụng | Optional |
| POST | `/api/public/discounts/validate-coupon` | Kiểm tra tính hợp lệ của mã | Optional |
| POST | `/api/public/discounts/apply-coupon` | Áp dụng mã giảm giá vào giỏ hàng | Required |
| DELETE | `/api/public/discounts/remove-coupon/:cart_id_or_uuid` | Xóa mã giảm giá khỏi giỏ hàng | Required |

### Order Endpoints (Public)

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/public/orders` | Danh sách đơn hàng | Optional |
| GET | `/api/public/orders/:id` | Chi tiết đơn hàng | Optional |
| POST | `/api/public/orders` | Tạo đơn hàng | Optional |
| PUT | `/api/public/orders/:id/cancel` | Hủy đơn hàng | Optional |

### Order Endpoints (Admin)

| Method | Endpoint | Mô tả | Permission |
|--------|----------|-------|------------|
| GET | `/api/admin/orders` | Danh sách đơn hàng | `read:orders` |
| GET | `/api/admin/orders/:id` | Chi tiết đơn hàng | `read:orders` |
| PATCH | `/api/admin/orders/:id/status` | Cập nhật trạng thái | `update:orders` |
| PATCH | `/api/admin/orders/:id` | Cập nhật thông tin | `update:orders` |

### Payment Endpoints (Public)

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/public/payments` | Danh sách thanh toán | Optional |
| GET | `/api/public/payments/:id` | Chi tiết thanh toán | Optional |
| POST | `/api/public/payments/create-url` | Tạo payment URL | Optional |
| GET | `/api/public/payments/verify/:gateway` | Xác minh thanh toán | Optional |

### Payment Endpoints (Admin)

| Method | Endpoint | Mô tả | Permission |
|--------|----------|-------|------------|
| GET | `/api/admin/payments` | Danh sách thanh toán | `read:payments` |
| GET | `/api/admin/payments/:id` | Chi tiết thanh toán | `read:payments` |
| PATCH | `/api/admin/payments/:id/status` | Cập nhật trạng thái | `update:payments` |

### Shipping Methods Endpoints

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/public/shipping-methods` | Danh sách phương thức | Public |
| GET | `/api/public/shipping-methods/active` | Phương thức đang hoạt động | Public |
| POST | `/api/public/shipping-methods/calculate` | Tính phí vận chuyển | Public |

### Payment Methods Endpoints

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/public/payment-methods` | Danh sách phương thức | Public |

---

## ⚠️ XỬ LÝ LỖI

### HTTP Status Codes

| Code | Mô tả |
|------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (Validation error, business logic error) |
| 401 | Unauthorized (Chưa đăng nhập hoặc token hết hạn) |
| 403 | Forbidden (Không có quyền truy cập) |
| 404 | Not Found |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "success": false,
  "message": "Mô tả lỗi",
  "statusCode": 400,
  "error": "Bad Request"
}
```

### Các lỗi thường gặp

#### 1. Cart không tồn tại
```json
{
  "success": false,
  "message": "Cart not found",
  "statusCode": 404
}
```

#### 2. Sản phẩm hết hàng
```json
{
  "success": false,
  "message": "Chỉ còn 1 sản phẩm trong kho",
  "statusCode": 400
}
```

#### 3. Không đủ quyền truy cập
```json
{
  "success": false,
  "message": "Unauthorized access to order",
  "statusCode": 403
}
```

#### 4. Validation error
```json
{
  "success": false,
  "message": [
    "quantity must be a number",
    "quantity must not be less than 1"
  ],
  "statusCode": 400
}
```

#### 5. Không thể hủy đơn hàng
```json
{
  "success": false,
  "message": "Order cannot be cancelled in current status",
  "statusCode": 400
}
```

#### 6. Mã giảm giá không hợp lệ
```json
{
  "success": false,
  "message": "Mã giảm giá không tồn tại",
  "statusCode": 400
}
```

#### 7. Chưa đạt giá trị tối thiểu cho mã giảm giá
```json
{
  "success": false,
  "message": "Đơn hàng tối thiểu phải đạt 500000đ để sử dụng mã này",
  "statusCode": 400
}
```

#### 8. Mã giảm giá đã hết hạn
```json
{
  "success": false,
  "message": "Mã giảm giá đã hết hạn",
  "statusCode": 400
}
```

#### 9. Mã giảm giá đã đạt giới hạn sử dụng
```json
{
  "success": false,
  "message": "Mã giảm giá đã đạt giới hạn sử dụng",
  "statusCode": 400
}
```

---

## 📝 LƯU Ý QUAN TRỌNG CHO FRONTEND

### 1. Cart Management

- **Guest users**: 
  - Lưu `cart_uuid` vào localStorage/sessionStorage
  - Truyền `cart_uuid` vào mọi request liên quan đến cart
  - Khi user đăng nhập, có thể merge cart từ guest sang user (tùy business logic)

- **Logged-in users**:
  - Không cần truyền `cart_uuid`, hệ thống tự động dùng `user_id`
  - Luôn gửi JWT token trong header

### 2. Order Creation

- **Validation trước khi submit**:
  - Kiểm tra giỏ hàng không rỗng
  - Kiểm tra shipping_address đầy đủ
  - Kiểm tra shipping_method_id hợp lệ
  - Tính toán và hiển thị phí vận chuyển trước

- **Sau khi tạo order thành công**:
  - Giỏ hàng sẽ tự động bị xóa
  - Lưu `order_id` và `order_number` để hiển thị và theo dõi
  - Redirect user đến trang thanh toán hoặc trang xác nhận đơn hàng

### 3. Payment Flow

- **COD (Thanh toán khi nhận hàng)**:
  - Không cần tạo payment URL
  - Order sẽ ở trạng thái `pending` chờ admin xác nhận
  - Hiển thị thông báo "Đơn hàng đã được đặt, chờ xác nhận"

- **Online Payment (VNPay, MoMo, etc.)**:
  - Sau khi tạo order, gọi `POST /api/public/payments/create-url`
  - Redirect user đến `payment_url`
  - Sau khi thanh toán, payment gateway sẽ redirect về `return_url`
  - Tại return_url, gọi `GET /api/public/payments/verify/:gateway` để xác minh
  - Hiển thị kết quả thanh toán

### 5. Order Tracking

- **Polling**: Có thể polling `GET /api/public/orders/:id` để cập nhật trạng thái đơn hàng
- **Real-time**: Nếu có WebSocket support, có thể subscribe để nhận cập nhật real-time

### 6. Error Handling

- **Network errors**: Retry với exponential backoff
- **Validation errors**: Hiển thị lỗi cụ thể cho user
- **Business logic errors**: Hiển thị message từ API response
- **401/403 errors**: Redirect đến trang đăng nhập hoặc hiển thị thông báo không có quyền

### 7. Digital Products

- Sau khi thanh toán thành công cho đơn hàng digital:
  - Order status tự động chuyển sang `delivered`
  - Email chứa thông tin sản phẩm digital sẽ được gửi tự động
  - Có thể hiển thị thông báo "Kiểm tra email để nhận sản phẩm digital"

### 8. State Management

- **Recommended**: Sử dụng state management (Redux, Zustand, Vuex, etc.) để:
  - Lưu trữ cart state
  - Lưu trữ order state
  - Cache API responses
  - Handle loading states

---

## 🎯 VÍ DỤ LUỒNG HOÀN CHỈNH

### Ví dụ 1: Guest user mua hàng với COD

```javascript
// 1. Thêm vào giỏ hàng
const addToCartResponse = await fetch('/api/public/cart/add', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    product_variant_id: 1,
    quantity: 2
  })
});
const { data: { cart } } = await addToCartResponse.json();

// Lưu cart_uuid
localStorage.setItem('cart_uuid', cart.uuid);

// 2. Xem giỏ hàng
const cartResponse = await fetch(`/api/public/cart?cart_uuid=${cart.uuid}`);
const cartData = await cartResponse.json();

// 3. Xem mã giảm giá khả dụng (optional)
const couponsResponse = await fetch('/api/public/discounts/coupons/available');
const { data: availableCoupons } = await couponsResponse.json();

// 4. Áp dụng mã giảm giá (nếu có)
if (availableCoupons.length > 0) {
  const applyCouponResponse = await fetch('/api/public/discounts/apply-coupon', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
      // Note: Guest user cũng có thể áp dụng mã giảm giá nếu có JWT token
    },
    body: JSON.stringify({
      cart_uuid: cart.uuid,
      coupon_code: 'SAVE20'
    })
  });
  const couponData = await applyCouponResponse.json();
  console.log(`Đã áp dụng mã giảm giá: ${couponData.data.applied_coupon.code}`);
  console.log(`Giảm giá: ${couponData.data.discount_amount}đ`);
}

// 5. Xem phương thức vận chuyển
const shippingMethodsResponse = await fetch('/api/public/shipping-methods/active');
const { data: shippingMethods } = await shippingMethodsResponse.json();

// 6. Tính phí vận chuyển
const calculateShippingResponse = await fetch('/api/public/shipping-methods/calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    shipping_method_id: 1,
    cart_value: parseFloat(cartData.data.cart.subtotal),
    destination: {
      ward_code: '26041',
      district_id: 760
    }
  })
});
const { data: { shipping_cost } } = await calculateShippingResponse.json();

// 7. Đặt hàng
const createOrderResponse = await fetch('/api/public/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customer_name: 'Nguyễn Văn A',
    customer_email: 'nguyenvana@example.com',
    customer_phone: '0901234567',
    shipping_address: {
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      email: 'nguyenvana@example.com',
      address: '123 Đường ABC, Phường XYZ',
      ward_code: '26041',
      district_id: 760,
      province_id: 79
    },
    shipping_method_id: 1,
    payment_method_id: 1, // COD
    cart_uuid: cart.uuid
  })
});
const { data: { order_id, order_number } } = await createOrderResponse.json();

// 8. Xóa cart_uuid (vì giỏ hàng đã bị xóa)
localStorage.removeItem('cart_uuid');

// 9. Hiển thị thông báo thành công
console.log(`Đơn hàng ${order_number} đã được tạo thành công!`);
```

### Ví dụ 2: Logged-in user mua hàng với VNPay

```javascript
// 1. Thêm vào giỏ hàng (tự động dùng user_id từ JWT)
const addToCartResponse = await fetch('/api/public/cart/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`
  },
  body: JSON.stringify({
    product_variant_id: 1,
    quantity: 2
  })
});

// 2. Áp dụng mã giảm giá (nếu có)
const applyCouponResponse = await fetch('/api/public/discounts/apply-coupon', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`
  },
  body: JSON.stringify({
    coupon_code: 'SAVE20'
  })
});

// 3. Đặt hàng
const createOrderResponse = await fetch('/api/public/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`
  },
  body: JSON.stringify({
    shipping_address: { ... },
    shipping_method_id: 1,
    payment_method_id: 2 // VNPay
  })
});
const { data: { order_id } } = await createOrderResponse.json();

// 4. Tạo payment URL
const createPaymentUrlResponse = await fetch('/api/public/payments/create-url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    order_id: order_id,
    payment_method_id: 2,
    return_url: 'https://yoursite.com/payment/return',
    cancel_url: 'https://yoursite.com/payment/cancel'
  })
});
const { data: { payment_url } } = await createPaymentUrlResponse.json();

// 5. Redirect đến payment gateway
window.location.href = payment_url;

// 6. Tại return_url, verify payment
const urlParams = new URLSearchParams(window.location.search);
const verifyResponse = await fetch(`/api/public/payments/verify/vnpay?${urlParams.toString()}`);
const verifyData = await verifyResponse.json();

if (verifyData.success) {
  console.log('Thanh toán thành công!');
  // Redirect đến trang thành công
} else {
  console.log('Thanh toán thất bại!');
  // Redirect đến trang thất bại
}
```

### Ví dụ 3: Admin xử lý đơn hàng COD

```javascript
// 1. Xem danh sách đơn hàng pending
const ordersResponse = await fetch('/api/admin/orders?status=pending&payment_status=pending', {
  headers: {
    'Authorization': `Bearer ${adminJwtToken}`
  }
});
const { data: orders } = await ordersResponse.json();

// 2. Xem chi tiết đơn hàng
const orderResponse = await fetch(`/api/admin/orders/${orders[0].id}`, {
  headers: {
    'Authorization': `Bearer ${adminJwtToken}`
  }
});
const { data: order } = await orderResponse.json();

// 3. Xác nhận đơn hàng
const confirmOrderResponse = await fetch(`/api/admin/orders/${order.id}/status`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminJwtToken}`
  },
  body: JSON.stringify({
    status: 'confirmed'
  })
});

// 4. Xử lý đơn hàng
const processOrderResponse = await fetch(`/api/admin/orders/${order.id}/status`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminJwtToken}`
  },
  body: JSON.stringify({
    status: 'processing'
  })
});

// 5. Giao hàng
const shipOrderResponse = await fetch(`/api/admin/orders/${order.id}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminJwtToken}`
  },
  body: JSON.stringify({
    tracking_number: 'GHN-1234567890'
  })
});

const updateStatusResponse = await fetch(`/api/admin/orders/${order.id}/status`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminJwtToken}`
  },
  body: JSON.stringify({
    status: 'shipped'
  })
});

// 6. Xác nhận thanh toán COD
const paymentsResponse = await fetch(`/api/admin/payments?order_id=${order.id}&status=pending`, {
  headers: {
    'Authorization': `Bearer ${adminJwtToken}`
  }
});
const { data: payments } = await paymentsResponse.json();

const updatePaymentResponse = await fetch(`/api/admin/payments/${payments[0].id}/status`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminJwtToken}`
  },
  body: JSON.stringify({
    status: 'completed',
    notes: 'Đã nhận thanh toán COD'
  })
});
```

---

## 📚 TÀI LIỆU THAM KHẢO

- [Public Cart API](./public/cart.md)
- [Public Order API](./public/order.md)
- [Public Payment API](./public/payment.md)
- [Admin Order API](./admin/order.md)
- [Shipping Methods API](./public/shipping-method.md)
- [Payment Methods API](../payment-method/public/payment-method.md)

---

**Phiên bản tài liệu:** 1.0  
**Cập nhật lần cuối:** 2025-01-16
