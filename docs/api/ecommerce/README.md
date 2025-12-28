# E-commerce Module API Documentation

Module quản lý toàn bộ tính năng thương mại điện tử.

## 🚀 Quick Start cho Frontend

**[📘 Hướng dẫn tích hợp đầy đủ - CHECKOUT_INTEGRATION_GUIDE.md](../CHECKOUT_INTEGRATION_GUIDE.md)**

Complete checkout flow từ giỏ hàng → đặt hàng → thanh toán với React code examples chi tiết.

**Key Points:**
- ✅ Tất cả dùng `/api/public/*` APIs (cart, order, payment, shipping)
- ✅ Hỗ trợ cả guest và logged-in users
- ✅ VNPay payment integration với code samples
- ✅ Complete React component examples

## 📂 Cấu trúc Module

```
src/modules/ecommerce/
├── admin/              # Admin APIs
│   ├── product/
│   ├── product-category/
│   ├── product-variant/
│   ├── product-attribute-value/
│   ├── coupon/
│   ├── order/
│   ├── warehouse/
│   └── customer/
├── public/             # Public APIs
│   ├── product/
│   ├── product-category/
│   ├── cart/
│   ├── order/
│   ├── payment/
│   ├── discount/
│   ├── shipping-method/
│   └── shipping/
└── user/               # User APIs
    ├── product/
    ├── product-category/
    ├── cart/
    ├── order/
    ├── payment/
    ├── product-review/
    └── wishlist/
```

---

## 🔐 Admin APIs

APIs dành cho quản trị viên - yêu cầu authentication và permissions.

### Products (Sản phẩm)
- **GET** `/admin/products` - Danh sách sản phẩm
- **GET** `/admin/products/:id` - Chi tiết sản phẩm
- **POST** `/admin/products` - Tạo sản phẩm
- **PUT** `/admin/products/:id` - Cập nhật sản phẩm
- **DELETE** `/admin/products/:id` - Xóa sản phẩm

📖 [Chi tiết Admin Products API](./admin/product.md)

### Product Categories
- **GET** `/admin/product-categories` - Danh sách danh mục
- **GET** `/admin/product-categories/:id` - Chi tiết danh mục
- **POST** `/admin/product-categories` - Tạo danh mục
- **PUT** `/admin/product-categories/:id` - Cập nhật danh mục
- **DELETE** `/admin/product-categories/:id` - Xóa danh mục

📖 [Chi tiết Admin Product Categories API](./admin/product-category.md)

### Product Variants
- **GET** `/admin/product-variants` - Danh sách biến thể sản phẩm
- **GET** `/admin/product-variants/:id` - Chi tiết biến thể sản phẩm
- **GET** `/admin/product-variants/product/:productId` - Biến thể theo sản phẩm
- **GET** `/admin/product-variants/sku/:sku` - Biến thể theo SKU
- **POST** `/admin/product-variants/search` - Tìm kiếm biến thể
- **POST** `/admin/product-variants` - Tạo biến thể sản phẩm
- **PUT** `/admin/product-variants/:id` - Cập nhật biến thể sản phẩm
- **PUT** `/admin/product-variants/:id/restore` - Khôi phục biến thể
- **DELETE** `/admin/product-variants/:id` - Xóa biến thể sản phẩm

📖 [Chi tiết Admin Product Variants API](./admin/product-variant.md)

### Product Attribute Values
- **GET** `/admin/product-attribute-values` - Danh sách giá trị thuộc tính
- **GET** `/admin/product-attribute-values/:id` - Chi tiết giá trị thuộc tính
- **GET** `/admin/product-attribute-values/attribute/:attributeId` - Giá trị theo thuộc tính
- **POST** `/admin/product-attribute-values` - Tạo giá trị thuộc tính
- **PUT** `/admin/product-attribute-values/:id` - Cập nhật giá trị thuộc tính
- **PUT** `/admin/product-attribute-values/:id/restore` - Khôi phục giá trị thuộc tính
- **DELETE** `/admin/product-attribute-values/:id` - Xóa giá trị thuộc tính

📖 [Chi tiết Admin Product Attribute Values API](./admin/product-attribute-value.md)

