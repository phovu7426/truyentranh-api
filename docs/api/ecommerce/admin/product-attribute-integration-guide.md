# HƯỚNG DẪN TÍCH HỢP API THUỘC TÍNH SẢN PHẨM CHO FRONTEND

## Tổng quan
API thuộc tính sản phẩm cho phép quản lý các thuộc tính của sản phẩm như màu sắc, kích thước, chất liệu, v.v. Bao gồm 2 bảng chính:
- **product_attributes**: Định nghĩa thuộc tính (tên, kiểu hiển thị, cấu hình)
- **product_attribute_values**: Giá trị cụ thể của từng thuộc tính

## Base URL
```
https://api.example.com/api
```

## Authentication
Tất cả API đều cần JWT token trong header:
```
Authorization: Bearer <your-jwt-token>
```

## LẤY ENUMS (DANH MỤC GIÁ TRỊ CỐ ĐỊNH)

### API Lấy tất cả Enums
**GET** `/enums`

**Response Example:**
```json
{
  "basic_status": [
    {
      "id": "active",
      "name": "active",
      "value": "active",
      "label": "Hoạt động",
      "color": "green"
    },
    {
      "id": "inactive",
      "name": "inactive", 
      "value": "inactive",
      "label": "Không hoạt động",
      "color": "red"
    }
  ],
  "product_status": [
    {
      "id": "active",
      "name": "active",
      "value": "active", 
      "label": "Đang hoạt động",
      "color": "green"
    },
    {
      "id": "inactive",
      "name": "inactive",
      "value": "inactive",
      "label": "Ngừng hoạt động",
      "color": "red"
    },
    {
      "id": "draft",
      "name": "draft",
      "value": "draft",
      "label": "Nháp",
      "color": "gray"
    }
  ],
  "attribute_type": [
    {
      "id": "text",
      "name": "text",
      "value": "text",
      "label": "Text thường",
      "description": "Nhập text thường",
      "icon": "text-fields",
      "color": "blue"
    },
    {
      "id": "select",
      "name": "select",
      "value": "select",
      "label": "Dropdown chọn 1",
      "description": "Dropdown chọn 1 giá trị",
      "icon": "arrow-drop-down",
      "color": "green"
    },
    {
      "id": "multiselect",
      "name": "multiselect",
      "value": "multiselect",
      "label": "Chọn nhiều giá trị",
      "description": "Checkbox chọn nhiều giá trị",
      "icon": "check-box",
      "color": "purple"
    },
    {
      "id": "color",
      "name": "color",
      "value": "color",
      "label": "Màu sắc",
      "description": "Color picker chọn màu",
      "icon": "color-lens",
      "color": "orange"
    },
    {
      "id": "image",
      "name": "image",
      "value": "image",
      "label": "Hình ảnh",
      "description": "Image selector chọn hình",
      "icon": "image",
      "color": "pink"
    }
  ]
}
```

### API Lấy Enum cụ thể
**GET** `/enums/{enum_name}`

**Các enum có sẵn:**
- `basic_status` - Trạng thái cơ bản (active/inactive)
- `product_status` - Trạng thái sản phẩm (active/inactive/draft)
- `order_status` - Trạng thái đơn hàng
- `payment_status` - Trạng thái thanh toán
- `shipping_status` - Trạng thái vận chuyển
- `coupon_type` - Loại mã giảm giá
- `coupon_status` - Trạng thái mã giảm giá
- `review_status` - Trạng thái đánh giá
- `attribute_type` - Kiểu thuộc tính sản phẩm

**Ví dụ lấy kiểu thuộc tính:**
```javascript
const response = await fetch('/api/enums/attribute_type');
const attributeTypes = await response.json();
// Dùng để populate dropdown kiểu thuộc tính
```

### Sử dụng Enums trong Form
```javascript
// Lấy enums khi load trang
async function loadEnums() {
  const response = await fetch('/api/enums');
  const enums = await response.json();
  
  // Populate dropdown kiểu thuộc tính
  const typeSelect = document.getElementById('type');
  enums.attribute_type.forEach(type => {
    const option = document.createElement('option');
    option.value = type.value;
    option.textContent = type.label;
    option.setAttribute('data-icon', type.icon);
    option.setAttribute('data-color', type.color);
    typeSelect.appendChild(option);
  });
}
```

