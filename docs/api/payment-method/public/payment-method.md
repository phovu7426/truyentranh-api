# Public Payment Methods API

API công khai cho phương thức thanh toán (payment methods) - không yêu cầu authentication.

## Cấu trúc

- Base URL: `http://localhost:3000/api`
- Authentication: Không yêu cầu
- Headers: `Content-Type: application/json`

---

## 1. Get Payment Methods List (Lấy danh sách phương thức thanh toán)

Lấy danh sách các phương thức thanh toán đang hoạt động.

### Request

```bash
curl -X GET http://localhost:3000/api/public/payment-methods \
  -H "Content-Type: application/json"
```

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
      "icon": "https://example.com/bank-icon.png",
      "display_order": 1,
      "config": {
        "bank_name": "Vietcombank",
        "account_number": "1234567890",
        "account_holder": "CÔNG TY ABC",
        "branch": "Chi nhánh Hà Nội"
      }
    },
    {
      "id": 2,
      "name": "VNPay",
      "code": "vnpay",
      "description": "Thanh toán qua cổng VNPay (Thẻ ATM, Visa, MasterCard)",
      "icon": "https://example.com/vnpay-icon.png",
      "display_order": 2,
      "supports": [
        "atm_card",
        "credit_card",
        "debit_card"
      ]
    },
    {
      "id": 3,
      "name": "MoMo",
      "code": "momo",
      "description": "Thanh toán qua ví điện tử MoMo",
      "icon": "https://example.com/momo-icon.png",
      "display_order": 3,
      "supports": [
        "momo_wallet",
        "qr_code"
      ]
    },
    {
      "id": 4,
      "name": "Tiền mặt (COD)",
      "code": "cod",
      "description": "Thanh toán khi nhận hàng",
      "icon": "https://example.com/cod-icon.png",
      "display_order": 4,
      "extra_fee": 0,
      "extra_fee_type": "fixed"
    }
  ]
}
```

---

## 2. Get Payment Method by ID (Lấy thông tin phương thức thanh toán)

### Request

```bash
curl -X GET http://localhost:3000/api/public/payment-methods/1 \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "VNPay",
    "code": "vnpay",
    "description": "Thanh toán qua cổng VNPay. Hỗ trợ thẻ ATM nội địa, thẻ Visa, MasterCard, JCB",
    "icon": "https://example.com/vnpay-icon.png",
    "display_order": 2,
    "supports": [
      "atm_card",
      "credit_card",
      "debit_card"
    ],
    "payment_flow": [
      "Chọn phương thức thanh toán VNPay",
      "Nhập thông tin đơn hàng",
      "Chuyển đến cổng thanh toán VNPay",
      "Nhập thông tin thẻ/tài khoản",
      "Xác nhận OTP",
      "Hoàn tất thanh toán"
    ],
    "supported_banks": [
      {
        "code": "VCB",
        "name": "Vietcombank"
      },
      {
        "code": "TCB",
        "name": "Techcombank"
      },
      {
        "code": "MB",
        "name": "MB Bank"
      }
    ]
  },
  "message": "Thành công"
}
```

---

## 3. Check Payment Method Availability (Kiểm tra khả dụng)

Kiểm tra xem phương thức thanh toán có khả dụng cho đơn hàng không.

### Request

```bash
curl -X POST http://localhost:3000/api/public/payment-methods/check-availability \
  -H "Content-Type: application/json" \
  -d '{
    "payment_method_code": "vnpay",
    "order_amount": 1000000,
    "shipping_address": {
      "province": "Hà Nội",
      "district": "Cầu Giấy"
    }
  }'
```

### Request Body

```json
{
  "payment_method_code": "vnpay",
  "order_amount": 1000000,
  "shipping_address": {
    "province": "Hà Nội",
    "district": "Cầu Giấy"
  }
}
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "available": true,
    "payment_method": {
      "id": 2,
      "name": "VNPay",
      "code": "vnpay"
    },
    "extra_fee": 0,
    "total_amount": 1000000,
    "message": "Phương thức thanh toán khả dụng"
  }
}
```

**Không khả dụng:**
```json
{
  "success": true,
  "data": {
    "available": false,
    "reason": "COD không hỗ trợ đơn hàng trên 5.000.000đ",
    "alternative_methods": [
      {
        "code": "vnpay",
        "name": "VNPay"
      },
      {
        "code": "bank_transfer",
        "name": "Chuyển khoản ngân hàng"
      }
    ]
  }
}
```

---

## Payment Method Details

### Bank Transfer (Chuyển khoản ngân hàng)

**Code:** `bank_transfer`

**Features:**
- Không tốn phí giao dịch
- Thời gian xử lý: 1-2 giờ (trong giờ làm việc)
- Yêu cầu xác nhận chuyển khoản

**Config hiển thị:**
```json
{
  "bank_name": "Vietcombank",
  "account_number": "1234567890",
  "account_holder": "CÔNG TY ABC",
  "branch": "Chi nhánh Hà Nội",
  "swift_code": "BFTVVNVX"
}
```

---

### VNPay

**Code:** `vnpay`

**Features:**
- Thanh toán trực tuyến ngay lập tức
- Hỗ trợ nhiều loại thẻ
- Bảo mật 3D Secure
- Phí giao dịch: 0% (shop chịu phí)

**Supported Cards:**
- Thẻ ATM nội địa
- Visa, MasterCard, JCB
- Thẻ ghi nợ quốc tế

---

### MoMo

**Code:** `momo`

**Features:**
- Thanh toán qua ví điện tử MoMo
- Thanh toán nhanh chóng
- Ưu đãi hoàn tiền từ MoMo
- Hỗ trợ QR Code

---

### COD (Cash on Delivery)

**Code:** `cod`

**Features:**
- Thanh toán khi nhận hàng
- Không cần thẻ ngân hàng
- Phí COD: 0-20.000đ (tùy khu vực)
- Giới hạn đơn hàng: Tối đa 5.000.000đ

**Restrictions:**
- Không áp dụng cho đơn hàng trên 5 triệu
- Một số khu vực xa không hỗ trợ

---

## Payment Flow

### VNPay/MoMo Flow

```
1. Khách hàng chọn phương thức thanh toán
   ↓
2. Tạo đơn hàng và yêu cầu thanh toán
   ↓
3. Chuyển hướng đến cổng thanh toán
   ↓
4. Khách hàng nhập thông tin và xác thực
   ↓
5. Xử lý thanh toán
   ↓
6. Nhận kết quả và cập nhật đơn hàng
   ↓
7. Thông báo cho khách hàng
```

### Bank Transfer Flow

```
1. Khách hàng chọn chuyển khoản
   ↓
2. Hiển thị thông tin tài khoản
   ↓
3. Khách hàng chuyển khoản
   ↓
4. Upload ảnh xác nhận (optional)
   ↓
5. Admin xác nhận thanh toán
   ↓
6. Cập nhật trạng thái đơn hàng
```

### COD Flow

```
1. Khách hàng chọn COD
   ↓
2. Tạo đơn hàng
   ↓
3. Chuẩn bị và giao hàng
   ↓
4. Shipper thu tiền khi giao
   ↓
5. Xác nhận đơn hàng hoàn thành
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 404 | Not Found - Payment method not found |
| 422 | Unprocessable Entity - Payment method not available |
| 500 | Internal Server Error |

---

**Xem thêm:**
- [Public Order API](./order.md)
- [Public Payment API](./payment.md)
- [User Payment API](./../user/payment.md)
- [Admin Payment Methods API](./../admin/payment-method.md)