### Coupons (Mã giảm giá)
- **GET** `/admin/coupons` - Danh sách mã giảm giá
- **GET** `/admin/coupons/:id` - Chi tiết mã giảm giá
- **GET** `/admin/coupons/:id/stats` - Thống kê sử dụng mã giảm giá
- **POST** `/admin/coupons` - Tạo mã giảm giá
- **PUT** `/admin/coupons/:id` - Cập nhật mã giảm giá
- **PUT** `/admin/coupons/:id/restore` - Khôi phục mã giảm giá
- **PUT** `/admin/coupons/:id/toggle-status` - Bật/tắt trạng thái
- **DELETE** `/admin/coupons/:id` - Xóa mã giảm giá

📖 [Chi tiết Admin Coupons API](./admin/coupon.md)

### Orders (Đơn hàng)
- **GET** `/admin/orders` - Danh sách đơn hàng
- **GET** `/admin/orders/:id` - Chi tiết đơn hàng
- **PATCH** `/admin/orders/:id/status` - Cập nhật trạng thái
- **PATCH** `/admin/orders/:id/cancel` - Hủy đơn hàng

📖 [Chi tiết Admin Orders API](./admin/order.md)

### Warehouses (Kho hàng)
- **GET** `/admin/warehouses` - Danh sách kho
- **GET** `/admin/warehouses/:id` - Chi tiết kho
- **GET** `/admin/warehouses/:id/inventory` - Tồn kho theo kho
- **POST** `/admin/warehouses` - Tạo kho mới
- **PUT** `/admin/warehouses/:id` - Cập nhật kho
- **DELETE** `/admin/warehouses/:id` - Xóa kho
- **PUT** `/admin/warehouses/inventory/update` - Cập nhật tồn kho
- **POST** `/admin/warehouses/transfers` - Tạo phiếu chuyển kho
- **GET** `/admin/warehouses/transfers/list` - Danh sách phiếu chuyển kho
- **PUT** `/admin/warehouses/transfers/:id/approve` - Duyệt phiếu chuyển kho
- **PUT** `/admin/warehouses/transfers/:id/complete` - Hoàn thành phiếu chuyển kho
- **PUT** `/admin/warehouses/transfers/:id/cancel` - Hủy phiếu chuyển kho

📖 [Chi tiết Admin Warehouses API](./admin/warehouse.md)

### Customers
- **GET** `/admin/customers` - Danh sách khách hàng
- **GET** `/admin/customers/:id` - Chi tiết khách hàng
- **GET** `/admin/customers/:id/orders` - Đơn hàng của khách

---

## 🌐 Public APIs

APIs công khai - không yêu cầu authentication.

### Products
- **GET** `/public/products` - Danh sách sản phẩm
- **GET** `/public/products/:slug` - Chi tiết sản phẩm
- **GET** `/public/products/featured` - Sản phẩm nổi bật
- **GET** `/public/products/:id/variants` - Biến thể sản phẩm

📖 [Chi tiết Public Products API](./public/product.md)

### Product Categories
- **GET** `/public/product-categories` - Danh sách danh mục
- **GET** `/public/product-categories/:slug` - Chi tiết danh mục
- **GET** `/public/product-categories/tree` - Cây danh mục
- **GET** `/public/product-categories/root` - Danh mục gốc
- **GET** `/public/product-categories/:id/products` - Sản phẩm theo danh mục
- **GET** `/public/product-categories/popular` - Danh mục phổ biến
- **GET** `/public/product-categories/search` - Tìm kiếm danh mục

📖 [Chi tiết Public Product Categories API](./public/product-category.md)

### Cart (Guest)
- **GET** `/public/cart` - Xem giỏ hàng
- **POST** `/public/cart/add` - Thêm vào giỏ
- **PUT** `/public/cart/update` - Cập nhật giỏ (method 1)
- **PUT** `/public/cart/items/:id` - Cập nhật item (method 2)
- **DELETE** `/public/cart/item/:id` - Xóa khỏi giỏ
- **DELETE** `/public/cart/clear` - Xóa toàn bộ giỏ

📖 [Chi tiết Public Cart API](./public/cart.md)

### Orders
- **GET** `/public/orders` - Danh sách đơn hàng
- **GET** `/public/orders/:id` - Chi tiết đơn hàng
- **POST** `/public/orders` - Tạo đơn hàng (từ cart)
- **PUT** `/public/orders/:id/cancel` - Hủy đơn hàng

📖 [Chi tiết Public Order API](./public/order.md)