## CÁC TRƯỜNG BOOLEAN TRONG THUỘC TÍNH

Các trường boolean có thể nhận giá trị `true`/`false`:

| Trường | Mô tả khi true | Mô tả khi false |
|--------|----------------|-----------------|
| `is_required` | Bắt buộc phải chọn | Không bắt buộc |
| `is_variation` | Tạo biến thể sản phẩm | Không tạo biến thể |
| `is_filterable` | Có thể dùng để lọc sản phẩm | Không dùng để lọc |
| `is_visible_on_frontend` | Hiển thị trên frontend | Ẩn trên frontend |

### Trạng thái thuộc tính
Sử dụng enum `basic_status` với các giá trị:
- `active`: Hoạt động
- `inactive`: Không hoạt động

## TÍCH HỢP HOÀN CHỈNH CHO FRONTEND

### Flow khởi tạo ứng dụng:
```javascript
// App initialization
async function initializeApp() {
  try {
    // 1. Load all enums
    await loadEnums();
    
    // 2. Load user permissions
    await loadUserPermissions();
    
    // 3. Initialize routes
    initializeRoutes();
    
    console.log('App initialized successfully');
  } catch (error) {
    console.error('App initialization failed:', error);
  }
}

// Load enums và lưu vào global state
async function loadEnums() {
  const response = await fetch('/api/enums');
  const enums = await response.json();
  
  // Lưu vào window.enums để dùng toàn app
  window.enums = enums;
  
  // Hoặc dùng với state management
  // store.commit('setEnums', enums);
}

// Helper function để lấy enum
function getEnum(enumName) {
  return window.enums?.[enumName] || [];
}

// Sử dụng trong component
function AttributeTypeSelector() {
  const attributeTypes = getEnum('attribute_type');
  
  return `
    <select name="type">
      ${attributeTypes.map(type => `
        <option value="${type.value}" 
                data-icon="${type.icon}" 
                data-color="${type.color}">
          ${type.label}
        </option>
      `).join('')}
    </select>
  `;
}
```

## 1. API THUỘC TÍNH SẢN PHẨM (Product Attributes)

### 1.1. Lấy danh sách thuộc tính
**GET** `/admin/product-attributes`

**Parameters:**
| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| search | string | Tìm kiếm theo tên | No |
| type | string | Lọc theo kiểu thuộc tính (text/select/color/image) | No |
| include_values | boolean | Có kèm giá trị thuộc tính không | No |
| include_deleted | boolean | Có bao gồm đã xóa không | No |
| page | number | Trang hiện tại | No |
| limit | number | Số bản ghi mỗi trang | No |
| sort | string | Sắp xếp (vd: name:ASC, created_at:DESC) | No |

