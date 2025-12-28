# Public Shipping Method API

API công khai để xem và tính toán phí vận chuyển. **Không cần authentication** - cả guest và logged-in users đều có thể sử dụng.

---

## 📋 Endpoints

### 1. GET /api/public/shipping-methods
Lấy danh sách tất cả phương thức vận chuyển (có phân trang).

**Request:**
```bash
GET /api/public/shipping-methods?page=1&limit=10
```

**Query Parameters:**
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số items mỗi trang (default: 10)
- `status` (optional): Lọc theo status (`active`, `inactive`)

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách phương thức vận chuyển thành công",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": [
    {
      "id": 1,
      "name": "Giao hàng nhanh",
      "description": "Giao hàng trong 2-3 ngày",
      "base_cost": "30000",
      "estimated_days": "2-3",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": 2,
      "name": "Giao hàng tiết kiệm",
      "description": "Giao hàng trong 5-7 ngày",
      "base_cost": "20000",
      "estimated_days": "5-7",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "errors": null,
  "timestamp": "2024-01-15T10:30:00+07:00",
  "meta": {
    "current_page": 1,
    "per_page": 10,
    "total": 2,
    "last_page": 1
  }
}
```

---

### 2. GET /api/public/shipping-methods/active
Lấy danh sách phương thức vận chuyển đang hoạt động.

**Request:**
```bash
GET /api/public/shipping-methods/active
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách phương thức vận chuyển đang hoạt động thành công",
  "code": "SUCCESS",
  "httpStatus": 200,
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
  ],
  "errors": null,
  "timestamp": "2024-01-15T10:30:00+07:00"
}
```

---

### 3. GET /api/public/shipping-methods/:id
Lấy chi tiết một phương thức vận chuyển.

**Request:**
```bash
GET /api/public/shipping-methods/1
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy thông tin phương thức vận chuyển thành công",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": {
    "id": 1,
    "name": "Giao hàng nhanh",
    "description": "Giao hàng trong 2-3 ngày",
    "base_cost": "30000",
    "estimated_days": "2-3",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "errors": null,
  "timestamp": "2024-01-15T10:30:00+07:00"
}
```

**Error Response (Not Found):**
```json
{
  "success": false,
  "message": "Không tìm thấy phương thức vận chuyển",
  "code": "NOT_FOUND",
  "httpStatus": 404,
  "data": null,
  "errors": "Not Found",
  "timestamp": "2024-01-15T10:30:00+07:00"
}
```

---

### 4. POST /api/public/shipping-methods/calculate
Tính phí vận chuyển dựa trên phương thức, giá trị giỏ hàng, trọng lượng và địa chỉ.

**Request:**
```bash
POST /api/public/shipping-methods/calculate
Content-Type: application/json

{
  "shipping_method_id": 1,
  "cart_value": 500000,
  "weight": 2.5,
  "destination": "TP. Hồ Chí Minh"
}
```

**Request Body:**
```typescript
{
  shipping_method_id: number     // Required - ID phương thức vận chuyển
  cart_value: number              // Required - Giá trị giỏ hàng (VND)
  weight?: number                 // Optional - Trọng lượng (kg)
  destination?: string            // Optional - Địa chỉ nhận hàng
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tính phí vận chuyển thành công",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": {
    "shipping_method_id": 1,
    "cart_value": 500000,
    "weight": 2.5,
    "destination": "TP. Hồ Chí Minh",
    "shipping_cost": 30000
  },
  "errors": null,
  "timestamp": "2024-01-15T10:30:00+07:00"
}
```

**Calculation Logic:**
```
Base Cost = base_cost của shipping method

Nếu weight > 5kg:
  Additional Cost = (weight - 5) * 5000

Nếu cart_value > 1,000,000:
  Additional Cost = cart_value * 0.02 (2% của giá trị giỏ hàng)