### Payments
- **GET** `/public/payments` - Danh sách thanh toán
- **GET** `/public/payments/:id` - Chi tiết thanh toán
- **POST** `/public/payments` - Tạo thanh toán
- **POST** `/public/payments/create-url` - Tạo URL thanh toán
- **GET** `/public/payments/verify/:gateway` - Verify payment
- **POST** `/public/payments/webhook/:gateway` - Payment webhook

📖 [Chi tiết Public Payment API](./public/payment.md)

### Discounts
- **GET** `/public/discounts/coupons/available` - Danh sách mã giảm giá khả dụng
- **POST** `/public/discounts/apply-coupon` - Áp dụng mã giảm giá vào giỏ hàng
- **DELETE** `/public/discounts/remove-coupon/:cart_id` - Xóa mã giảm giá khỏi giỏ hàng
- **POST** `/public/discounts/validate-coupon` - Kiểm tra tính hợp lệ của mã giảm giá

📖 [Chi tiết Public Discount API](./public/discount.md)

### Shipping Methods
- **GET** `/public/shipping-methods` - Danh sách phương thức vận chuyển
- **GET** `/public/shipping-methods/active` - Phương thức đang hoạt động
- **GET** `/public/shipping-methods/available` - Phương thức khả dụng
- **GET** `/public/shipping-methods/:id` - Chi tiết phương thức
- **POST** `/public/shipping-methods/calculate` - Tính phí vận chuyển

📖 [Chi tiết Public Shipping Methods API](./public/shipping-method.md)

### Shipping Tracking
- **GET** `/public/tracking/order/:orderId` - Theo dõi đơn hàng
- **GET** `/public/tracking/number/:trackingNumber` - Theo dõi theo mã vận đơn
- **GET** `/public/tracking/live/:trackingNumber` - Theo dõi real-time
- **POST** `/public/tracking/webhook/:provider` - Webhook từ nhà cung cấp

📖 [Chi tiết Public Shipping Tracking API](./public/shipping-tracking.md)

### Product Reviews
- **GET** `/public/product-reviews` - Danh sách đánh giá sản phẩm
- **GET** `/public/product-reviews/product/:productId/stats` - Thống kê đánh giá sản phẩm
- **POST** `/public/product-reviews/:id/helpful` - Đánh giá review hữu ích

📖 [Chi tiết Public Product Reviews API](./public/product-review.md)

---

## 👤 User APIs

APIs dành cho người dùng đã đăng nhập.

### Products
- **GET** `/user/products` - Danh sách sản phẩm (với thông tin cá nhân hóa)
- **GET** `/user/products/:idOrSlug` - Chi tiết sản phẩm (với thông tin cá nhân hóa)
- **POST** `/user/products/:id/wishlist` - Thêm vào danh sách yêu thích
- **DELETE** `/user/products/:id/wishlist` - Xóa khỏi danh sách yêu thích
- **GET** `/user/products/wishlist` - Danh sách yêu thích
- **GET** `/user/products/purchased` - Lịch sử mua hàng
- **GET** `/user/products/recommended` - Sản phẩm gợi ý
- **POST** `/user/products/:id/track-view` - Theo dõi xem sản phẩm

📖 [Chi tiết User Products API](./user/product.md)

### Product Categories
- **GET** `/user/product-categories` - Danh sách danh mục (với thống kê user)
- **GET** `/user/product-categories/:idOrSlug` - Chi tiết danh mục (với thống kê user)
- **GET** `/user/product-categories/tree` - Cây danh mục (với thống kê user)
- **GET** `/user/product-categories/:idOrSlug/products` - Sản phẩm theo danh mục
- **GET** `/user/product-categories/favorites` - Danh mục yêu thích
- **GET** `/user/product-categories/recommended` - Danh mục gợi ý
- **POST** `/user/product-categories/:id/track-view` - Theo dõi xem danh mục

📖 [Chi tiết User Product Categories API](./user/product-category.md)

### Cart
**Recommend:** Sử dụng Public Cart API (`/api/public/cart`) cho cả guest và logged-in users.
- Tự động xử lý authentication
- Auto merge cart khi login
- Đơn giản hơn cho frontend

📖 [Chi tiết Public Cart API](./public/cart.md)

### Orders
**Recommend:** Sử dụng Public Order API (`/api/public/orders`) cho cả guest và logged-in users.
- **GET** `/public/orders` - Danh sách đơn hàng
- **GET** `/public/orders/:id` - Chi tiết đơn hàng
- **POST** `/public/orders` - Tạo đơn hàng (từ cart)
- **PUT** `/public/orders/:id/cancel` - Hủy đơn hàng

