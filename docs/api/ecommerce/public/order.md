# Public Order API - Đặt hàng & Quản lý đơn hàng

API đặt hàng cho **CẢ guest users và logged-in users**.

## Cấu trúc

- Base URL: `http://localhost:3000/api/public/orders`
- Authentication: **Optional** (hỗ trợ cả guest và logged-in)
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_JWT_TOKEN` (optional - nếu đã đăng nhập)

---

## 🔄 Complete Checkout Flow

```
1. Xem giỏ hàng
   ↓
2. Chọn phương thức vận chuyển & tính phí
   ↓
3. Chọn phương thức thanh toán
   ↓
4. Đặt hàng (tạo order)
   ↓
5. Thanh toán
   ↓
6. Xác nhận & theo dõi đơn hàng
```

---

## 1. Get Orders (Danh sách đơn hàng)

Lấy danh sách đơn hàng với filter và pagination.

### Endpoint
```
GET /api/public/orders
```

### Query Parameters
| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---------|------|----------|----------|-------|
| page | number | No | 1 | Trang hiện tại |
| limit | number | No | 10 | Số đơn hàng mỗi trang |
| status | string | No | - | Lọc theo trạng thái |
| session_id | string | No | - | Session ID cho guest user |
| cart_uuid | string | No | - | Cart UUID |

### Status Values
- `pending` - Chờ xác nhận
- `confirmed` - Đã xác nhận
- `processing` - Đang xử lý
- `shipped` - Đang giao hàng
- `delivered` - Đã giao hàng
- `cancelled` - Đã hủy

### Request Examples

```bash
# Logged-in user - Lấy tất cả đơn hàng
curl -X GET "http://localhost:3000/api/public/orders?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Guest user - Lấy đơn hàng theo session
curl -X GET "http://localhost:3000/api/public/orders?session_id=guest_abc123"

# Lọc đơn hàng đang giao
curl -X GET "http://localhost:3000/api/public/orders?status=shipped" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy danh sách đơn hàng thành công",
  "data": {
    "orders": [
      {
        "id": 123,
        "order_code": "ORD-20250116-001",
        "customer_name": "Nguyễn Văn A",
        "customer_email": "user@example.com",
        "customer_phone": "0901234567",
        "status": "shipped",
        "payment_status": "completed",
        "total_amount": "60010000",
        "shipping_fee": "30000",
        "created_at": "2025-01-16T10:30:00Z",
        "items_count": 2
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 5,
      "total_pages": 1
    }
  }
}
```

---

## 2. Get Order Detail (Chi tiết đơn hàng)

Lấy thông tin chi tiết của một đơn hàng.

### Endpoint
```
GET /api/public/orders/:id
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của đơn hàng |

### Request Example

```bash
# Logged-in user
curl -X GET "http://localhost:3000/api/public/orders/123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Guest user (nếu đơn được tạo bởi session này)
curl -X GET "http://localhost:3000/api/public/orders/123?session_id=guest_abc123"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy chi tiết đơn hàng thành công",
  "data": {
    "id": 123,
    "order_code": "ORD-20250116-001",
    "customer_name": "Nguyễn Văn A",
    "customer_email": "user@example.com",
    "customer_phone": "0901234567",
    "status": "shipped",
    "payment_status": "completed",
    "shipping_status": "in_transit",
    "subtotal": "59980000",
    "shipping_fee": "30000",
    "tax_amount": "0",
    "discount_amount": "0",
    "total_amount": "60010000",
    "currency": "VND",
    "notes": "Giao giờ hành chính",
    "shipping_address": {
      "name": "Nguyễn Văn A",
      "phone": "0901234567",
      "address": "123 Đường ABC, Phường 1",
      "district": "Quận 1",
      "city": "TP. Hồ Chí Minh"
    },
    "payment_method": {
      "id": 1,
      "name": "VNPay",
      "code": "vnpay"
    },
    "shipping_method": {
      "id": 1,
      "name": "Giao hàng nhanh",
      "estimated_days": "2-3"
    },
    "items": [
      {
        "id": 1,
        "product_id": 10,
        "product_variant_id": 1,
        "product_name": "iPhone 15 Pro",
        "variant_name": "128GB - Đen",
        "quantity": 2,
        "unit_price": "29990000",
        "total_price": "59980000",
        "image_url": "https://example.com/iphone.jpg"
      }
    ],
    "tracking_history": [
      {
        "status": "confirmed",
        "description": "Đơn hàng đã được xác nhận",
        "created_at": "2025-01-16T10:35:00Z"
      },
      {
        "status": "processing",
        "description": "Đang chuẩn bị hàng",
        "created_at": "2025-01-16T10:45:00Z"
      },
      {
        "status": "shipped",
        "description": "Đơn hàng đang được giao",
        "created_at": "2025-01-16T11:00:00Z"
      }
    ],
    "created_at": "2025-01-16T10:30:00Z",
    "updated_at": "2025-01-16T11:00:00Z"
  }
}
```