Final Cost = Base Cost + Additional Costs
```

**Error Response:**
```json
{
  "success": false,
  "message": "Failed to calculate shipping cost",
  "code": "CALCULATE_FAILED",
  "httpStatus": 400,
  "data": null,
  "errors": "Shipping method not found or inactive",
  "timestamp": "2024-01-15T10:30:00+07:00"
}
```

---

## 💡 Usage Examples

### Example 1: Display Available Shipping Methods on Checkout Page

```javascript
const ShippingMethodSelector = () => {
  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  
  useEffect(() => {
    loadShippingMethods();
  }, []);
  
  const loadShippingMethods = async () => {
    try {
      const response = await fetch('/api/public/shipping-methods/active');
      const result = await response.json();
      
      if (result.success) {
        setMethods(result.data);
      }
    } catch (error) {
      console.error('Error loading shipping methods:', error);
    }
  };
  
  return (
    <div className="shipping-methods">
      <h3>Chọn phương thức vận chuyển</h3>
      {methods.map(method => (
        <div key={method.id} className="method-option">
          <input
            type="radio"
            name="shipping"
            value={method.id}
            onChange={() => setSelectedMethod(method)}
          />
          <label>
            <strong>{method.name}</strong> - {method.base_cost}đ
            <br />
            <small>{method.description}</small>
          </label>
        </div>
      ))}
    </div>
  );
};
```

### Example 2: Calculate Shipping Cost Based on User Input

```javascript
const ShippingCalculator = ({ cartValue }) => {
  const [selectedMethodId, setSelectedMethodId] = useState(null);
  const [weight, setWeight] = useState(0);
  const [destination, setDestination] = useState('');
  const [calculatedCost, setCalculatedCost] = useState(null);
  
  const calculateShipping = async () => {
    if (!selectedMethodId) {
      alert('Vui lòng chọn phương thức vận chuyển');
      return;
    }
    
    try {
      const response = await fetch('/api/public/shipping-methods/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shipping_method_id: selectedMethodId,
          cart_value: cartValue,
          weight: weight,
          destination: destination
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCalculatedCost(result.data.shipping_cost);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error calculating shipping:', error);
      alert('Không thể tính phí vận chuyển');
    }
  };
  
  return (
    <div className="shipping-calculator">
      <h3>Tính phí vận chuyển</h3>
      
      <div>
        <label>Trọng lượng (kg):</label>
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(parseFloat(e.target.value))}
        />
      </div>
      
      <div>
        <label>Địa chỉ giao hàng:</label>
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
      </div>
      
      <button onClick={calculateShipping}>
        Tính phí vận chuyển
      </button>
      
      {calculatedCost !== null && (
        <div className="result">
          <h4>Phí vận chuyển: {calculatedCost.toLocaleString()}đ</h4>
        </div>
      )}
    </div>
  );
};
```

### Example 3: Display Total Amount with Shipping Cost

```javascript
const OrderSummary = ({ cart, shippingMethodId }) => {
  const [shippingCost, setShippingCost] = useState(0);
  
  useEffect(() => {
    if (shippingMethodId) {
      calculateShipping();
    }
  }, [shippingMethodId, cart]);
  
  const calculateShipping = async () => {
    try {
      const response = await fetch('/api/public/shipping-methods/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shipping_method_id: shippingMethodId,
          cart_value: cart.subtotal,
          weight: calculateTotalWeight(cart.items), // Your function
          destination: cart.shipping_address?.city
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setShippingCost(result.data.shipping_cost);
      }
    } catch (error) {
      console.error('Error calculating shipping:', error);
    }
  };
  
  const getTotalAmount = () => {
    return parseInt(cart.subtotal) + shippingCost;
  };
  
  return (
    <div className="order-summary">
      <h3>Tổng đơn hàng</h3>
      
      <div className="summary-line">
        <span>Tạm tính:</span>
        <span>{parseInt(cart.subtotal).toLocaleString()}đ</span>
      </div>
      
      <div className="summary-line">
        <span>Phí vận chuyển:</span>
        <span>{shippingCost.toLocaleString()}đ</span>
      </div>
      
      <div className="summary-line total">
        <strong>Tổng cộng:</strong>
        <strong>{getTotalAmount().toLocaleString()}đ</strong>
      </div>
    </div>
  );
};
```

### Example 4: Complete Checkout Flow with Shipping

```javascript
const CheckoutPage = () => {
  const [cart, setCart] = useState(null);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    district: ''
  });
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    // Load cart
    const cartResponse = await fetch('/api/public/cart');
    const cartData = await cartResponse.json();
    setCart(cartData.data);
    
    // Load shipping methods
    const shippingResponse = await fetch('/api/public/shipping-methods/active');
    const shippingData = await shippingResponse.json();
    setShippingMethods(shippingData.data);
  };
  
  const handleShippingMethodChange = async (methodId) => {
    setSelectedShippingMethod(methodId);
    
    // Auto calculate shipping cost
    if (cart && shippingAddress.city) {
      const response = await fetch('/api/public/shipping-methods/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipping_method_id: methodId,
          cart_value: cart.subtotal,
          destination: shippingAddress.city
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setShippingCost(result.data.shipping_cost);
      }
    }
  };
  
  const handlePlaceOrder = async () => {
    // Create order with selected shipping method
    const response = await fetch('/api/public/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shipping_address: shippingAddress,
        shipping_method_id: selectedShippingMethod,
        payment_method_id: 1 // Selected payment method
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Đặt hàng thành công!');
      // Handle payment if needed
    }
  };
  
  return (
    <div className="checkout-page">
      {/* Address Form */}
      <section>
        <h2>Địa chỉ giao hàng</h2>
        {/* Address inputs */}
      </section>
      
      {/* Shipping Methods */}
      <section>
        <h2>Phương thức vận chuyển</h2>
        {shippingMethods.map(method => (
          <div key={method.id}>
            <input
              type="radio"
              name="shipping"
              value={method.id}
              onChange={() => handleShippingMethodChange(method.id)}
            />
            <label>
              {method.name} - {method.base_cost}đ
              <br />
              <small>{method.description}</small>
            </label>
          </div>
        ))}
      </section>
      
      {/* Order Summary */}
      <section>
        <h2>Tổng đơn hàng</h2>
        <div>Tạm tính: {cart?.subtotal}đ</div>
        <div>Phí ship: {shippingCost}đ</div>
        <div><strong>Tổng: {parseInt(cart?.subtotal || 0) + shippingCost}đ</strong></div>
      </section>
      
      <button onClick={handlePlaceOrder}>Đặt hàng</button>
    </div>
  );
};
```

---

## 🎯 Key Points

### 1. **Public Access**
- ✅ Không cần authentication
- ✅ Guest users có thể xem và tính phí
- ✅ Logged-in users cũng dùng endpoint này

### 2. **Shipping Cost Calculation**
- Base cost từ shipping method
- Additional cost dựa trên:
  - Trọng lượng (> 5kg)
  - Giá trị đơn hàng (> 1,000,000đ)
  - Địa chỉ giao hàng (tùy cấu hình)

### 3. **Integration with Checkout**
```javascript
// Step 1: Load shipping methods
GET /api/public/shipping-methods/active

