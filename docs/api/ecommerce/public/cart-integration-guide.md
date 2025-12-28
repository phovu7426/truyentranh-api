# Hướng dẫn tích hợp Giỏ hàng (Cart Integration Guide)

## Tổng quan

Hướng dẫn này dành cho đội ngũ Frontend để tích hợp chức năng giỏ hàng với API Backend. Hệ thống giỏ hàng đã được cập nhật để sử dụng UUID thay vì session_id, giúp đồng bộ và ổn định hơn.

## Base URL

```
/api/public/cart
```

## Authentication

Hầu hết các endpoint yêu cầu JWT authentication token. Token nên được gửi trong header:

```
Authorization: Bearer <jwt_token>
```

## Quan trọng: UUID thay cho Session ID

**Thay đổi quan trọng**: Hệ thống đã chuyển từ `session_id` sang `cart_uuid` để xác định giỏ hàng.

### Lợi ích của UUID:
- **Đồng bộ**: Toàn bộ hệ thống chỉ sử dụng một cách xác định giỏ hàng
- **Ổn định**: UUID không thay đổi như session_id
- **Cross-device**: User có thể bắt đầu trên mobile và hoàn thành trên desktop
- **Dễ chia sẻ**: Có thể lưu UUID vào localStorage hoặc gửi qua email
- **Bảo mật tốt hơn**: Không chứa thông tin nhận dạng session

## Luồng hoạt động của giỏ hàng

### 1. Khởi tạo giỏ hàng

Khi user truy cập trang web lần đầu:

```javascript
// Kiểm tra xem có cart_uuid trong localStorage không
let cartUuid = localStorage.getItem('cart_uuid');

if (!cartUuid) {
  // Nếu chưa có, tạo UUID mới
  cartUuid = generateUUID(); // Sử dụng thư viện UUID
  localStorage.setItem('cart_uuid', cartUuid);
}

// Sử dụng cartUuid cho tất cả các API calls
```

**Quan trọng**: Khi frontend gửi một `cart_uuid` đến API, hệ thống sẽ:
1. Tìm kiếm cart với UUID đó
2. Nếu tìm thấy, sử dụng cart hiện tại
3. Nếu không tìm thấy, tạo mới cart với đúng UUID được gửi
4. Điều này đảm bảo rằng response luôn trả về cùng UUID với request

### 2. Thêm sản phẩm vào giỏ

```javascript
// API Call
POST /api/public/cart/add

// Request Body
{
  "cart_uuid": "9cbb946c-a0c0-44c0-be29-1572a69cec67",
  "product_variant_id": 1,
  "quantity": 2
}

// Response
{
  "success": true,
  "message": "Thêm sản phẩm vào giỏ hàng thành công",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": {
    "id": 1,
    "cart_uuid": "9cbb946c-a0c0-44c0-be29-1572a69cec67",
    "product_variant_id": 1,
    "quantity": 2,
    "unit_price": 2902521,
    "total_price": 5805042,
    "product": {
      "id": 1,
      "name": "Xiaomi Redmi Buds 4",
      "sku": "XRB-001",
      "image": "https://example.com/image.jpg"
    }
  },
  "meta": {},
  "timestamp": "2025-11-21T10:03:10+07:00"
}
```

### 3. Lấy thông tin giỏ hàng

```javascript
// API Call
GET /api/public/cart?cart_uuid=9cbb946c-a0c0-44c0-be29-1572a69cec67

// Response
{
  "success": true,
  "message": "Lấy thông tin giỏ hàng thành công",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": {
    "cart_uuid": "9cbb946c-a0c0-44c0-be29-1572a69cec67",
    "subtotal": 5805042,
    "discount_amount": 0,
    "shipping_amount": 0,
    "tax_amount": 0,
    "total_amount": 5805042,
    "items": [
      {
        "id": 1,
        "product_variant_id": 1,
        "quantity": 2,
        "unit_price": 2902521,
        "total_price": 5805042,
        "product": {
          "id": 1,
          "name": "Xiaomi Redmi Buds 4",
          "sku": "XRB-001",
          "image": "https://example.com/image.jpg"
        }
      }
    ]
  },
  "meta": {},
  "timestamp": "2025-11-21T10:03:10+07:00"
}
```

### 4. Cập nhật số lượng sản phẩm