**Response Example:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Màu sắc",
      "code": "mau-sac",
      "type": "select",
      "is_required": true,
      "is_variation": true,
      "is_filterable": true,
      "status": "active",
      "sort_order": 0,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 20,
    "total_pages": 1
  }
}
```

### 1.2. Lấy thuộc tính theo ID
**GET** `/admin/product-attributes/{id}`

**Response Example:**
```json
{
  "id": 1,
  "name": "Màu sắc",
  "code": "mau-sac",
  "type": "select",
  "description": "Màu sắc sản phẩm",
  "is_required": true,
  "is_variation": true,
  "is_filterable": true,
  "is_visible_on_frontend": true,
  "sort_order": 0,
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 1.3. Lấy thuộc tính kèm giá trị
**GET** `/admin/product-attributes/with-values`

**Response Example:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Màu sắc",
      "code": "mau-sac",
      "type": "select",
      "values": [
        {
          "id": 1,
          "value": "Đỏ",
          "sort_order": 0,
          "status": "active"
        },
        {
          "id": 2,
          "value": "Xanh",
          "sort_order": 1,
          "status": "active"
        }
      ]
    }
  ]
}
```

### 1.4. Tạo thuộc tính mới
**POST** `/admin/product-attributes`

**Request Body:**
```json
{
  "name": "Kích thước",
  "code": "kich-thuoc",
  "type": "select",
  "description": "Kích thước sản phẩm",
  "is_required": true,
  "is_variation": true,
  "is_filterable": true,
  "is_visible_on_frontend": true,
  "sort_order": 1,
  "status": "active"
}
```

**Response:** Giống như GET by ID

### 1.5. Cập nhật thuộc tính
**PUT** `/admin/product-attributes/{id}`

**Request Body:** Giống create nhưng tất cả field optional

### 1.6. Xóa thuộc tính
**DELETE** `/admin/product-attributes/{id}`

**Response:**
```json
{
  "message": "Product attribute deleted successfully"
}
```

## 2. API GIÁ TRỊ THUỘC TÍNH (Attribute Values)

### 2.1. Lấy giá trị theo thuộc tính
**GET** `/admin/product-attribute-values/attribute/{attributeId}`

**Response Example:**
```json
{
  "data": [
    {
      "id": 1,
      "product_attribute_id": 1,
      "value": "Đỏ",
      "color_code": null,
      "image": null,
      "sort_order": 0,
      "status": "active"
    },
    {
      "id": 2,
      "product_attribute_id": 1,
      "value": "Xanh",
      "color_code": null,
      "image": null,
      "sort_order": 1,
      "status": "active"
    }
  ]
}
```

### 2.2. Tạo giá trị thuộc tính
**POST** `/admin/product-attribute-values`

**Request Body:**
```json
{
  "product_attribute_id": 1,
  "value": "Vàng",
  "sort_order": 2,
  "status": "active"
}
```

### 2.3. Cập nhật giá trị
**PUT** `/admin/product-attribute-values/{id}`

**Request Body:**
```json
{
  "value": "Vàng chanh",
  "sort_order": 2,
  "color_code": "#FFD700",
  "image": null,
  "status": "active"
}
```

## 3. HƯỚNG DẪN TÍCH HỢP CHO FRONTEND

### 3.1. Flow quản lý thuộc tính

1. **Hiển thị danh sách thuộc tính:**
```javascript
// Lấy danh sách thuộc tính có phân trang
const response = await fetch('/api/admin/product-attributes?page=1&limit=20');
const data = await response.json();
```

2. **Tạo thuộc tính mới:**
```javascript
const newAttribute = {
  name: "Chất liệu",
  code: "chat-lieu",
  type: "select",
  description: "Chất liệu sản phẩm",
  is_required: false,
  is_variation: false,
  is_filterable: true,
  is_visible_on_frontend: true,
  sort_order: 0,
  status: "active"
};

const response = await fetch('/api/admin/product-attributes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(newAttribute)
});
```

3. **Thêm giá trị cho thuộc tính:**
```javascript
const newValue = {
  product_attribute_id: 3,
  value: "Cotton",
  sort_order: 0,
  status: "active"
};

await fetch('/api/admin/product-attribute-values', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(newValue)
});
```

### 3.2. Form tạo/sửa thuộc tính

**HTML Structure:**
```html
<form id="attributeForm">
  <div class="form-group">
    <label>Tên thuộc tính:</label>
    <input type="text" name="name" required>
  </div>
  
  <div class="form-group">
    <label>Code (slug):</label>
    <input type="text" name="code" required>
  </div>
  
  <div class="form-group">
    <label>Kiểu hiển thị:</label>
    <select name="type" id="type">
      <!-- Options will be populated by JavaScript -->
    </select>
  </div>
  
  <div class="form-group">
    <label>Mô tả:</label>
    <textarea name="description" rows="3"></textarea>
  </div>
  
  <div class="form-group">
    <label>Thứ tự:</label>
    <input type="number" name="sort_order" value="0" min="0">
  </div>
  
  <div class="form-group">
    <label>Trạng thái:</label>
    <select name="status" id="status">
      <!-- Options will be populated by JavaScript -->
    </select>
  </div>
  
  <div class="form-group">
    <label>
      <input type="checkbox" name="is_required"> Bắt buộc
    </label>
  </div>
  
  <div class="form-group">
    <label>
      <input type="checkbox" name="is_variation"> Là biến thể
    </label>
  </div>
  
  <div class="form-group">
    <label>
      <input type="checkbox" name="is_filterable"> Cho phép lọc
    </label>
  </div>
  
  <button type="submit">Lưu</button>