**Error - Order Not Found (404):**
```json
{
  "success": false,
  "message": "Không tìm thấy đơn hàng",
  "code": "ORDER_NOT_FOUND",
  "httpStatus": 404
}
```

---

## 3. Create Order (Đặt hàng) ⭐

Tạo đơn hàng mới từ giỏ hàng. **Endpoint quan trọng nhất!**

### Endpoint
```
POST /api/public/orders
```

### Request Body

#### Cho Logged-in User (Recommended):
```json
{
  "shipping_address": {
    "name": "Nguyễn Văn A",
    "phone": "0901234567",
    "address": "123 Đường ABC, Phường 1",
    "district": "Quận 1",
    "city": "TP. Hồ Chí Minh",
    "ward": "Phường 1",
    "postal_code": "70000"
  },
  "billing_address": {
    "name": "Nguyễn Văn A",
    "phone": "0901234567",
    "address": "123 Đường ABC",
    "district": "Quận 1",
    "city": "TP. Hồ Chí Minh"
  },
  "shipping_method_id": 1,
  "payment_method_id": 1,
  "notes": "Giao giờ hành chính"
}
```

#### Cho Guest User:
```json
{
  "customer_name": "Nguyễn Văn A",
  "customer_email": "user@example.com",
  "customer_phone": "0901234567",
  "shipping_address": {
    "name": "Nguyễn Văn A",
    "phone": "0901234567",
    "address": "123 Đường ABC, Phường 1",
    "district": "Quận 1",
    "city": "TP. Hồ Chí Minh"
  },
  "shipping_method_id": 1,
  "payment_method_id": 1,
  "session_id": "guest_abc123",
  "notes": "Giao giờ hành chính"
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| customer_name | string | Yes (guest only) | Tên khách hàng |
| customer_email | string | Yes (guest only) | Email khách hàng |
| customer_phone | string | Yes (guest only) | Số điện thoại |
| shipping_address | object | Yes | Địa chỉ giao hàng |
| billing_address | object | No | Địa chỉ thanh toán (mặc định = shipping) |
| shipping_method_id | number | Yes | ID phương thức vận chuyển |
| payment_method_id | number | Yes | ID phương thức thanh toán |
| notes | string | No | Ghi chú cho đơn hàng |
| session_id | string | No (guest only) | Session ID |
| cart_uuid | string | No (guest only) | Cart UUID |

### Request Examples

```bash
# Logged-in user
curl -X POST "http://localhost:3000/api/public/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "shipping_address": {
      "name": "Nguyễn Văn A",
      "phone": "0901234567",
      "address": "123 Đường ABC",
      "district": "Quận 1",
      "city": "TP. Hồ Chí Minh"
    },
    "shipping_method_id": 1,
    "payment_method_id": 1
  }'

