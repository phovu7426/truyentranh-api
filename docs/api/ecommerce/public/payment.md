# Public Payment API - Thanh toán

API xử lý thanh toán cho **CẢ guest users và logged-in users**.

## Cấu trúc

- Base URL: `http://localhost:3000/api/public/payments`
- Authentication: **Optional** (hỗ trợ cả guest và logged-in)
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_JWT_TOKEN` (optional)

---

## 🔄 Payment Flow

```
1. Tạo đơn hàng (Order)
   ↓
2. Hệ thống tự động tạo Payment
   ↓
3. Nếu cần redirect → Payment Gateway
   ↓
4. User thanh toán tại Gateway
   ↓
5. Gateway callback → Webhook
   ↓
6. Update payment status
   ↓
7. Xác nhận đơn hàng
```

---

## 1. Get Payments (Danh sách thanh toán)

Lấy danh sách tất cả giao dịch thanh toán.

### Endpoint
```
GET /api/public/payments
```

### Query Parameters
| Tham số | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---------|------|----------|----------|-------|
| page | number | No | 1 | Trang hiện tại |
| limit | number | No | 10 | Số bản ghi mỗi trang |
| status | string | No | - | Lọc theo trạng thái |

### Status Values
- `pending` - Chờ thanh toán
- `processing` - Đang xử lý
- `completed` - Đã thanh toán thành công
- `failed` - Thanh toán thất bại
- `refunded` - Đã hoàn tiền

### Request Example

```bash
# Logged-in user
curl -X GET "http://localhost:3000/api/public/payments?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Lọc theo trạng thái
curl -X GET "http://localhost:3000/api/public/payments?status=completed" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy danh sách thanh toán thành công",
  "data": {
    "payments": [
      {
        "id": 456,
        "order_id": 123,
        "order_code": "ORD-20250116-001",
        "payment_method_id": 1,
        "payment_method": {
          "id": 1,
          "name": "VNPay",
          "code": "vnpay",
          "logo": "https://example.com/vnpay-logo.png"
        },
        "transaction_id": "PAY-20250116-456",
        "gateway_transaction_id": "VNP123456789",
        "amount": "60010000",
        "currency": "VND",
        "status": "completed",
        "payment_date": "2025-01-16T10:35:00Z",
        "created_at": "2025-01-16T10:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 25,
      "total_pages": 3
    }
  }
}
```

---

## 2. Get Payment Detail (Chi tiết thanh toán)

Lấy thông tin chi tiết của một giao dịch thanh toán.

### Endpoint
```
GET /api/public/payments/:id
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của payment |

### Request Example

```bash
curl -X GET "http://localhost:3000/api/public/payments/456" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy chi tiết thanh toán thành công",
  "data": {
    "id": 456,
    "order_id": 123,
    "order": {
      "id": 123,
      "order_code": "ORD-20250116-001",
      "status": "confirmed",
      "total_amount": "60010000"
    },
    "payment_method_id": 1,
    "payment_method": {
      "id": 1,
      "name": "VNPay",
      "code": "vnpay",
      "description": "Thanh toán qua VNPay",
      "logo": "https://example.com/vnpay-logo.png"
    },
    "transaction_id": "PAY-20250116-456",
    "gateway_transaction_id": "VNP123456789",
    "amount": "60010000",
    "currency": "VND",
    "status": "completed",
    "payment_date": "2025-01-16T10:35:00Z",
    "gateway_response": {
      "vnp_ResponseCode": "00",
      "vnp_TransactionStatus": "00",
      "vnp_Amount": "6001000000",
      "vnp_BankCode": "NCB"
    },
    "notes": "Thanh toán thành công",
    "created_at": "2025-01-16T10:30:00Z",
    "updated_at": "2025-01-16T10:35:00Z"
  }
}
```

---

## 3. Create Payment (Tạo thanh toán)

Tạo giao dịch thanh toán mới cho đơn hàng.

**Lưu ý:** Thông thường payment được tạo tự động khi tạo order. Endpoint này chỉ dùng khi cần tạo payment riêng.

### Endpoint
```
POST /api/public/payments
```

