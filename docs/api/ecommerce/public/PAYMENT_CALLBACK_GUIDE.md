# Hướng Dẫn Tích Hợp Callback Thanh Toán

Tài liệu này hướng dẫn chi tiết cách xử lý callback sau khi khách hàng hoàn tất thanh toán tại Payment Gateway (VNPay, MoMo).

---

## 📋 Mục Lục

1. [Tổng Quan Flow Thanh Toán](#tổng-quan-flow-thanh-toán)
2. [API Verify Payment](#api-verify-payment)
3. [Xử Lý Callback VNPay](#xử-lý-callback-vnpay)
4. [Xử Lý Callback MoMo](#xử-lý-callback-momo)
5. [Ví Dụ Code Frontend](#ví-dụ-code-frontend)
6. [Xử Lý Lỗi](#xử-lý-lỗi)
7. [Best Practices](#best-practices)

---

## 🔄 Tổng Quan Flow Thanh Toán

```
1. Khách hàng chọn phương thức thanh toán (VNPay/MoMo)
   ↓
2. FE gọi API tạo đơn hàng → Nhận payment_url
   ↓
3. Redirect khách hàng đến payment_url (trang thanh toán gateway)
   ↓
4. Khách hàng nhập thông tin thẻ và xác nhận thanh toán
   ↓
5. Gateway xử lý thanh toán
   ↓
6. Gateway redirect về Return URL với query parameters
   ↓
7. FE nhận query params và gọi API Verify Payment
   ↓
8. Backend xác thực và cập nhật trạng thái thanh toán
   ↓
9. FE hiển thị kết quả và redirect đến trang đơn hàng
```

---

## 🔍 API Verify Payment

Sau khi khách hàng thanh toán xong, Payment Gateway sẽ redirect về Return URL với các query parameters. **FE BẮT BUỘC phải gọi API Verify Payment** để xác thực kết quả thanh toán với Backend.

### Endpoint

```
GET /api/public/payments/verify/:gateway
```

### Path Parameters

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `gateway` | string | ✅ | Tên gateway: `vnpay` hoặc `momo` |

### Query Parameters

Các query parameters sẽ được truyền trực tiếp từ Payment Gateway trong URL redirect. **FE không cần parse, chỉ cần forward toàn bộ query string** đến API này.

### Request Example

```bash
# VNPay callback
GET /api/public/payments/verify/vnpay?vnp_Amount=6001000000&vnp_BankCode=NCB&vnp_ResponseCode=00&vnp_TransactionNo=123456789&vnp_TxnRef=ORD-20250116-001&vnp_SecureHash=abc123...

# MoMo callback
GET /api/public/payments/verify/momo?partnerCode=MOMO&orderId=ORD-20250116-001&requestId=123456789&amount=60010000&orderInfo=Thanh%20toan%20don%20hang&orderType=momo_wallet&transId=123456789&resultCode=0&message=Success&payType=webApp&responseTime=1705392000000&extraData=&signature=xyz789...
```

### Response Success (200)

```json
{
  "success": true,
  "message": "Xác minh thanh toán thành công",
  "data": {
    "payment_id": 456,
    "order_id": 123,
    "order_number": "ORD-20250116-001",
    "payment_status": "completed",
    "order_status": "confirmed",
    "transaction_id": "VNP123456789",
    "amount": "60010000.00",
    "currency": "VND",
    "gateway": "vnpay",
    "payment_date": "2025-01-16T10:35:00.000Z"
  }
}
```

### Response Failed (200)

```json
{
  "success": true,
  "message": "Xác minh thanh toán thành công",
  "data": {
    "payment_id": 456,
    "order_id": 123,
    "order_number": "ORD-20250116-001",
    "payment_status": "failed",
    "order_status": "pending",
    "transaction_id": "VNP123456789",
    "amount": "60010000.00",
    "currency": "VND",
    "gateway": "vnpay",
    "error_message": "Giao dịch không thành công do: Khách hàng hủy giao dịch"
  }
}
```

### Response Error - Invalid Signature (400)

```json
{
  "success": false,
  "message": "Chữ ký không hợp lệ",
  "code": "INVALID_SIGNATURE",
  "httpStatus": 400
}
```

### Response Error - Order Not Found (404)

```json
{
  "success": false,
  "message": "Không tìm thấy đơn hàng",
  "code": "ORDER_NOT_FOUND",
  "httpStatus": 404
}
```

---

## 💳 Xử Lý Callback VNPay

### Query Parameters từ VNPay

Sau khi khách hàng thanh toán, VNPay sẽ redirect về Return URL với các query parameters sau:

| Tham số | Kiểu | Mô tả | Ví dụ |
|---------|------|-------|-------|
| `vnp_Amount` | string | Số tiền (đơn vị: đồng, không có dấu phẩy) | `6001000000` (tương đương 60,010,000 VND) |
| `vnp_BankCode` | string | Mã ngân hàng | `NCB`, `VCB`, `TCB`, ... |
| `vnp_ResponseCode` | string | Mã phản hồi (00 = thành công) | `00`, `07`, `09`, `24`, ... |
| `vnp_TransactionNo` | string | Mã giao dịch tại VNPay | `123456789` |
| `vnp_TxnRef` | string | Mã tham chiếu đơn hàng (order_number) | `ORD-20250116-001` |
| `vnp_SecureHash` | string | Chữ ký bảo mật | `abc123def456...` |
| `vnp_TransactionStatus` | string | Trạng thái giao dịch | `00` |
| `vnp_CardType` | string | Loại thẻ | `ATM`, `CREDIT`, `DEBIT` |
| `vnp_OrderInfo` | string | Thông tin đơn hàng | `Thanh toan don hang ORD-20250116-001` |

### VNPay Response Codes

| Mã | Mô tả |
|----|-------|
| `00` | ✅ Giao dịch thành công |
| `07` | ⚠️ Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường) |
| `09` | ❌ Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng |
| `10` | ❌ Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần |
| `11` | ❌ Đã hết hạn chờ thanh toán |
| `12` | ❌ Thẻ/Tài khoản của khách hàng bị khóa |
| `13` | ❌ Nhập sai mật khẩu xác thực giao dịch (OTP) |
| `24` | ❌ Khách hàng hủy giao dịch |
| `51` | ❌ Tài khoản không đủ số dư để thực hiện giao dịch |
| `65` | ❌ Tài khoản đã vượt quá hạn mức giao dịch trong ngày |
| `75` | ❌ Ngân hàng thanh toán đang bảo trì |
| `79` | ❌ Nhập sai mật khẩu thanh toán quá số lần quy định |
| `99` | ❌ Các lỗi khác |

### Ví Dụ URL Callback VNPay

```
http://yoursite.com/payment/return?vnp_Amount=6001000000&vnp_BankCode=NCB&vnp_CardType=ATM&vnp_OrderInfo=Thanh%20toan%20don%20hang%20ORD-20250116-001&vnp_PayDate=20250116103500&vnp_ResponseCode=00&vnp_TransactionNo=123456789&vnp_TransactionStatus=00&vnp_TxnRef=ORD-20250116-001&vnp_SecureHash=abc123def456...
```

---

## 📱 Xử Lý Callback MoMo

### Query Parameters từ MoMo

Sau khi khách hàng thanh toán, MoMo sẽ redirect về Return URL với các query parameters sau:

| Tham số | Kiểu | Mô tả | Ví dụ |
|---------|------|-------|-------|
| `partnerCode` | string | Mã đối tác | `MOMO` |
| `orderId` | string | Mã đơn hàng (order_number) | `ORD-20250116-001` |
| `requestId` | string | Mã yêu cầu | `123456789` |
| `amount` | number | Số tiền (đơn vị: đồng) | `60010000` |
| `orderInfo` | string | Thông tin đơn hàng | `Thanh toan don hang ORD-20250116-001` |
| `orderType` | string | Loại đơn hàng | `momo_wallet` |
| `transId` | string | Mã giao dịch tại MoMo | `123456789` |
| `resultCode` | number | Mã kết quả (0 = thành công) | `0`, `1001`, `1003`, ... |
| `message` | string | Thông báo | `Success`, `User cancel`, ... |
| `payType` | string | Phương thức thanh toán | `webApp`, `qrCode` |
| `responseTime` | number | Thời gian phản hồi (timestamp) | `1705392000000` |
| `extraData` | string | Dữ liệu bổ sung | `` (rỗng) |
| `signature` | string | Chữ ký bảo mật | `xyz789...` |

### MoMo Result Codes

| Mã | Mô tả |
|----|-------|
| `0` | ✅ Giao dịch thành công |
| `1001` | ❌ Tài khoản không đủ tiền |
| `1002` | ❌ Giao dịch bị từ chối do nhà phát hành tài khoản thanh toán |
| `1003` | ❌ Giao dịch bị huỷ |
| `1004` | ❌ Số tiền thanh toán vượt quá hạn mức |
| `1005` | ❌ URL hoặc QR code đã hết hạn |
| `1006` | ❌ Người dùng đã từ chối xác nhận thanh toán |
| `1007` | ❌ Tài khoản đang ở trạng thái tạm khoá |
| `9000` | ⏳ Giao dịch được khởi tạo, chờ người dùng xác nhận |
| `8000` | ⏳ Giao dịch đang ở trạng thái cần được cập nhật |
| `7000` | ⏳ Giao dịch đang được xử lý |

### Ví Dụ URL Callback MoMo

```
http://yoursite.com/payment/return?partnerCode=MOMO&orderId=ORD-20250116-001&requestId=123456789&amount=60010000&orderInfo=Thanh%20toan%20don%20hang&orderType=momo_wallet&transId=123456789&resultCode=0&message=Success&payType=webApp&responseTime=1705392000000&extraData=&signature=xyz789...
```

---

## 💻 Ví Dụ Code Frontend

### React/Next.js Example

```typescript
// pages/payment/return.tsx hoặc components/PaymentReturn.tsx
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

interface PaymentVerifyResponse {
  success: boolean;
  message: string;
  data: {
    payment_id: number;
    order_id: number;
    order_number: string;
    payment_status: 'completed' | 'failed' | 'pending';
    order_status: string;
    transaction_id: string;
    amount: string;
    currency: string;
    gateway: string;
    payment_date?: string;
    error_message?: string;
  };
}

export default function PaymentReturn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'error'>('loading');
  const [message, setMessage] = useState('Đang xử lý thanh toán...');
  const [orderId, setOrderId] = useState<number | null>(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      // Lấy gateway từ URL hoặc localStorage
      const gateway = getGatewayFromUrl() || localStorage.getItem('payment_gateway') || 'vnpay';
      
      // Lấy toàn bộ query parameters từ URL
      const queryString = window.location.search;
      
      // Gọi API verify payment
      const response = await axios.get<PaymentVerifyResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/public/payments/verify/${gateway}${queryString}`
      );

      if (response.data.success) {
        const { payment_status, order_id, order_number, error_message } = response.data.data;
        
        setOrderId(order_id);

        if (payment_status === 'completed') {
          setStatus('success');
          setMessage('Thanh toán thành công!');
          
          // Clear payment context
          localStorage.removeItem('payment_gateway');
          localStorage.removeItem('payment_context');
          
          // Redirect sau 2 giây
          setTimeout(() => {
            router.push(`/orders/${order_id}`);
          }, 2000);
        } else {
          setStatus('failed');
          setMessage(error_message || 'Thanh toán thất bại');
          
          // Redirect sau 3 giây
          setTimeout(() => {
            router.push(`/orders/${order_id}?payment_failed=true`);
          }, 3000);
        }
      } else {
        setStatus('error');
        setMessage(response.data.message || 'Có lỗi xảy ra khi xác thực thanh toán');
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      setStatus('error');
      
      if (error.response?.status === 400) {
        setMessage('Chữ ký không hợp lệ. Vui lòng liên hệ hỗ trợ.');
      } else if (error.response?.status === 404) {
        setMessage('Không tìm thấy đơn hàng.');
      } else {
        setMessage('Có lỗi xảy ra khi xác thực thanh toán. Vui lòng thử lại.');
      }
    }
  };

  const getGatewayFromUrl = (): string | null => {
    // Kiểm tra query params để xác định gateway
    const params = new URLSearchParams(window.location.search);
    
    // VNPay có vnp_ResponseCode
    if (params.has('vnp_ResponseCode')) {
      return 'vnpay';
    }
    
    // MoMo có resultCode
    if (params.has('resultCode')) {
      return 'momo';
    }
    
    return null;
  };

  return (
    <div className="payment-return-container">
      <div className="payment-return-content">
        {status === 'loading' && (
          <>
            <div className="spinner"></div>
            <h2>Đang xử lý thanh toán...</h2>
            <p>Vui lòng đợi trong giây lát</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="success-icon">✓</div>
            <h2>Thanh toán thành công!</h2>
            <p>{message}</p>
            {orderId && (
              <p>Đang chuyển đến trang đơn hàng...</p>
            )}
          </>
        )}
        
        {status === 'failed' && (
          <>
            <div className="error-icon">✗</div>
            <h2>Thanh toán thất bại</h2>
            <p>{message}</p>
            {orderId && (
              <p>Đang chuyển đến trang đơn hàng...</p>
            )}
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="error-icon">⚠</div>
            <h2>Có lỗi xảy ra</h2>
            <p>{message}</p>
            <button onClick={() => router.push('/')}>
              Về trang chủ
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

### Vue.js Example

```vue
<template>
  <div class="payment-return">
    <div v-if="status === 'loading'" class="loading">
      <div class="spinner"></div>
      <h2>Đang xử lý thanh toán...</h2>
    </div>
    
    <div v-else-if="status === 'success'" class="success">
      <div class="icon">✓</div>
      <h2>Thanh toán thành công!</h2>
      <p>{{ message }}</p>
    </div>
    
    <div v-else-if="status === 'failed'" class="failed">
      <div class="icon">✗</div>
      <h2>Thanh toán thất bại</h2>
      <p>{{ message }}</p>
    </div>
    
    <div v-else class="error">
      <div class="icon">⚠</div>
      <h2>Có lỗi xảy ra</h2>
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const status = ref<'loading' | 'success' | 'failed' | 'error'>('loading');
const message = ref('Đang xử lý thanh toán...');
const orderId = ref<number | null>(null);

onMounted(() => {
  verifyPayment();
});

const getGateway = (): string => {
  const query = route.query;
  if (query.vnp_ResponseCode) return 'vnpay';
  if (query.resultCode) return 'momo';
  return localStorage.getItem('payment_gateway') || 'vnpay';
};

const verifyPayment = async () => {
  try {
    const gateway = getGateway();
    const queryString = new URLSearchParams(route.query as Record<string, string>).toString();
    
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/public/payments/verify/${gateway}?${queryString}`
    );

    if (response.data.success) {
      const { payment_status, order_id, error_message } = response.data.data;
      orderId.value = order_id;

      if (payment_status === 'completed') {
        status.value = 'success';
        message.value = 'Thanh toán thành công!';
        
        localStorage.removeItem('payment_gateway');
        
        setTimeout(() => {
          router.push(`/orders/${order_id}`);
        }, 2000);
      } else {
        status.value = 'failed';
        message.value = error_message || 'Thanh toán thất bại';
        
        setTimeout(() => {
          router.push(`/orders/${order_id}?payment_failed=true`);
        }, 3000);
      }
    }
  } catch (error: any) {
    status.value = 'error';
    if (error.response?.status === 400) {
      message.value = 'Chữ ký không hợp lệ';
    } else {
      message.value = 'Có lỗi xảy ra khi xác thực thanh toán';
    }
  }
};
</script>
```

### Vanilla JavaScript Example

```javascript
// payment-return.js
(async function() {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Xác định gateway
  let gateway = 'vnpay';
  if (urlParams.has('vnp_ResponseCode')) {
    gateway = 'vnpay';
  } else if (urlParams.has('resultCode')) {
    gateway = 'momo';
  } else {
    gateway = localStorage.getItem('payment_gateway') || 'vnpay';
  }
  
  // Lấy query string
  const queryString = window.location.search;
  
  try {
    // Gọi API verify
    const response = await fetch(
      `${API_BASE_URL}/api/public/payments/verify/${gateway}${queryString}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      const { payment_status, order_id, error_message } = data.data;
      
      if (payment_status === 'completed') {
        // Thanh toán thành công
        showSuccess('Thanh toán thành công!');
        localStorage.removeItem('payment_gateway');
        
        setTimeout(() => {
          window.location.href = `/orders/${order_id}`;
        }, 2000);
      } else {
        // Thanh toán thất bại
        showError(error_message || 'Thanh toán thất bại');
        
        setTimeout(() => {
          window.location.href = `/orders/${order_id}?payment_failed=true`;
        }, 3000);
      }
    } else {
      showError(data.message || 'Có lỗi xảy ra');
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    showError('Có lỗi xảy ra khi xác thực thanh toán');
  }
})();
```

---

## ⚠️ Xử Lý Lỗi

### 1. Invalid Signature (400)

**Nguyên nhân:** Chữ ký từ Payment Gateway không hợp lệ, có thể do:
- URL bị thay đổi sau khi redirect
- Query parameters bị mất hoặc thay đổi
- Lỗi từ Payment Gateway

**Xử lý:**
```javascript
if (error.response?.status === 400 && error.response?.data?.code === 'INVALID_SIGNATURE') {
  // Hiển thị thông báo và yêu cầu khách hàng kiểm tra lại
  showError('Chữ ký không hợp lệ. Vui lòng liên hệ hỗ trợ nếu đã thanh toán thành công.');
  
  // Có thể gọi API kiểm tra trạng thái đơn hàng
  checkOrderStatus(orderId);
}
```

### 2. Order Not Found (404)

**Nguyên nhân:** Không tìm thấy đơn hàng với order_number từ gateway

**Xử lý:**
```javascript
if (error.response?.status === 404) {
  showError('Không tìm thấy đơn hàng. Vui lòng liên hệ hỗ trợ.');
  // Redirect về trang chủ hoặc trang đơn hàng
  router.push('/');
}
```

### 3. Network Error

**Xử lý:**
```javascript
try {
  await verifyPayment();
} catch (error) {
  if (!error.response) {
    // Network error
    showError('Không thể kết nối đến server. Vui lòng thử lại.');
    // Có thể retry
    setTimeout(() => verifyPayment(), 3000);
  }
}
```

### 4. Timeout

**Xử lý:**
```javascript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds

try {
  const response = await fetch(url, {
    signal: controller.signal
  });
  clearTimeout(timeoutId);
} catch (error) {
  if (error.name === 'AbortError') {
    showError('Request timeout. Vui lòng thử lại.');
  }
}
```

---

## ✅ Best Practices

### 1. Lưu Payment Context

Trước khi redirect đến Payment Gateway, lưu thông tin cần thiết:

```javascript
// Trước khi redirect
localStorage.setItem('payment_context', JSON.stringify({
  order_id: order.id,
  order_number: order.order_number,
  amount: order.total_amount,
  gateway: 'vnpay',
  timestamp: Date.now()
}));
localStorage.setItem('payment_gateway', 'vnpay');
```

### 2. Validate Payment Context

Khi nhận callback, kiểm tra context còn hợp lệ:

```javascript
const context = JSON.parse(localStorage.getItem('payment_context') || '{}');
const timestamp = context.timestamp;

// Kiểm tra context không quá 30 phút
if (!timestamp || Date.now() - timestamp > 30 * 60 * 1000) {
  // Context đã hết hạn
  localStorage.removeItem('payment_context');
  showError('Phiên thanh toán đã hết hạn');
  return;
}
```

### 3. Retry Logic

Nếu API verify fail do network, có thể retry:

```javascript
const verifyWithRetry = async (maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await verifyPayment();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

### 4. Loading State

Luôn hiển thị loading state khi đang verify:

```jsx
{isVerifying && (
  <div className="loading-overlay">
    <Spinner />
    <p>Đang xác thực thanh toán...</p>
  </div>
)}
```

### 5. User Feedback

Cung cấp feedback rõ ràng cho người dùng:

```javascript
// Success
showSuccess('Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.');

// Failed
showError('Thanh toán thất bại. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.');

// Error
showError('Có lỗi xảy ra. Vui lòng liên hệ hỗ trợ nếu đã thanh toán thành công.');
```

### 6. Cleanup

Sau khi xử lý xong, cleanup localStorage:

```javascript
localStorage.removeItem('payment_context');
localStorage.removeItem('payment_gateway');
localStorage.removeItem('pending_order_id');
```

### 7. Security

- **KHÔNG** lưu thông tin nhạy cảm (card number, CVV) vào localStorage
- **KHÔNG** trust query parameters từ URL, luôn verify với Backend
- **LUÔN** gọi API verify để xác thực kết quả thanh toán

### 8. Error Logging

Log lỗi để debug:

```javascript
try {
  await verifyPayment();
} catch (error) {
  console.error('Payment verification error:', {
    error,
    url: window.location.href,
    gateway,
    timestamp: new Date().toISOString()
  });
  
  // Có thể gửi lên error tracking service
  // errorTrackingService.log(error);
}
```

---

## 📝 Checklist Tích Hợp

- [ ] Tạo trang Return URL (`/payment/return`)
- [ ] Implement logic xác định gateway từ query params
- [ ] Implement API call verify payment
- [ ] Xử lý response success/failed
- [ ] Xử lý các lỗi (400, 404, network, timeout)
- [ ] Hiển thị loading state
- [ ] Hiển thị success/error message
- [ ] Redirect đến trang đơn hàng sau khi xử lý
- [ ] Cleanup localStorage
- [ ] Test với VNPay sandbox
- [ ] Test với MoMo sandbox
- [ ] Test các trường hợp lỗi
- [ ] Test network timeout
- [ ] Test invalid signature

---

## 🔗 Tài Liệu Liên Quan

- [Public Payment API](./payment.md) - API thanh toán đầy đủ
- [Public Order API](./order.md) - API đơn hàng
- [Payment Methods API](../public/payment-method.md) - Danh sách phương thức thanh toán

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề khi tích hợp, vui lòng:
1. Kiểm tra console logs
2. Kiểm tra Network tab trong DevTools
3. Kiểm tra response từ API verify
4. Liên hệ Backend team với thông tin:
   - Gateway sử dụng (VNPay/MoMo)
   - Order number
   - Query parameters từ URL
   - Error message (nếu có)