📖 [Chi tiết Public Order API](./public/order.md)

### Payments
**Recommend:** Sử dụng Public Payment API (`/api/public/payments`) cho cả guest và logged-in users.
- **GET** `/public/payments` - Danh sách thanh toán
- **GET** `/public/payments/:id` - Chi tiết thanh toán
- **POST** `/public/payments` - Tạo thanh toán
- **POST** `/public/payments/create-url` - Tạo URL thanh toán
- **GET** `/public/payments/verify/:gateway` - Verify payment
- **POST** `/public/payments/webhook/:gateway` - Payment webhook

📖 [Chi tiết Public Payment API](./public/payment.md)

### Shipping Methods
- **GET** `/user/shipping-methods` - Danh sách phương thức vận chuyển
- **GET** `/user/shipping-methods/active` - Phương thức đang hoạt động
- **GET** `/user/shipping-methods/available` - Phương thức khả dụng
- **GET** `/user/shipping-methods/:id` - Chi tiết phương thức
- **POST** `/user/shipping-methods/calculate` - Tính phí vận chuyển

📖 [Chi tiết User Shipping Methods API](./user/shipping-method.md)

### Product Reviews
- **GET** `/user/reviews` - Đánh giá của tôi
- **POST** `/user/reviews` - Tạo đánh giá
- **PUT** `/user/reviews/:id` - Cập nhật đánh giá
- **DELETE** `/user/reviews/:id` - Xóa đánh giá
- **POST** `/user/reviews/:id/helpful` - Đánh dấu hữu ích

📖 [Chi tiết User Product Reviews API](./user/product-review.md)

---

## 📊 Data Models

### Product
```typescript
{
  id: number
  name: string
  slug: string
  sku: string
  description: string
  price: number
  sale_price?: number
  stock_quantity: number
  status: 'active' | 'inactive' | 'out_of_stock'
  featured_image?: string
  images: string[]
  categories: Category[]
  variants: ProductVariant[]
  average_rating: number
  review_count: number
  created_at: Date
  updated_at: Date
}
```

### Product Variant
```typescript
{
  id: number
  product_id: number
  sku: string
  price: number
  stock_quantity: number
  attributes: {
    name: string
    value: string
  }[]
}
```

### Order
```typescript
{
  id: number
  order_code: string
  user_id: number
  status: OrderStatus
  total_amount: number
  shipping_address: Address
  payment_method: string
  payment_status: PaymentStatus
  items: OrderItem[]
  created_at: Date
  updated_at: Date
}
```

### Cart
```typescript
{
  id: number
  user_id?: number
  session_id?: string
  items: CartItem[]
  total_amount: number
  created_at: Date
  updated_at: Date
}
```

---

## 🔄 Complete E-commerce Flow

### Guest Shopping Flow

```
1. Duyệt sản phẩm
   GET /api/public/products
   ↓
2. Xem chi tiết sản phẩm
   GET /api/public/products/:slug
   ↓
3. Thêm vào giỏ hàng (guest cart)
   POST /api/public/cart/add
   {
     "product_variant_id": 1,
     "quantity": 2,
     "session_id": "guest_abc123"
   }
   ↓
4. Xem & cập nhật giỏ hàng
   GET /api/public/cart?session_id=guest_abc123
   PUT /api/public/cart/items/1?session_id=guest_abc123
   ↓
5. Đăng nhập (optional - cart sẽ được merge)
   POST /api/auth/login
   ↓
6. Xem lại giỏ hàng (nếu đã login)
   GET /api/public/cart
```

### Logged-in User Shopping Flow