### Request Body
```json
{
  "order_id": 123,
  "payment_method_id": 1,
  "transaction_id": "TXN123456",
  "payment_gateway": "vnpay",
  "notes": "Thanh toán đơn hàng #ORD-20250116-001"
}
```

### Field Descriptions
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| order_id | number | Yes | ID của đơn hàng cần thanh toán |
| payment_method_id | number | Yes | ID phương thức thanh toán |
| transaction_id | string | No | Mã giao dịch từ gateway |
| payment_gateway | string | No | Tên payment gateway (vnpay, momo, etc.) |
| notes | string | No | Ghi chú |

### Request Example

```bash
curl -X POST "http://localhost:3000/api/public/payments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "order_id": 123,
    "payment_method_id": 1
  }'
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Tạo thanh toán thành công",
  "data": {
    "payment": {
      "id": 456,
      "order_id": 123,
      "payment_method_id": 1,
      "transaction_id": "PAY-20250116-456",
      "amount": "60010000",
      "currency": "VND",
      "status": "pending",
      "created_at": "2025-01-16T10:30:00Z"
    },
    "payment_url": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..."
  }
}
```

---

## 4. Create Payment URL (Tạo URL thanh toán)

Tạo URL thanh toán cho payment gateway (VNPay, MoMo, etc.)

### Endpoint
```
POST /api/public/payments/create-url
```

### Request Body
```json
{
  "payment_id": 456,
  "return_url": "http://yoursite.com/payment/return",
  "cancel_url": "http://yoursite.com/payment/cancel"
}
```

### Request Example

```bash
curl -X POST "http://localhost:3000/api/public/payments/create-url" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "payment_id": 456,
    "return_url": "http://localhost:3000/payment/return"
  }'
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Tạo URL thanh toán thành công",
  "data": {
    "payment_url": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=6001000000&vnp_Command=pay&...",
    "expires_at": "2025-01-16T10:45:00Z"
  }
}
```

---

## 5. Verify Payment (Xác thực thanh toán)

Verify payment từ payment gateway callback.

### Endpoint
```
GET /api/public/payments/verify/:gateway
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| gateway | string | Tên gateway (vnpay, momo, etc.) |

### Query Parameters
Các parameters từ payment gateway (VNPay example):
- vnp_Amount
- vnp_BankCode
- vnp_ResponseCode
- vnp_TransactionNo
- vnp_SecureHash
- etc.

### Request Example

```bash
# VNPay return
curl -X GET "http://localhost:3000/api/public/payments/verify/vnpay?vnp_Amount=6001000000&vnp_ResponseCode=00&vnp_TransactionNo=123456&vnp_SecureHash=..."
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Thanh toán thành công",
  "data": {
    "payment_id": 456,
    "order_id": 123,
    "order_code": "ORD-20250116-001",
    "status": "completed",
    "amount": "60010000",
    "transaction_id": "VNP123456789"
  }
}
```

**Error - Invalid Signature (400):**
```json
{
  "success": false,
  "message": "Chữ ký không hợp lệ",
  "code": "INVALID_SIGNATURE",
  "httpStatus": 400
}
```

---

## 6. Payment Webhook (Webhook từ Gateway)

Endpoint để payment gateway gửi kết quả thanh toán.

**Lưu ý:** Endpoint này được gọi bởi payment gateway, không phải frontend.

### Endpoint
```
POST /api/public/payments/webhook/:gateway
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| gateway | string | Tên gateway (vnpay, momo, etc.) |

### Request Body (VNPay example)
```json
{
  "vnp_Amount": "6001000000",
  "vnp_BankCode": "NCB",
  "vnp_ResponseCode": "00",
  "vnp_TransactionNo": "123456",
  "vnp_SecureHash": "...",
  "vnp_TxnRef": "PAY-20250116-456"
}
```

### Response

**Success (200):**
```json
{
  "RspCode": "00",
  "Message": "Confirm Success"
}
```

---

## 🎯 Payment Methods Integration

### VNPay Integration Flow