```javascript
// API Call
PUT /api/public/cart/update-item

// Request Body
{
  "cart_uuid": "9cbb946c-a0c0-44c0-be29-1572a69cec67",
  "cart_item_id": 1,
  "quantity": 3
}

// Response
{
  "success": true,
  "message": "Cập nhật giỏ hàng thành công",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": {
    "id": 1,
    "cart_uuid": "9cbb946c-a0c0-44c0-be29-1572a69cec67",
    "product_variant_id": 1,
    "quantity": 3,
    "unit_price": 2902521,
    "total_price": 8707563,
    "product": {
      "id": 1,
      "name": "Xiaomi Redmi Buds 4",
      "sku": "XRB-001",
      "image": "https://example.com/image.jpg"
    }
  },
  "meta": {},
  "timestamp": "2025-11-21T10:03:10+07:00"
}
```

### 5. Xóa sản phẩm khỏi giỏ

```javascript
// API Call
DELETE /api/public/cart/remove-item

// Query Parameters
cart_uuid=9cbb946c-a0c0-44c0-be29-1572a69cec67&cart_item_id=1

// Response
{
  "success": true,
  "message": "Xóa sản phẩm khỏi giỏ hàng thành công",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": null,
  "meta": {},
  "timestamp": "2025-11-21T10:03:10+07:00"
}
```

### 6. Áp dụng mã giảm giá

```javascript
// API Call
POST /api/public/discounts/apply-coupon

// Request Body
{
  "cart_uuid": "9cbb946c-a0c0-44c0-be29-1572a69cec67",
  "coupon_code": "SAVE20"
}

// Response
{
  "success": true,
  "message": "Áp dụng mã giảm giá thành công",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": {
    "cart_uuid": "9cbb946c-a0c0-44c0-be29-1572a69cec67",
    "subtotal": 5805042,
    "discount_amount": 1161008.4,
    "shipping_amount": 0,
    "tax_amount": 0,
    "total_amount": 4644033.6,
    "applied_coupon": {
      "id": "2",
      "code": "SAVE20",
      "name": "Save 20%",
      "discount_type": "percentage",
      "discount_value": 20,
      "discount_amount": 1161008.4
    },
    "items": [
      {
        "id": 1,
        "product_variant_id": 1,
        "quantity": 2,
        "unit_price": 2902521,
        "total_price": 5805042,
        "product": {
          "id": 1,
          "name": "Xiaomi Redmi Buds 4",
          "sku": "XRB-001",
          "image": "https://example.com/image.jpg"
        }
      }
    ]
  },
  "meta": {},
  "timestamp": "2025-11-21T10:03:10+07:00"
}
```

### 7. Xóa mã giảm giá

```javascript
// API Call
DELETE /api/public/discounts/remove-coupon?cart_uuid=9cbb946c-a0c0-44c0-be29-1572a69cec67

// Response
{
  "success": true,
  "message": "Xóa mã giảm giá thành công",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": {
    "cart_uuid": "9cbb946c-a0c0-44c0-be29-1572a69cec67",
    "subtotal": 5805042,
    "discount_amount": 0,
    "shipping_amount": 0,
    "tax_amount": 0,
    "total_amount": 5805042,
    "items": [
      {
        "id": 1,
        "product_variant_id": 1,
        "quantity": 2,
        "unit_price": 2902521,
        "total_price": 5805042,
        "product": {
          "id": 1,
          "name": "Xiaomi Redmi Buds 4",
          "sku": "XRB-001",
          "image": "https://example.com/image.jpg"
        }
      }
    ]
  },
  "meta": {},
  "timestamp": "2025-11-21T10:03:10+07:00"
}
```

### 8. Tạo đơn hàng từ giỏ

```javascript
// API Call
POST /api/public/orders

// Request Body
{
  "cart_uuid": "9cbb946c-a0c0-44c0-be29-1572a69cec67",
  "shipping_address": {
    "full_name": "Nguyễn Văn A",
    "phone": "0123456789",
    "address": "123 Đường ABC, Quận 1, TP.HCM",
    "province": "TP.HCM",
    "district": "Quận 1",
    "ward": "Phường Bến Nghé"
  },
  "payment_method_id": 1,
  "shipping_method_id": 1,
  "note": "Giao hàng vào giờ hành chính"
}

// Response
{
  "success": true,
  "message": "Tạo đơn hàng thành công",
  "code": "SUCCESS",
  "httpStatus": 201,
  "data": {
    "id": 1,
    "order_code": "ORD-20251121-001",
    "status": "pending",
    "subtotal": 5805042,
    "discount_amount": 1161008.4,
    "shipping_amount": 30000,
    "tax_amount": 0,
    "total_amount": 4714033.6,
    "items": [
      {
        "id": 1,
        "product_name": "Xiaomi Redmi Buds 4",
        "quantity": 2,
        "unit_price": 2902521,
        "total_price": 5805042
      }
    ]
  },
  "meta": {},
  "timestamp": "2025-11-21T10:03:10+07:00"
}
```

