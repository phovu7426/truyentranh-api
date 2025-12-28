# Public Shipping Tracking API

API công khai cho theo dõi vận chuyển (shipping tracking) - không yêu cầu authentication.

## Cấu trúc

- Base URL: `http://localhost:3000/api`
- Authentication: Không yêu cầu
- Headers: `Content-Type: application/json`

---

## 1. Get Order Tracking (Lấy thông tin theo dõi đơn hàng)

Lấy lịch sử trình trạng thái vận chuyển của một đơn hàng.

### Endpoint
```
GET /api/public/tracking/order/:orderId
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| orderId | number | ID của đơn hàng |

### Request Example

```bash
curl -X GET "http://localhost:3000/api/public/tracking/order/12345" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy thông tin theo dõi thành công",
  "data": {
    "order_id": 12345,
    "order_code": "ORD-20250120-001",
    "tracking_number": "GHN123456789",
    "shipping_provider": "GHN",
    "current_status": "in_transit",
    "estimated_delivery": "2025-01-22T17:00:00.000Z",
    "origin": {
      "warehouse": "Kho Chính - TP.HCM",
      "address": "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
      "phone": "02812345678"
    },
    "destination": {
      "recipient_name": "Nguyễn Văn A",
      "address": "456 Trần Phú, Quận 5, TP.HCM",
      "phone": "0901234567"
    },
    "tracking_history": [
      {
        "id": 1,
        "status": "pending",
        "status_description": "Chờ lấy hàng",
        "location": "Kho Chính - TP.HCM",
        "timestamp": "2025-01-20T09:00:00.000Z",
        "note": "Đơn hàng đã được tạo và chờ lấy hàng"
      },
      {
        "id": 2,
        "status": "picked_up",
        "status_description": "Đã lấy hàng",
        "location": "Kho Chính - TP.HCM",
        "timestamp": "2025-01-20T14:30:00.000Z",
        "note": "Shipper đã lấy hàng thành công"
      },
      {
        "id": 3,
        "status": "in_transit",
        "status_description": "Đang vận chuyển",
        "location": "Trung tâm phân phối TP.HCM",
        "timestamp": "2025-01-21T08:15:00.000Z",
        "note": "Đơn hàng đang được vận chuyển đến địa chỉ nhận"
      }
    ],
    "package_info": {
      "weight": 0.5,
      "dimensions": {
        "length": 20,
        "width": 15,
        "height": 5
      },
      "package_count": 1,
      "description": "Hàng điện tử"
    },
    "created_at": "2025-01-20T08:30:00.000Z",
    "updated_at": "2025-01-21T08:15:00.000Z"
  }
}
```

---

## 2. Get Tracking by Number (Lấy thông tin theo dõi theo mã vận đơn)

Tìm kiếm thông tin theo dõi trực tiếp theo mã vận đơn.

### Endpoint
```
GET /api/public/tracking/number/:trackingNumber
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| trackingNumber | string | Mã vận đơn |

### Request Example

```bash
curl -X GET "http://localhost:3000/api/public/tracking/number/GHN123456789" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy thông tin theo dõi thành công",
  "data": {
    "tracking_number": "GHN123456789",
    "shipping_provider": "GHN",
    "order_id": 12345,
    "order_code": "ORD-20250120-001",
    "current_status": "in_transit",
    "estimated_delivery": "2025-01-22T17:00:00.000Z",
    "origin": {
      "warehouse": "Kho Chính - TP.HCM",
      "address": "123 Nguyễn Văn Linh, Quận 7, TP.HCM"
    },
    "destination": {
      "recipient_name": "Nguyễn Văn A",
      "address": "456 Trần Phú, Quận 5, TP.HCM"
    },
    "tracking_history": [
      {
        "id": 1,
        "status": "pending",
        "status_description": "Chờ lấy hàng",
        "location": "Kho Chính - TP.HCM",
        "timestamp": "2025-01-20T09:00:00.000Z",
        "note": "Đơn hàng đã được tạo và chờ lấy hàng"
      },
      {
        "id": 2,
        "status": "picked_up",
        "status_description": "Đã lấy hàng",
        "location": "Kho Chính - TP.HCM",
        "timestamp": "2025-01-20T14:30:00.000Z",
        "note": "Shipper đã lấy hàng thành công"
      },
      {
        "id": 3,
        "status": "in_transit",
        "status_description": "Đang vận chuyển",
        "location": "Trung tâm phân phối TP.HCM",
        "timestamp": "2025-01-21T08:15:00.000Z",
        "note": "Đơn hàng đang được vận chuyển đến địa chỉ nhận"
      }
    ],
    "package_info": {
      "weight": 0.5,
      "dimensions": {
        "length": 20,
        "width": 15,
        "height": 5
      },
      "package_count": 1
    },
    "created_at": "2025-01-20T08:30:00.000Z",
    "updated_at": "2025-01-21T08:15:00.000Z"
  }
}
```