# Guest user
curl -X POST "http://localhost:3000/api/public/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Nguyễn Văn A",
    "customer_email": "guest@example.com",
    "customer_phone": "0901234567",
    "shipping_address": {
      "name": "Nguyễn Văn A",
      "phone": "0901234567",
      "address": "123 Đường ABC",
      "district": "Quận 1",
      "city": "TP. Hồ Chí Minh"
    },
    "shipping_method_id": 1,
    "payment_method_id": 1,
    "session_id": "guest_abc123"
  }'
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Đặt hàng thành công",
  "data": {
    "order": {
      "id": 123,
      "order_code": "ORD-20250116-001",
      "status": "pending",
      "payment_status": "pending",
      "total_amount": "60010000",
      "created_at": "2025-01-16T10:30:00Z"
    },
    "payment": {
      "id": 456,
      "payment_url": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..."
    }
  }
}
```

**Lưu ý:** Nếu `payment_url` có giá trị, cần redirect user đến URL này để thanh toán.

**Error - Empty Cart (400):**
```json
{
  "success": false,
  "message": "Giỏ hàng trống",
  "code": "EMPTY_CART",
  "httpStatus": 400
}
```

**Error - Insufficient Stock (400):**
```json
{
  "success": false,
  "message": "Sản phẩm 'iPhone 15 Pro' không đủ hàng trong kho",
  "code": "INSUFFICIENT_STOCK",
  "httpStatus": 400
}
```

---

## 4. Cancel Order (Hủy đơn hàng)

Hủy đơn hàng. Chỉ có thể hủy khi status = `pending` hoặc `confirmed`.

### Endpoint
```
PUT /api/public/orders/:id/cancel
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của đơn hàng cần hủy |

### Request Example

```bash
# Logged-in user
curl -X PUT "http://localhost:3000/api/public/orders/123/cancel" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Guest user
curl -X PUT "http://localhost:3000/api/public/orders/123/cancel?session_id=guest_abc123"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Hủy đơn hàng thành công",
  "data": {
    "id": 123,
    "order_code": "ORD-20250116-001",
    "status": "cancelled",
    "cancelled_at": "2025-01-16T12:00:00Z"
  }
}
```

**Error - Cannot Cancel (400):**
```json
{
  "success": false,
  "message": "Không thể hủy đơn hàng ở trạng thái hiện tại",
  "code": "CANNOT_CANCEL_ORDER",
  "httpStatus": 400
}
```

---

## 📋 Complete Checkout Flow for Frontend

### Step 1: Xem giỏ hàng
```javascript
const cart = await fetch('http://localhost:3000/api/public/cart', {
  headers: {
    'Authorization': `Bearer ${token}` // nếu logged-in
  }
});
```

### Step 2: Lấy shipping methods
```javascript
const shippingMethods = await fetch('http://localhost:3000/api/user/shipping-methods/available', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Step 3: Tính phí ship (optional)
```javascript
const shippingCost = await fetch('http://localhost:3000/api/user/shipping-methods/calculate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    shipping_method_id: selectedMethodId,
    shipping_address: userAddress
  })
});
```

### Step 4: Lấy payment methods
```javascript
const paymentMethods = await fetch('http://localhost:3000/api/public/payment-methods');
```

### Step 5: Đặt hàng
```javascript
const order = await fetch('http://localhost:3000/api/public/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // nếu logged-in
  },
  body: JSON.stringify({
    shipping_address: {
      name: "Nguyễn Văn A",
      phone: "0901234567",
      address: "123 Đường ABC",
      district: "Quận 1",
      city: "TP. Hồ Chí Minh"
    },
    shipping_method_id: 1,
    payment_method_id: 1,
    notes: "Giao giờ hành chính"
  })
});

const data = await order.json();
```

### Step 6: Xử lý payment
```javascript
if (data.data.payment?.payment_url) {
  // Payment gateway yêu cầu redirect (VNPay, MoMo, etc.)
  localStorage.setItem('pending_order_id', data.data.order.id);
  window.location.href = data.data.payment.payment_url;
} else {
  // COD hoặc payment method không cần redirect
  showSuccess('Đặt hàng thành công');
  redirectTo(`/orders/${data.data.order.id}`);
}
```

### Step 7: Xử lý payment callback (VNPay return)
```javascript
// Trang return URL sau khi thanh toán
const urlParams = new URLSearchParams(window.location.search);
const orderId = localStorage.getItem('pending_order_id');