</form>
```

**JavaScript:**
```javascript
document.getElementById('attributeForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const attributeData = {
    name: formData.get('name'),
    code: formData.get('code'),
    type: formData.get('type'),
    description: formData.get('description') || '',
    is_required: formData.get('is_required') === 'on',
    is_variation: formData.get('is_variation') === 'on',
    is_filterable: formData.get('is_filterable') === 'on',
    is_visible_on_frontend: formData.get('is_visible_on_frontend') === 'on',
    sort_order: parseInt(formData.get('sort_order')) || 0,
    status: formData.get('status') || 'active'
  };
  
  try {
    const response = await fetch('/api/admin/product-attributes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(attributeData)
    });
    
    if (response.ok) {
      alert('Tạo thuộc tính thành công!');
      // Reload danh sách hoặc redirect
    } else {
      const error = await response.json();
      alert('Lỗi: ' + error.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
});
```

### 3.3. Quản lý giá trị thuộc tính

**Hiển thị và thêm giá trị:**
```javascript
// Lấy giá trị của thuộc tính
async function loadAttributeValues(attributeId) {
  const response = await fetch(`/api/admin/product-attribute-values/attribute/${attributeId}`);
  const data = await response.json();
  
  const valuesList = document.getElementById('valuesList');
  valuesList.innerHTML = data.data.map(value => `
    <div class="value-item">
      <input type="text" value="${value.value}" data-id="${value.id}">
      <button onclick="updateValue(${value.id})">Cập nhật</button>
      <button onclick="deleteValue(${value.id})">Xóa</button>
    </div>
  `).join('');
}

// Thêm giá trị mới
async function addValue(attributeId, valueText) {
  const response = await fetch('/api/admin/product-attribute-values', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      product_attribute_id: attributeId,
      value: valueText,
      sort_order: 0,
      status: "active"
    })
  });
  
  if (response.ok) {
    loadAttributeValues(attributeId); // Reload danh sách
  }
}
```

## 4. LƯU Ý QUAN TRỌNG

### 4.1. Validation Rules
- **Code (slug)**: Chỉ chữ thường, số và dấu gạch ngang
- **Tên thuộc tính**: Không trùng lặp
- **Giá trị**: Không được trùng trong cùng thuộc tính

### 4.2. Business Logic
- Không thể xóa thuộc tính đang được sản phẩm sử dụng
- Khi xóa thuộc tính, các giá trị liên quan cũng bị xóa
- Thay đổi `is_variation` ảnh hưởng đến cách tạo biến thể sản phẩm

### 4.3. Error Handling
```javascript
try {
  const response = await fetch('/api/admin/product-attributes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    switch (response.status) {
      case 400:
        alert('Dữ liệu không hợp lệ: ' + error.message);
        break;
      case 401:
        alert('Không có quyền truy cập');
        break;
      case 409:
        alert('Thuộc tính đã tồn tại');
        break;
      default:
        alert('Lỗi server: ' + error.message);
    }
  }
} catch (error) {
  console.error('Network error:', error);
  alert('Lỗi kết nối server');
}
```

## 5. TESTING

### 5.1. Test Cases
1. Tạo thuộc tính mới với đầy đủ field
2. Cập nhật thuộc tính
3. Thêm/xóa giá trị thuộc tính
4. Xóa thuộc tính có giá trị
5. Lọc và tìm kiếm thuộc tính
6. Phân trang danh sách

### 5.2. Edge Cases
- Code trùng lặp
- Tên thuộc tính trống
- Giá trị trùng trong cùng thuộc tính
- Xóa thuộc tính đang được sử dụng

## 6. SECURITY NOTES
- Luôn validate dữ liệu đầu vào
- Kiểm tra quyền truy cập
- XSS protection khi hiển thị dữ liệu
- Rate limiting cho các API công khai