---

## 3. Get Live Tracking (Lấy thông tin theo dõi real-time)

Lấy thông tin theo dõi real-time từ nhà cung cấp vận chuyển.

### Endpoint
```
GET /api/public/tracking/live/:trackingNumber
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| trackingNumber | string | Mã vận đơn |

### Request Example

```bash
curl -X GET "http://localhost:3000/api/public/tracking/live/GHN123456789" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy thông tin theo dõi real-time thành công",
  "data": {
    "tracking_number": "GHN123456789",
    "shipping_provider": "GHN",
    "current_status": "in_transit",
    "current_location": {
      "latitude": 10.7769,
      "longitude": 106.7009,
      "address": "Đường Nguyễn Văn Linh, Quận 7, TP.HCM",
      "timestamp": "2025-01-21T08:15:00.000Z"
    },
    "estimated_delivery": "2025-01-22T17:00:00.000Z",
    "delivery_progress": 65,
    "next_checkpoint": {
      "location": "Trung tâm phân phối Quận 1",
      "estimated_arrival": "2025-01-21T14:00:00.000Z"
    },
    "shipper_info": {
      "name": "Trần Văn B",
      "phone": "0909876543",
      "vehicle": "Xe máy ABC-12345"
    },
    "tracking_history": [
      {
        "status": "pending",
        "status_description": "Chờ lấy hàng",
        "location": "Kho Chính - TP.HCM",
        "timestamp": "2025-01-20T09:00:00.000Z"
      },
      {
        "status": "picked_up",
        "status_description": "Đã lấy hàng",
        "location": "Kho Chính - TP.HCM",
        "timestamp": "2025-01-20T14:30:00.000Z"
      },
      {
        "status": "in_transit",
        "status_description": "Đang vận chuyển",
        "location": "Đường Nguyễn Văn Linh, Quận 7, TP.HCM",
        "timestamp": "2025-01-21T08:15:00.000Z"
      }
    ],
    "updated_at": "2025-01-21T08:15:00.000Z"
  }
}
```

---

## 4. Handle Webhook (Xử lý webhook từ nhà cung cấp)

Endpoint để nhận webhook từ các nhà cung cấp vận chuyển.

### Endpoint
```
POST /api/public/tracking/webhook/:provider
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| provider | string | Tên nhà cung cấp (ghn, ghtk, viettel_post, etc.) |

### Request Body

Cấu trúc request body sẽ khác nhau tùy theo nhà cung cấp.

#### GHN Webhook Example
```json
{
  "code": "SUCCESS",
  "message": "Thành công",
  "data": {
    "order_code": "ORD-20250120-001",
    "tracking_number": "GHN123456789",
    "status": "delivered",
    "status_description": "Giao hàng thành công",
    "timestamp": "2025-01-22T16:30:00.000Z",
    "location": "456 Trần Phú, Quận 5, TP.HCM",
    "note": "Khách hàng đã nhận hàng",
    "images": [
      "https://example.com/delivery-proof-1.jpg",
      "https://example.com/delivery-proof-2.jpg"
    ],
    "recipient_name": "Nguyễn Văn A",
    "signature": "base64_signature"
  }
}
```

#### GHTK Webhook Example
```json
{
  "partner_id": "12345",
  "label_id": "GHTK678901",
  "tracking_number": "GHTK678901",
  "status_id": 6,
    "status": "delivered",
    "timestamp": "2025-01-22T16:30:00.000Z",
    "location": "456 Trần Phú, Quận 5, TP.HCM",
    "note": "Giao hàng thành công"
  }
}
```

### Request Example

```bash
# GHN Webhook
curl -X POST "http://localhost:3000/api/public/tracking/webhook/ghn" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SUCCESS",
    "message": "Thành công",
    "data": {
      "order_code": "ORD-20250120-001",
      "tracking_number": "GHN123456789",
      "status": "delivered",
      "status_description": "Giao hàng thành công",
      "timestamp": "2025-01-22T16:30:00.000Z",
      "location": "456 Trần Phú, Quận 5, TP.HCM",
      "note": "Khách hàng đã nhận hàng"
    }
  }'

# GHTK Webhook
curl -X POST "http://localhost:3000/api/public/tracking/webhook/ghtk" \
  -H "Content-Type: application/json" \
  -d '{
    "partner_id": "12345",
    "label_id": "GHTK678901",
    "tracking_number": "GHTK678901",
    "status_id": 6,
    "status": "delivered",
    "timestamp": "2025-01-22T16:30:00.000Z",
    "location": "456 Trần Phú, Quận 5, TP.HCM",
    "note": "Giao hàng thành công"
  }'
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Xử lý webhook thành công",
  "data": {
    "processed": true,
    "tracking_number": "GHN123456789",
    "updated_status": "delivered",
    "timestamp": "2025-01-22T16:30:00.000Z"
  }
}
```

