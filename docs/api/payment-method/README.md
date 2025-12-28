# Payment Method Module API Documentation

Module quản lý các phương thức thanh toán.

## 📂 Cấu trúc Module

```
src/modules/payment-method/
├── admin/              # Admin APIs
│   └── payment-method/
└── public/             # Public APIs
    └── payment-method/
```

---

## 🔐 Admin APIs

APIs dành cho quản trị viên - yêu cầu authentication và permissions.

### Payment Methods
- **GET** `/admin/payment-methods` - Danh sách phương thức
- **GET** `/admin/payment-methods/:id` - Chi tiết phương thức
- **POST** `/admin/payment-methods` - Tạo phương thức mới
- **PATCH** `/admin/payment-methods/:id` - Cập nhật phương thức
- **DELETE** `/admin/payment-methods/:id` - Xóa phương thức
- **PATCH** `/admin/payment-methods/:id/restore` - Khôi phục phương thức

📖 [Chi tiết Admin Payment Methods API](./admin/payment-method.md)

---

## 🌐 Public APIs

APIs công khai - không yêu cầu authentication.

### Payment Methods
- **GET** `/payment-methods` - Danh sách phương thức đang hoạt động
- **GET** `/payment-methods/:code` - Chi tiết phương thức theo code
- **POST** `/payment-methods/check-availability` - Kiểm tra khả dụng

📖 [Chi tiết Public Payment Methods API](./public/payment-method.md)

---

## 📊 Data Model

```typescript
{
  id: number
  name: string
  code: string  // unique: bank_transfer, vnpay, momo, cod, etc.
  description?: string
  is_active: boolean
  display_order: number
  icon?: string
  config?: {
    // Tùy thuộc vào từng phương thức
    [key: string]: any
  }
  created_at: Date
  updated_at: Date
  deleted_at?: Date
}
```

---

## 💳 Supported Payment Methods

### 1. Bank Transfer (Chuyển khoản ngân hàng)
**Code:** `bank_transfer`

**Config:**
```json
{
  "bank_name": "Vietcombank",
  "account_number": "1234567890",
  "account_holder": "CÔNG TY ABC",
  "branch": "Chi nhánh Hà Nội"
}
```

**Features:**
- Không phí giao dịch
- Thời gian xử lý: 1-2 giờ
- Yêu cầu xác nhận chuyển khoản

---

### 2. VNPay
**Code:** `vnpay`

**Config:**
```json
{
  "tmn_code": "YOUR_TMN_CODE",
  "hash_secret": "YOUR_HASH_SECRET",
  "return_url": "https://yoursite.com/payment/vnpay/return"
}
```

**Features:**
- Thanh toán trực tuyến
- Hỗ trợ ATM, Visa, MasterCard
- Bảo mật 3D Secure
- Phí: 0% (shop chịu)

---

### 3. MoMo
**Code:** `momo`

**Config:**
```json
{
  "partner_code": "MOMO_PARTNER",
  "access_key": "YOUR_ACCESS_KEY",
  "secret_key": "YOUR_SECRET_KEY",
  "redirect_url": "https://yoursite.com/payment/momo/return"
}
```

**Features:**
- Ví điện tử MoMo
- QR Code payment
- Ưu đãi hoàn tiền
- Thanh toán nhanh

---

### 4. COD (Cash on Delivery)
**Code:** `cod`

**Config:**
```json
{
  "max_amount": 5000000,
  "fee": 20000,
  "supported_provinces": ["Hà Nội", "TP.HCM"]
}
```

**Features:**
- Thanh toán khi nhận hàng
- Không cần thẻ ngân hàng
- Phí COD: 0-20.000đ
- Giới hạn: 5 triệu đồng

---

## 🔄 Payment Flow

### Online Payment (VNPay/MoMo)
```
1. User chọn phương thức thanh toán
   ↓
2. Tạo đơn hàng
   ↓
3. Tạo payment URL
   POST /payment/create-url
   {
     "order_id": 123,
     "payment_method": "vnpay",
     "amount": 1000000
   }
   ↓
4. Redirect to payment gateway
   ↓
5. User nhập thông tin & xác thực
   ↓
6. Payment gateway xử lý
   ↓
7. Redirect về return_url
   ↓
8. Verify payment result
   ↓
9. Update order status
   ↓
10. Send confirmation email
```

### Bank Transfer Flow
```
1. User chọn chuyển khoản
   ↓
2. Hiển thị thông tin tài khoản
   ↓
3. User chuyển khoản
   ↓
4. User upload ảnh xác nhận (optional)
   ↓
5. Admin xác nhận thanh toán
   ↓
6. Update order status
   ↓
7. Send confirmation email
```

### COD Flow
```
1. User chọn COD
   ↓
2. Kiểm tra khả dụng
   ↓
3. Tạo đơn hàng
   ↓
4. Chuẩn bị & giao hàng
   ↓
5. Shipper thu tiền
   ↓
6. Xác nhận hoàn thành
```

---

## ✨ Features

- ✅ Multi payment gateway support
- ✅ Payment method configuration
- ✅ Active/Inactive management
- ✅ Display order control
- ✅ Availability checking
- ✅ Payment verification
- ✅ Soft delete support

---

## 🎯 Use Cases

### Admin: Thêm phương thức thanh toán mới
```bash
POST /admin/payment-methods
{
  "name": "ZaloPay",
  "code": "zalopay",
  "description": "Thanh toán qua ZaloPay",
  "is_active": true,
  "display_order": 4,
  "config": {
    "app_id": "YOUR_APP_ID",
    "key": "YOUR_KEY"
  }
}
```

### Admin: Cập nhật cấu hình
```bash
PATCH /admin/payment-methods/1
{
  "is_active": false,
  "config": {
    "tmn_code": "NEW_TMN_CODE"
  }
}
```

### Public: Lấy danh sách phương thức
```bash
GET /payment-methods
```

### Public: Kiểm tra khả dụng
```bash
POST /payment-methods/check-availability
{
  "payment_method_code": "cod",
  "order_amount": 6000000,
  "shipping_address": {
    "province": "Hà Nội"
  }
}
```

---

## 🔒 Security

### Config Encryption
Thông tin nhạy cảm trong config (API keys, secrets) được mã hóa:
- Hash secrets
- Access keys
- Partner codes

### Validation
- Verify payment signatures
- Check transaction authenticity
- Validate return URLs
- Prevent replay attacks

---

## 📝 Best Practices

1. **Luôn kiểm tra khả dụng** trước khi cho phép chọn phương thức
2. **Verify payment result** từ gateway trước khi cập nhật đơn hàng
3. **Log tất cả transactions** để debug và audit
4. **Handle errors gracefully** khi payment fails
5. **Notify users** về trạng thái thanh toán

---

**Xem thêm:**
- [Main API Documentation](../README.md)
- [E-commerce Module](../ecommerce/README.md)
- [Order Management](../ecommerce/README.md#orders)