// Step 2: User selects method and enters address
// Frontend captures: method_id, address

// Step 3: Calculate shipping cost
POST /api/public/shipping-methods/calculate
{
  "shipping_method_id": 1,
  "cart_value": 500000,
  "destination": "TP. HCM"
}

// Step 4: Display total = cart_value + shipping_cost

// Step 5: Place order with selected shipping method
POST /api/public/orders
{
  "shipping_method_id": 1,
  "shipping_address": {...}
}
```

### 4. **Error Handling**
```javascript
try {
  const response = await fetch('/api/public/shipping-methods/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(calculateData)
  });
  
  const result = await response.json();
  
  if (!result.success) {
    if (result.code === 'CALCULATE_FAILED') {
      alert('Không thể tính phí vận chuyển. Vui lòng kiểm tra lại thông tin.');
    } else if (result.code === 'NOT_FOUND') {
      alert('Phương thức vận chuyển không tồn tại.');
    }
  }
} catch (error) {
  console.error('Network error:', error);
  alert('Lỗi kết nối. Vui lòng thử lại.');
}
```

---

## 📊 Response Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `SUCCESS` | 200 | Thành công |
| `NOT_FOUND` | 404 | Không tìm thấy shipping method |
| `FETCH_FAILED` | 400 | Lỗi khi lấy danh sách |
| `CALCULATE_FAILED` | 400 | Lỗi khi tính phí vận chuyển |

---

## 🔗 Related APIs

- **[Cart API](./cart.md)** - Quản lý giỏ hàng
- **[Order API](./order.md)** - Đặt hàng
- **[Payment API](./payment.md)** - Thanh toán
- **[Integration Guide](../../CHECKOUT_INTEGRATION_GUIDE.md)** - Hướng dẫn tích hợp đầy đủ

---

**Questions?** Refer to the integration guide or contact the backend team.