**Error - Invalid Provider (400):**
```json
{
  "success": false,
  "message": "Nhà cung cấp không được hỗ trợ",
  "code": "INVALID_PROVIDER"
}
```

**Error - Invalid Signature (401):**
```json
{
  "success": false,
  "message": "Chữ ký không hợp lệ",
  "code": "INVALID_SIGNATURE"
}
```

---

## Tracking Status

| Status | Description | Vietnamese |
|--------|-------------|------------|
| `pending` | Chờ xử lý | Chờ lấy hàng |
| `picked_up` | Đã lấy hàng | Đã lấy hàng |
| `in_transit` | Đang vận chuyển | Đang vận chuyển |
| `out_for_delivery` | Đang giao hàng | Đang giao hàng |
| `delivered` | Đã giao hàng | Đã giao hàng |
| `failed` | Giao hàng thất bại | Giao hàng thất bại |
| `returned` | Đã trả hàng | Đã trả hàng |
| `cancelled` | Đã hủy | Đã hủy |

---

## Shipping Providers

| Provider | Code | Description |
|----------|-------|-------------|
| Giao Hàng Nhanh | `ghn` | Dịch vụ giao hàng nhanh |
| Giao Hàng Tiết Kiệm | `ghtk` | Dịch vụ giao hàng tiết kiệm |
| Viettel Post | `viettel_post` | Dịch vụ chuyển phát nhanh Viettel |
| VNPost | `vnpost` | Dịch vụ chuyển phát nhanh VNPost |
| J&T Express | `jnt` | Dịch vụ chuyển phát nhanh J&T |
| GrabExpress | `grab` | Dịch vụ giao hàng Grab |

---

## Use Cases

### Use Case 1: Khách hàng theo dõi đơn hàng

```bash
# 1. Khách hàng có mã đơn hàng ORD-20250120-001
# Truy vấn theo ID đơn hàng
GET /api/public/tracking/order/12345

# 2. Hoặc theo mã vận đơn GHN123456789
GET /api/public/tracking/number/GHN123456789

# 3. Xem thông tin real-time
GET /api/public/tracking/live/GHN123456789
```

### Use Case 2: Frontend tích hợp tracking

```javascript
// React component example
const TrackingComponent = ({ orderId }) => {
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const response = await fetch(`/api/public/tracking/order/${orderId}`);
        const data = await response.json();
        
        if (data.success) {
          setTracking(data.data);
        }
      } catch (error) {
        console.error('Error fetching tracking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
    
    // Polling mỗi 5 phút cho real-time updates
    const interval = setInterval(fetchTracking, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h3>Theo dõi đơn hàng #{tracking.order_code}</h3>
      <p>Mã vận đơn: {tracking.tracking_number}</p>
      <p>Trạng thái: {tracking.current_status}</p>
      
      <div className="tracking-timeline">
        {tracking.tracking_history.map((event, index) => (
          <div key={event.id} className="timeline-item">
            <div className="timestamp">
              {new Date(event.timestamp).toLocaleString()}
            </div>
            <div className="status">{event.status_description}</div>
            <div className="location">{event.location}</div>
            {event.note && <div className="note">{event.note}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Use Case 3: Webhook processing

```javascript
// Server-side webhook handler
app.post('/api/public/tracking/webhook/:provider', (req, res) => {
  const { provider } = req.params;
  const payload = req.body;
  
  // Verify signature (if applicable)
  if (!verifyWebhookSignature(provider, payload)) {
    return res.status(401).json({
      success: false,
      message: "Invalid signature",
      code: "INVALID_SIGNATURE"
    });
  }
  
  // Process webhook based on provider
  switch (provider) {
    case 'ghn':
      processGHNWebhook(payload);
      break;
    case 'ghtk':
      processGHTKWebhook(payload);
      break;
    default:
      return res.status(400).json({
        success: false,
        message: "Unsupported provider",
        code: "INVALID_PROVIDER"
      });
  }
  
  res.json({
    success: true,
    message: "Webhook processed successfully",
    data: {
      processed: true,
      tracking_number: payload.data?.tracking_number,
      updated_status: payload.data?.status
    }
  });
});
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid data |
| 401 | Unauthorized - Invalid signature |
| 404 | Not Found - Tracking number not found |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error |

---

## Rate Limiting

- **Public Tracking APIs**: 100 requests/minute per IP
- **Webhook Endpoints**: 1000 requests/minute per provider

---

**Xem thêm:**
- [Public Order API](./order.md)
- [Admin Order API](../admin/order.md)
- [Public Shipping Method API](./shipping-method.md)