```
1. Duyệt sản phẩm
   GET /api/public/products
   ↓
2. Thêm vào giỏ hàng (với JWT token)
   POST /api/public/cart/add
   Header: Authorization: Bearer YOUR_JWT_TOKEN
   {
     "product_variant_id": 1,
     "quantity": 2
   }
   ↓
3. Thêm nhiều sản phẩm
   POST /api/public/cart/add (repeat với JWT token)
   ↓
4. Xem & cập nhật giỏ hàng
   GET /api/public/cart
   Header: Authorization: Bearer YOUR_JWT_TOKEN
   
   PUT /api/public/cart/items/1
   Header: Authorization: Bearer YOUR_JWT_TOKEN
   { "quantity": 3 }
   ↓
5. Xem phương thức vận chuyển khả dụng
   GET /api/user/shipping-methods/available
   ↓
6. Tính phí vận chuyển
   POST /api/user/shipping-methods/calculate
   {
     "shipping_method_id": 1,
     "shipping_address": { ... }
   }
   ↓
7. Xem phương thức thanh toán
   GET /api/public/payment-methods
   ↓
8. Đặt hàng (tạo order từ cart)
   POST /api/public/orders
   {
     "shipping_address": { ... },
     "shipping_method_id": 1,
     "payment_method_id": 1,
     "notes": "Giao giờ hành chính"
   }
   Response: { order, payment_url }
   ↓
9. Thanh toán (nếu cần redirect)
   Redirect to payment_url
   hoặc COD (thanh toán khi nhận hàng)
   ↓
10. Payment Gateway xử lý
    Payment Gateway → Webhook
    POST /api/public/payments/webhook/confirm
    ↓
11. Xác nhận đơn hàng
    GET /api/public/orders/:id
    ↓
12. Theo dõi đơn hàng
    GET /api/public/orders/:id (poll để cập nhật status)
    ↓
13. Nhận hàng & hoàn thành
    Order status: delivered → completed
    ↓
14. Đánh giá sản phẩm (optional)
    POST /api/user/reviews
    {
      "product_id": 1,
      "rating": 5,
      "comment": "Sản phẩm tuyệt vời!"
    }
```

### Order Cancellation Flow

```
1. Xem đơn hàng của tôi
   GET /api/public/orders
   Header: Authorization: Bearer YOUR_JWT_TOKEN
   ↓
2. Chọn đơn hàng cần hủy (status: pending/confirmed)
   GET /api/public/orders/:id
   Header: Authorization: Bearer YOUR_JWT_TOKEN
   ↓
3. Hủy đơn hàng
   PUT /api/public/orders/:id/cancel
   Header: Authorization: Bearer YOUR_JWT_TOKEN
```

### Payment Flow Details

```
┌─────────────────┐
│  Create Order   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Auto Create     │
│ Payment Record  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ↓         ↓
┌─────┐   ┌──────┐
│ COD │   │ VNPay│
└──┬──┘   └───┬──┘
   │          │
   │          ↓
   │     Redirect to
   │     Payment Gateway
   │          │
   │          ↓
   │     User pays
   │          │
   │          ↓
   │     Gateway Callback
   │          │
   └────┬─────┘
        ↓
   Update Payment
   Status: completed
        │
        ↓
   Update Order
   Status: confirmed
```

---

## 📦 Order Status

- `pending` - Chờ xác nhận
- `confirmed` - Đã xác nhận
- `processing` - Đang xử lý
- `shipping` - Đang giao hàng
- `delivered` - Đã giao hàng
- `completed` - Hoàn thành
- `cancelled` - Đã hủy
- `refunded` - Đã hoàn tiền

---

## 💳 Payment Status

- `pending` - Chờ thanh toán
- `processing` - Đang xử lý
- `completed` - Đã thanh toán
- `failed` - Thanh toán thất bại
- `refunded` - Đã hoàn tiền

---

## ✨ Features

### Products
- ✅ Product variants (color, size, etc.)
- ✅ Inventory management
- ✅ Price management (regular & sale)
- ✅ Image gallery
- ✅ SEO metadata
- ✅ Product reviews & ratings
- ✅ Related products

### Orders
- ✅ Order management
- ✅ Order tracking
- ✅ Order status updates
- ✅ Email notifications
- ✅ Invoice generation

### Cart
- ✅ Guest cart (session-based)
- ✅ User cart (persistent)
- ✅ Cart synchronization
- ✅ Quantity updates
- ✅ Price calculations

### Reviews
- ✅ Star ratings (1-5)
- ✅ Review images
- ✅ Verified purchase badge
- ✅ Helpful votes
- ✅ Review moderation

---

## 🎯 Complete Use Cases

### Use Case 1: Guest mua hàng và chuyển thành User

```bash
# 1. Guest browse products
GET /api/public/products?page=1&limit=20

# 2. Guest add to cart
POST /api/public/cart/add
{
  "product_variant_id": 1,
  "quantity": 2,
  "session_id": "guest_abc123"
}

# 3. Guest xem cart
GET /api/public/cart?session_id=guest_abc123

# 4. Guest quyết định đăng ký/đăng nhập
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Nguyễn Văn A"
}

# 5. Login (cart sẽ tự động merge)
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# 6. Xem cart đã merged
GET /api/public/cart
# Cart của guest đã được merge vào cart của user

# 7. Tiếp tục checkout như logged-in user
POST /api/public/orders
{
  "shipping_address": {...},
  "shipping_method_id": 1,
  "payment_method_id": 1
}
```