```javascript
// 1. Tạo đơn hàng
const orderResponse = await fetch('http://localhost:3000/api/public/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(orderData)
});

const orderData = await orderResponse.json();

// 2. Kiểm tra payment_url
if (orderData.data.payment?.payment_url) {
  // Lưu thông tin để xử lý khi return
  localStorage.setItem('payment_context', JSON.stringify({
    payment_id: orderData.data.payment.id,
    order_id: orderData.data.order.id,
    order_code: orderData.data.order.order_code
  }));
  
  // 3. Redirect đến VNPay
  window.location.href = orderData.data.payment.payment_url;
}
```

### Handle VNPay Return

```javascript
// Trang return URL (e.g., /payment/return)
const handlePaymentReturn = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const context = JSON.parse(localStorage.getItem('payment_context') || '{}');
  
  // Lấy response code từ VNPay
  const vnp_ResponseCode = urlParams.get('vnp_ResponseCode');
  
  if (vnp_ResponseCode === '00') {
    // Thanh toán thành công
    showSuccessNotification('Thanh toán thành công!');
    
    // Clear context
    localStorage.removeItem('payment_context');
    
    // Redirect đến trang order detail
    window.location.href = `/orders/${context.order_id}`;
  } else {
    // Thanh toán thất bại
    const errorMessages = {
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán.',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.',
      '99': 'Các lỗi khác'
    };
    
    const errorMessage = errorMessages[vnp_ResponseCode] || 'Thanh toán thất bại';
    showErrorNotification(errorMessage);
    
    // Redirect về trang order với thông báo lỗi
    window.location.href = `/orders/${context.order_id}?payment_failed=true`;
  }
};

// Gọi hàm khi trang load
handlePaymentReturn();
```

### COD (Cash on Delivery) Flow

```javascript
// COD không cần redirect, payment status = pending
const orderResponse = await fetch('http://localhost:3000/api/public/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    ...orderData,
    payment_method_id: 2 // COD
  })
});

const data = await orderResponse.json();

// Không có payment_url, hiển thị thành công ngay
showSuccess('Đặt hàng thành công! Thanh toán khi nhận hàng.');
window.location.href = `/orders/${data.data.order.id}`;
```

---

## 🎯 Payment Status Flow

```
┌─────────┐
│ pending │ (Chờ thanh toán)
└────┬────┘
     │
     ├────────────┐
     │            │
     ↓            ↓
┌────────────┐  ┌────────┐
│ processing │  │ failed │ (Thất bại)
└──────┬─────┘  └────────┘
       │
       ↓
┌───────────┐
│ completed │ (Thành công)
└─────┬─────┘
      │
      ↓ (nếu cần)
┌──────────┐
│ refunded │ (Đã hoàn tiền)
└──────────┘
```

---

## 📋 Complete Payment Integration Guide

### Setup 1: Configure Return URLs

```javascript
// config.js
export const PAYMENT_CONFIG = {
  returnUrl: `${window.location.origin}/payment/return`,
  cancelUrl: `${window.location.origin}/payment/cancel`,
  vnpay: {
    merchant: 'YOUR_MERCHANT_ID',
    secretKey: 'YOUR_SECRET_KEY'
  }
};
```

### Setup 2: Create Payment Service

```javascript
// paymentService.js
class PaymentService {
  async createOrder(orderData) {
    const response = await fetch('http://localhost:3000/api/public/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify(orderData)
    });
    
    return response.json();
  }
  
  async processPayment(orderResponse) {
    const { order, payment } = orderResponse.data;
    
    if (payment?.payment_url) {
      // Save context for return handling
      this.savePaymentContext({
        payment_id: payment.id,
        order_id: order.id,
        order_code: order.order_code,
        amount: order.total_amount
      });
      
      // Redirect to payment gateway
      window.location.href = payment.payment_url;
    } else {
      // COD or no redirect needed
      return { success: true, order };
    }
  }
  
  savePaymentContext(context) {
    localStorage.setItem('payment_context', JSON.stringify(context));
    localStorage.setItem('payment_timestamp', Date.now().toString());
  }
  
  getPaymentContext() {
    const context = localStorage.getItem('payment_context');
    const timestamp = localStorage.getItem('payment_timestamp');
    
    // Check if context is still valid (within 30 minutes)
    if (timestamp && Date.now() - parseInt(timestamp) > 30 * 60 * 1000) {
      this.clearPaymentContext();
      return null;
    }
    
    return context ? JSON.parse(context) : null;
  }
  
  clearPaymentContext() {
    localStorage.removeItem('payment_context');
    localStorage.removeItem('payment_timestamp');
  }
  
  getToken() {
    return localStorage.getItem('auth_token');
  }
}

export default new PaymentService();
```

