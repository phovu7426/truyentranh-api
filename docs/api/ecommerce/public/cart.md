# Public Cart API

API quản lý giỏ hàng công khai cho cả guest và logged-in users.

## Cấu trúc

- Base URL: `http://localhost:3000/api/public/cart`
- Authentication: Optional (hỗ trợ cả guest và user đã đăng nhập)
- Headers: `Content-Type: application/json`

## Cart Tracking

Hệ thống hỗ trợ 3 cách tracking giỏ hàng:
1. **User ID** (ưu tiên cao nhất) - Tự động nếu có JWT token
2. **Cart UUID** - Unique identifier cho giỏ hàng
3. **Session ID** - Session-based tracking

---

## 1. Get Cart (Lấy giỏ hàng)

Lấy thông tin giỏ hàng hiện tại.

### Endpoint
```
GET /api/public/cart
```

### Query Parameters
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| session_id | string | Không | Session ID cho guest cart |
| cart_uuid | string | Không | UUID của giỏ hàng |

### Request Example

```bash
# Guest user với session_id
curl -X GET "http://localhost:3000/api/public/cart?session_id=abc123" \
  -H "Content-Type: application/json"

# Với cart UUID
curl -X GET "http://localhost:3000/api/public/cart?cart_uuid=550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json"

# Logged-in user (với JWT token)
curl -X GET "http://localhost:3000/api/public/cart" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy thông tin giỏ hàng thành công.",
  "data": {
    "cart_id": 1,
    "cart_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "owner_key": "user_123",
    "subtotal": "29990000",
    "tax_amount": "0",
    "shipping_amount": "0",
    "discount_amount": "0",
    "total_amount": "29990000",
    "items": [
      {
        "id": 1,
        "cart_header_id": 1,
        "product_id": 10,
        "product_variant_id": 1,
        "product_name": "iPhone 15 Pro",
        "product_sku": "IP15PRO",
        "variant_name": "128GB - Đen",
        "quantity": 1,
        "unit_price": "29990000",
        "total_price": "29990000",
        "variant": {
          "id": 1,
          "name": "iPhone 15 Pro - 128GB - Đen",
          "sku": "IP15PRO-128GB-BLACK",
          "price": "29990000",
          "stock_quantity": 50,
          "image_url": "https://example.com/iphone.jpg"
        }
      }
    ]
  }
}
```

---

## 2. Add to Cart (Thêm vào giỏ hàng)

Thêm sản phẩm vào giỏ hàng. Nếu sản phẩm đã tồn tại, số lượng sẽ được cộng dồn.

### Endpoint
```
POST /api/public/cart/add
```

### Request Body
```json
{
  "product_variant_id": 1,
  "quantity": 2,
  "session_id": "abc123",  // Optional cho guest
  "cart_uuid": "550e8400-e29b-41d4-a716-446655440000"  // Optional
}
```

### Request Example

```bash
curl -X POST "http://localhost:3000/api/public/cart/add" \
  -H "Content-Type: application/json" \
  -d '{
    "product_variant_id": 1,
    "quantity": 2,
    "session_id": "abc123"
  }'
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Thêm vào giỏ hàng thành công",
  "data": {
    "cart_id": 1,
    "cart_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "owner_key": "session_abc123",
    "subtotal": "59980000",
    "total_amount": "59980000",
    "items": [...]
  }
}
```

**Error - Insufficient Stock (400):**
```json
{
  "success": false,
  "message": "Chỉ còn 5 sản phẩm trong kho",
  "code": "INSUFFICIENT_STOCK"
}
```

**Error - Product Not Found (404):**
```json
{
  "success": false,
  "message": "Sản phẩm không tồn tại",
  "code": "PRODUCT_NOT_FOUND"
}
```

---

## 3. Update Cart Item (Cập nhật số lượng - Method 1)

Cập nhật số lượng sản phẩm trong giỏ bằng cart_item_id.

### Endpoint
```
PUT /api/public/cart/update
```

### Request Body
```json
{
  "cart_item_id": 1,
  "quantity": 3,
  "session_id": "abc123",  // Optional
  "cart_uuid": "550e8400-e29b-41d4-a716-446655440000"  // Optional
}
```

### Request Example

```bash
curl -X PUT "http://localhost:3000/api/public/cart/update" \
  -H "Content-Type: application/json" \
  -d '{
    "cart_item_id": 1,
    "quantity": 3
  }'
```

---

## 4. Update Cart Item by ID (Cập nhật số lượng - Method 2)

Cập nhật số lượng sản phẩm bằng cart item ID trên URL.