### Use Case 2: User mua nhiều sản phẩm cùng lúc

```bash
# 1. Thêm sản phẩm 1
POST /api/public/cart/add
{
  "product_variant_id": 1,
  "quantity": 2
}

# 2. Thêm sản phẩm 2
POST /api/public/cart/add
{
  "product_variant_id": 5,
  "quantity": 1
}

# 3. Thêm sản phẩm 3
POST /api/public/cart/add
{
  "product_variant_id": 10,
  "quantity": 3
}

# 4. Xem giỏ hàng (3 sản phẩm khác nhau)
GET /api/public/cart

# 5. Cập nhật số lượng sản phẩm 1
PUT /api/public/cart/items/1
{
  "quantity": 5
}

# 6. Xóa sản phẩm 2
DELETE /api/public/cart/item/2

# 7. Tính phí ship
POST /api/user/shipping-methods/calculate
{
  "shipping_method_id": 1,
  "shipping_address": {
    "city": "Quận 1",
    "state": "TP. Hồ Chí Minh"
  }
}

# 8. Đặt tất cả sản phẩm trong giỏ (2 sản phẩm còn lại)
POST /api/public/orders
{
  "shipping_address": {
    "name": "Nguyễn Văn A",
    "phone": "0901234567",
    "address": "123 Đường ABC",
    "district": "Quận 1",
    "city": "TP. Hồ Chí Minh"
  },
  "shipping_method_id": 1,
  "payment_method_id": 1
}

# Response sẽ bao gồm:
# - order với 2 order items (sản phẩm 1 và 3)
# - payment_url để thanh toán (nếu cần)
```

### Use Case 3: So sánh phí vận chuyển

```bash
# 1. Xem cart
GET /api/public/cart

# 2. Xem tất cả phương thức vận chuyển khả dụng
GET /api/user/shipping-methods/available

# Response:
{
  "available_methods": [
    {
      "id": 1,
      "name": "Giao hàng nhanh",
      "calculated_cost": "35000",
      "estimated_days": "2-3"
    },
    {
      "id": 2,
      "name": "Giao hàng tiết kiệm",
      "calculated_cost": "20000",
      "estimated_days": "5-7"
    },
    {
      "id": 3,
      "name": "Giao hàng hỏa tốc",
      "calculated_cost": "50000",
      "estimated_days": "1"
    }
  ]
}

# 3. User chọn phương thức phù hợp và đặt hàng
POST /api/public/orders
{
  "shipping_method_id": 2,  # Chọn tiết kiệm
  ...
}
```

### Use Case 4: Review sản phẩm sau khi mua

```bash
# 1. Kiểm tra đơn hàng đã delivered
GET /api/user/orders/123

# 2. Tạo review
POST /api/user/reviews
{
  "product_id": 1,
  "rating": 5,
  "comment": "Sản phẩm rất tốt, giao hàng nhanh!",
  "images": [
    "https://example.com/review-image-1.jpg",
    "https://example.com/review-image-2.jpg"
  ]
}

# 3. Xem review của mình
GET /api/user/reviews

# 4. Cập nhật review (nếu cần)
PUT /api/user/reviews/456
{
  "rating": 4,
  "comment": "Sản phẩm tốt nhưng hơi đắt"
}
```

### Use Case 5: Hủy đơn và hoàn tiền

```bash
# 1. Xem đơn hàng
GET /api/public/orders/123

# 2. Hủy đơn (chỉ khi status = pending/confirmed)
PUT /api/public/orders/123/cancel
{
  "reason": "Đặt nhầm sản phẩm"
}

# 3. Kiểm tra payment
GET /api/public/payments?order_id=123

# 4. Yêu cầu hoàn tiền (nếu đã thanh toán)
PATCH /api/public/payments/456/refund
{
  "reason": "Đơn hàng đã bị hủy"
}

# 5. Kiểm tra trạng thái hoàn tiền
GET /api/public/payments/456
```

---

**Xem thêm:**
- [Main API Documentation](../README.md)
- [Payment Method Module](../payment-method/README.md)