### Setup 3: Payment Return Page

```javascript
// pages/PaymentReturn.jsx
import { useEffect, useState } from 'react';
import PaymentService from '../services/paymentService';

export default function PaymentReturn() {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Đang xử lý thanh toán...');
  
  useEffect(() => {
    handlePaymentReturn();
  }, []);
  
  const handlePaymentReturn = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const context = PaymentService.getPaymentContext();
    
    if (!context) {
      setStatus('error');
      setMessage('Phiên thanh toán không hợp lệ');
      return;
    }
    
    const responseCode = urlParams.get('vnp_ResponseCode');
    
    if (responseCode === '00') {
      setStatus('success');
      setMessage('Thanh toán thành công!');
      
      // Clear context
      PaymentService.clearPaymentContext();
      
      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = `/orders/${context.order_id}`;
      }, 2000);
    } else {
      setStatus('failed');
      setMessage(getVNPayErrorMessage(responseCode));
      
      // Redirect after 3 seconds
      setTimeout(() => {
        window.location.href = `/orders/${context.order_id}`;
      }, 3000);
    }
  };
  
  const getVNPayErrorMessage = (code) => {
    // Error messages map
    const messages = {
      '24': 'Bạn đã hủy giao dịch',
      '51': 'Tài khoản không đủ số dư',
      '65': 'Đã vượt quá hạn mức giao dịch',
      '75': 'Ngân hàng đang bảo trì',
      '99': 'Thanh toán thất bại'
    };
    return messages[code] || 'Thanh toán thất bại';
  };
  
  return (
    <div className="payment-result">
      {status === 'processing' && <LoadingSpinner />}
      {status === 'success' && <SuccessIcon />}
      {status === 'failed' && <ErrorIcon />}
      <p>{message}</p>
    </div>
  );
}
```

---

## 🎯 Error Handling

### Common Error Codes
| Code | HTTP Status | Mô tả |
|------|-------------|-------|
| PAYMENT_NOT_FOUND | 404 | Không tìm thấy giao dịch |
| PAYMENT_ALREADY_EXISTS | 400 | Đơn hàng đã có payment |
| INVALID_SIGNATURE | 400 | Chữ ký không hợp lệ |
| PAYMENT_EXPIRED | 400 | Phiên thanh toán đã hết hạn |
| GATEWAY_ERROR | 500 | Lỗi từ payment gateway |

---

## 📱 UI/UX Best Practices

### 1. Show Payment Progress
```jsx
<PaymentSteps>
  <Step completed>Tạo đơn hàng</Step>
  <Step active>Thanh toán</Step>
  <Step>Hoàn tất</Step>
</PaymentSteps>
```

### 2. Loading State
```jsx
{isProcessing && (
  <LoadingOverlay>
    <Spinner />
    <p>Đang chuyển đến trang thanh toán...</p>
    <p>Vui lòng không tắt trình duyệt</p>
  </LoadingOverlay>
)}
```

### 3. Payment Method Selection
```jsx
<PaymentMethods>
  {methods.map(method => (
    <PaymentOption 
      key={method.id}
      selected={selectedMethod === method.id}
      onClick={() => setSelectedMethod(method.id)}
    >
      <img src={method.logo} alt={method.name} />
      <span>{method.name}</span>
      {method.description && <small>{method.description}</small>}
    </PaymentOption>
  ))}
</PaymentMethods>
```

---

**Xem thêm:**
- [Payment Callback Guide](./PAYMENT_CALLBACK_GUIDE.md) - ⭐ **Hướng dẫn chi tiết xử lý callback sau khi thanh toán**
- [Public Order API](./order.md) - Đặt hàng
- [Public Cart API](./cart.md) - Quản lý giỏ hàng
- [Payment Methods API](../public/payment-method.md) - Danh sách phương thức thanh toán