if (urlParams.get('vnp_ResponseCode') === '00') {
  // Thanh toán thành công
  showSuccess('Thanh toán thành công');
  localStorage.removeItem('pending_order_id');
  redirectTo(`/orders/${orderId}`);
} else {
  // Thanh toán thất bại
  showError('Thanh toán thất bại');
  redirectTo(`/orders/${orderId}`);
}
```

### Step 8: Theo dõi đơn hàng
```javascript
const orderDetail = await fetch(`http://localhost:3000/api/public/orders/${orderId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 🎯 Error Handling

### Common Error Codes
| Code | HTTP Status | Mô tả | Action |
|------|-------------|-------|--------|
| EMPTY_CART | 400 | Giỏ hàng trống | Redirect về trang sản phẩm |
| INSUFFICIENT_STOCK | 400 | Không đủ hàng | Hiển thị thông báo, cho user cập nhật giỏ |
| INVALID_SHIPPING_METHOD | 404 | Phương thức ship không hợp lệ | Chọn lại shipping method |
| INVALID_PAYMENT_METHOD | 404 | Phương thức thanh toán không hợp lệ | Chọn lại payment method |
| ORDER_NOT_FOUND | 404 | Không tìm thấy đơn hàng | Kiểm tra order ID |
| CANNOT_CANCEL_ORDER | 400 | Không thể hủy đơn | Hiển thị thông báo |
| UNAUTHORIZED | 401 | Token không hợp lệ | Redirect đến login |

### Error Handling Example
```javascript
try {
  const response = await createOrder(orderData);
  
  if (!response.success) {
    switch(response.code) {
      case 'EMPTY_CART':
        alert('Giỏ hàng trống, vui lòng thêm sản phẩm');
        router.push('/products');
        break;
        
      case 'INSUFFICIENT_STOCK':
        alert(response.message);
        // Reload cart để hiển thị stock hiện tại
        await refreshCart();
        break;
        
      case 'INVALID_SHIPPING_METHOD':
        alert('Phương thức vận chuyển không hợp lệ');
        await loadShippingMethods();
        break;
        
      default:
        alert('Đặt hàng thất bại: ' + response.message);
    }
  }
} catch (error) {
  console.error('Order error:', error);
  alert('Có lỗi xảy ra, vui lòng thử lại');
}
```

---

## 📱 UI/UX Recommendations

### 1. Hiển thị Progress Steps
```
[✓] Giỏ hàng → [✓] Thông tin giao hàng → [•] Thanh toán → [ ] Hoàn tất
```

### 2. Validate Before Submit
```javascript
const validateCheckout = () => {
  // Kiểm tra giỏ hàng
  if (cart.items.length === 0) {
    return 'Giỏ hàng trống';
  }
  
  // Kiểm tra địa chỉ
  if (!shippingAddress.name || !shippingAddress.phone) {
    return 'Vui lòng nhập đầy đủ thông tin giao hàng';
  }
  
  // Kiểm tra phone format
  if (!/^0\d{9}$/.test(shippingAddress.phone)) {
    return 'Số điện thoại không hợp lệ';
  }
  
  // Kiểm tra đã chọn shipping method
  if (!selectedShippingMethod) {
    return 'Vui lòng chọn phương thức vận chuyển';
  }
  
  // Kiểm tra đã chọn payment method
  if (!selectedPaymentMethod) {
    return 'Vui lòng chọn phương thức thanh toán';
  }
  
  return null; // Valid
};
```

### 3. Show Order Summary
```javascript
// Hiển thị tổng tiền trước khi đặt hàng
<OrderSummary>
  <Line>Tạm tính: {formatCurrency(cart.subtotal)}</Line>
  <Line>Phí vận chuyển: {formatCurrency(shippingCost)}</Line>
  <Line>Giảm giá: -{formatCurrency(discount)}</Line>
  <Divider />
  <Total>Tổng cộng: {formatCurrency(finalTotal)}</Total>
</OrderSummary>
```

---

**Xem thêm:**
- [Public Cart API](./cart.md) - Quản lý giỏ hàng
- [Public Payment API](./payment.md) - Xử lý thanh toán
- [User Shipping Methods API](../user/shipping-method.md) - Tính phí vận chuyển