### Endpoint
```
PUT /api/public/cart/items/:id
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của cart item |

### Query Parameters
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| session_id | string | Không | Session ID |
| cart_uuid | string | Không | Cart UUID |

### Request Body
```json
{
  "quantity": 2
}
```

### Request Example

```bash
curl -X PUT "http://localhost:3000/api/public/cart/items/1?session_id=abc123" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 2
  }'
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Cập nhật giỏ hàng thành công",
  "data": {
    "cart_id": 1,
    "cart_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "subtotal": "59980000",
    "total_amount": "59980000",
    "items": [...]
  }
}
```

**Error - Cart Item Not Found (404):**
```json
{
  "success": false,
  "message": "Không tìm thấy sản phẩm trong giỏ hàng",
  "code": "CART_ITEM_NOT_FOUND"
}
```

**Error - Insufficient Stock (400):**
```json
{
  "success": false,
  "message": "Chỉ còn 5 sản phẩm trong kho",
  "code": "INSUFFICIENT_STOCK"
}
```

**Lưu ý:** Nếu quantity = 0, sản phẩm sẽ bị xóa khỏi giỏ hàng.

---

## 5. Remove from Cart (Xóa khỏi giỏ)

Xóa một sản phẩm khỏi giỏ hàng.

### Endpoint
```
DELETE /api/public/cart/item/:id
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của cart item cần xóa |

### Query Parameters
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| session_id | string | Không | Session ID |
| cart_uuid | string | Không | Cart UUID |

### Request Example

```bash
curl -X DELETE "http://localhost:3000/api/public/cart/item/1?session_id=abc123" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Xóa sản phẩm khỏi giỏ hàng thành công",
  "data": {
    "cart_id": 1,
    "items": [],
    "total_amount": "0"
  }
}
```

---

## 6. Clear Cart (Xóa toàn bộ giỏ)

Xóa tất cả sản phẩm trong giỏ hàng.

### Endpoint
```
DELETE /api/public/cart/clear
```

### Query Parameters
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| session_id | string | Không | Session ID |
| cart_uuid | string | Không | Cart UUID |

### Request Example

```bash
curl -X DELETE "http://localhost:3000/api/public/cart/clear?session_id=abc123" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Xóa giỏ hàng thành công",
  "data": {
    "cart_id": 1,
    "cart_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "items": [],
    "total_amount": "0"
  }
}
```

---

## Features

### ✅ Stock Validation
- Kiểm tra tồn kho real-time
- Pessimistic locking để tránh race condition
- Thông báo rõ ràng khi hết hàng

### ✅ Cart Persistence
- Guest cart: Dựa trên session_id hoặc cart_uuid
- User cart: Tự động liên kết với user_id
- Tự động merge cart khi user đăng nhập

### ✅ Price Calculation
- Tự động tính subtotal, tax, shipping
- Hỗ trợ discount/coupon codes
- Real-time price updates

### ✅ Transaction Safety
- Database transactions cho consistency
- Pessimistic locking cho inventory
- Rollback tự động khi có lỗi

---

## Use Cases

### Guest Shopping Flow
```bash
# 1. Thêm sản phẩm đầu tiên (tạo cart mới)
POST http://localhost:3000/api/public/cart/add
{
  "product_variant_id": 1,
  "quantity": 1,
  "session_id": "guest_abc123"
}

# Response sẽ trả về cart_uuid
# Lưu cart_uuid này để sử dụng cho các request tiếp theo

# 2. Thêm sản phẩm thứ hai
POST http://localhost:3000/api/public/cart/add
{
  "product_variant_id": 2,
  "quantity": 2,
  "cart_uuid": "550e8400-e29b-41d4-a716-446655440000"
}

# 3. Cập nhật số lượng
PUT http://localhost:3000/api/public/cart/items/1?cart_uuid=550e8400-e29b-41d4-a716-446655440000
{
  "quantity": 3
}

# 4. Xem giỏ hàng
GET http://localhost:3000/api/public/cart?cart_uuid=550e8400-e29b-41d4-a716-446655440000
```

### Logged-in User Flow
```bash
# Với JWT token, không cần session_id hay cart_uuid
# Hệ thống tự động dùng user_id

# 1. Thêm sản phẩm
POST http://localhost:3000/api/public/cart/add
Header: Authorization: Bearer YOUR_JWT_TOKEN
{
  "product_variant_id": 1,
  "quantity": 1
}

# 2. Cập nhật số lượng
PUT http://localhost:3000/api/public/cart/items/1
Header: Authorization: Bearer YOUR_JWT_TOKEN
{
  "quantity": 2
}
```

---

**Xem thêm:**
- [User Cart API](../user/cart.md)
- [User Order API](../user/order.md)
- [Public Products API](./product.md)