## Best Practices cho Frontend

### 1. Quản lý Cart UUID

```javascript
// cart.service.js
class CartService {
  constructor() {
    this.cartUuid = this.getOrCreateCartUuid();
  }

  getOrCreateCartUuid() {
    let cartUuid = localStorage.getItem('cart_uuid');
    if (!cartUuid) {
      cartUuid = this.generateUUID();
      localStorage.setItem('cart_uuid', cartUuid);
    }
    return cartUuid;
  }

  generateUUID() {
    // Sử dụng thư viện như uuid.js
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Các methods khác...
}
```

### 2. Xử lý lỗi

```javascript
// Xử lý các lỗi phổ biến
const handleCartError = (error) => {
  switch (error.code) {
    case 'CART_NOT_FOUND':
      // Tạo giỏ hàng mới
      cartService.createNewCart();
      break;
    case 'PRODUCT_OUT_OF_STOCK':
      // Hiển thị thông báo hết hàng
      showNotification('Sản phẩm đã hết hàng', 'error');
      break;
    case 'INVALID_COUPON':
      // Hiển thị thông báo mã giảm giá không hợp lệ
      showNotification('Mã giảm giá không hợp lệ', 'error');
      break;
    default:
      // Hiển thị thông báo lỗi chung
      showNotification('Đã xảy ra lỗi, vui lòng thử lại', 'error');
  }
};
```

### 3. Optimistic Updates

```javascript
// Cập nhật UI trước khi gọi API để cải thiện UX
const updateCartItem = async (itemId, newQuantity) => {
  // Optimistic update
  const previousState = cart.items.find(item => item.id === itemId);
  const updatedItem = { ...previousState, quantity: newQuantity };
  
  // Cập nhật UI ngay lập tức
  updateCartItemInUI(updatedItem);
  
  try {
    // Gọi API
    await cartApi.updateItem(cartUuid, itemId, newQuantity);
  } catch (error) {
    // Rollback nếu có lỗi
    updateCartItemInUI(previousState);
    handleCartError(error);
  }
};
```

### 4. Cache Management

```javascript
// Cache cart data để giảm số lượng API calls
const getCartWithCache = async () => {
  const cachedCart = localStorage.getItem('cart_cache');
  const cacheTime = localStorage.getItem('cart_cache_time');
  
  // Cache trong 5 phút
  if (cachedCart && cacheTime && (Date.now() - parseInt(cacheTime)) < 300000) {
    return JSON.parse(cachedCart);
  }
  
  // Fetch từ API
  const cart = await cartApi.getCart(cartUuid);
  
  // Lưu vào cache
  localStorage.setItem('cart_cache', JSON.stringify(cart));
  localStorage.setItem('cart_cache_time', Date.now().toString());
  
  return cart;
};
```

## Testing

### 1. Test Cases cho Cart UUID

- Test tạo mới cart_uuid khi chưa có
- Test sử dụng cart_uuid có sẵn
- Test cart_uuid được lưu đúng trong localStorage
- Test cart_uuid không bị thay đổi khi reload trang

### 2. Test Cases cho Cart Operations

- Test thêm sản phẩm vào giỏ hàng
- Test cập nhật số lượng sản phẩm
- Test xóa sản phẩm khỏi giỏ hàng
- Test áp dụng mã giảm giá
- Test xóa mã giảm giá
- Test tạo đơn hàng từ giỏ

### 3. Error Handling Tests

- Test khi cart_uuid không tồn tại
- Test khi sản phẩm hết hàng
- Test khi mã giảm giá không hợp lệ
- Test khi API trả về lỗi 500

## Migration từ Session ID sang UUID

Nếu bạn đang có code cũ sử dụng session_id, đây là cách migrate:

```javascript
// Migration script
const migrateFromSessionIdToUuid = () => {
  const oldSessionId = sessionStorage.getItem('session_id');
  
  if (oldSessionId && !localStorage.getItem('cart_uuid')) {
    // Tạo UUID mới
    const newCartUuid = generateUUID();
    localStorage.setItem('cart_uuid', newCartUuid);
    
    // Gọi API để merge cart cũ với cart mới (nếu có endpoint hỗ trợ)
    // cartApi.mergeCarts(oldSessionId, newCartUuid);
    
    // Xóa session_id cũ
    sessionStorage.removeItem('session_id');
  }
};
```

## Kết luận

Việc chuyển đổi từ session_id sang cart_uuid mang lại nhiều lợi ích về độ ổn định và trải nghiệm người dùng. Hãy đảm bảo team Frontend hiểu rõ các thay đổi và áp dụng đúng best practices để có hiệu suất tốt nhất.

Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ team Backend để được hỗ trợ!