# Admin Product Attribute Value API

API quản lý giá trị thuộc tính sản phẩm (product attribute values) dành cho quản trị viên - yêu cầu authentication và permissions.

## Cấu trúc

- Base URL: `http://localhost:3000/api`
- Authentication: JWT Bearer Token (bắt buộc)
- Headers: `Content-Type: application/json`
- Required Permission: `product-attribute-value:*` (tùy theo endpoint)

---

## 1. Get Product Attribute Values List (Lấy danh sách giá trị thuộc tính)

Lấy danh sách tất cả giá trị thuộc tính sản phẩm với phân trang và bộ lọc.

### Endpoint
```
GET /api/admin/product-attribute-values
```

### Query Parameters
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| page | number | Không | Số trang (mặc định: 1) |
| limit | number | Không | Số lượng mỗi trang (mặc định: 10) |
| search | string | Không | Tìm kiếm theo giá trị |
| attribute_id | number | Không | Lọc theo ID thuộc tính |
| status | string | Không | Lọc theo trạng thái |
| sortBy | string | Không | Sắp xếp theo trường |
| sortOrder | string | Không | Thứ tự sắp xếp (ASC/DESC) |

### Request Example

```bash
curl -X GET "http://localhost:3000/api/admin/product-attribute-values?page=1&limit=10&attribute_id=1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy danh sách giá trị thuộc tính thành công",
  "data": [
    {
      "id": 1,
      "attribute_id": 1,
      "value": "Đen",
      "display_value": "Đen",
      "sort_order": 1,
      "status": "active",
      "attribute": {
        "id": 1,
        "name": "Màu sắc",
        "type": "color",
        "is_required": true
      },
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-15T10:30:00.000Z"
    },
    {
      "id": 2,
      "attribute_id": 1,
      "value": "Trắng",
      "display_value": "Trắng",
      "sort_order": 2,
      "status": "active",
      "attribute": {
        "id": 1,
        "name": "Màu sắc",
        "type": "color",
        "is_required": true
      },
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 15,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## 2. Get Product Attribute Value by ID (Lấy chi tiết giá trị thuộc tính)

Lấy thông tin chi tiết của một giá trị thuộc tính cụ thể.

### Endpoint
```
GET /api/admin/product-attribute-values/:id
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của giá trị thuộc tính |

### Request Example

```bash
curl -X GET "http://localhost:3000/api/admin/product-attribute-values/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy thông tin giá trị thuộc tính thành công",
  "data": {
    "id": 1,
    "attribute_id": 1,
    "value": "Đen",
    "display_value": "Đen",
    "hex_code": "#000000",
    "image_url": null,
    "sort_order": 1,
    "status": "active",
    "attribute": {
      "id": 1,
      "name": "Màu sắc",
      "type": "color",
      "is_required": true,
      "is_filterable": true
    },
    "product_variants_count": 5,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-15T10:30:00.000Z"
  }
}
```

---

## 3. Get Attribute Values by Attribute ID (Lấy giá trị theo thuộc tính)

Lấy tất cả giá trị của một thuộc tính cụ thể.

### Endpoint
```
GET /api/admin/product-attribute-values/attribute/:attributeId
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| attributeId | number | ID của thuộc tính |

### Request Example

```bash
curl -X GET "http://localhost:3000/api/admin/product-attribute-values/attribute/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy danh sách giá trị thuộc tính thành công",
  "data": [
    {
      "id": 1,
      "attribute_id": 1,
      "value": "Đen",
      "display_value": "Đen",
      "hex_code": "#000000",
      "sort_order": 1,
      "status": "active"
    },
    {
      "id": 2,
      "attribute_id": 1,
      "value": "Trắng",
      "display_value": "Trắng",
      "hex_code": "#FFFFFF",
      "sort_order": 2,
      "status": "active"
    },
    {
      "id": 3,
      "attribute_id": 1,
      "value": "Xanh",
      "display_value": "Xanh dương",
      "hex_code": "#0000FF",
      "sort_order": 3,
      "status": "active"
    }
  ]
}
```

---

## 4. Create Product Attribute Value (Tạo giá trị thuộc tính mới)

Tạo một giá trị thuộc tính mới.

### Endpoint
```
POST /api/admin/product-attribute-values
```

### Request Body
```json
{
  "attribute_id": 1,
  "value": "Đỏ",
  "display_value": "Đỏ",
  "hex_code": "#FF0000",
  "image_url": null,
  "sort_order": 4,
  "status": "active"
}
```

**Fields:**
- `attribute_id` (required): ID của thuộc tính cha
- `value` (required): Giá trị (duy nhất trong cùng thuộc tính)
- `display_value` (optional): Giá trị hiển thị (mặc định: value)
- `hex_code` (optional): Mã màu (cho thuộc tính màu)
- `image_url` (optional): URL hình ảnh (cho thuộc tính hình ảnh)
- `sort_order` (optional): Thứ tự sắp xếp
- `status` (required): Trạng thái (active/inactive)

### Request Example

```bash
curl -X POST "http://localhost:3000/api/admin/product-attribute-values" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "attribute_id": 1,
    "value": "Đỏ",
    "display_value": "Đỏ",
    "hex_code": "#FF0000",
    "sort_order": 4,
    "status": "active"
  }'
```

### Response

**Success (201):**
```json
{
  "success": true,
  "message": "Tạo giá trị thuộc tính thành công",
  "data": {
    "id": 16,
    "attribute_id": 1,
    "value": "Đỏ",
    "display_value": "Đỏ",
    "hex_code": "#FF0000",
    "image_url": null,
    "sort_order": 4,
    "status": "active",
    "created_at": "2025-01-20T08:30:00.000Z",
    "updated_at": "2025-01-20T08:30:00.000Z"
  }
}
```

---

## 5. Update Product Attribute Value (Cập nhật giá trị thuộc tính)

Cập nhật thông tin của một giá trị thuộc tính.

### Endpoint
```
PUT /api/admin/product-attribute-values/:id
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của giá trị thuộc tính |

### Request Body
```json
{
  "display_value": "Đỏ đậm",
  "hex_code": "#8B0000",
  "sort_order": 4,
  "status": "active"
}
```

### Request Example

```bash
curl -X PUT "http://localhost:3000/api/admin/product-attribute-values/16" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "display_value": "Đỏ đậm",
    "hex_code": "#8B0000",
    "sort_order": 4,
    "status": "active"
  }'
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Cập nhật giá trị thuộc tính thành công",
  "data": {
    "id": 16,
    "attribute_id": 1,
    "value": "Đỏ",
    "display_value": "Đỏ đậm",
    "hex_code": "#8B0000",
    "image_url": null,
    "sort_order": 4,
    "status": "active",
    "updated_at": "2025-01-20T09:15:00.000Z"
  }
}
```

---

## 6. Restore Product Attribute Value (Khôi phục giá trị thuộc tính)

Khôi phục một giá trị thuộc tính đã bị xóa.

### Endpoint
```
PUT /api/admin/product-attribute-values/:id/restore
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của giá trị thuộc tính |

### Request Example

```bash
curl -X PUT "http://localhost:3000/api/admin/product-attribute-values/16/restore" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Khôi phục giá trị thuộc tính thành công",
  "data": {
    "id": 16,
    "value": "Đỏ",
    "display_value": "Đỏ đậm",
    "status": "active",
    "deleted_at": null,
    "updated_at": "2025-01-20T10:30:00.000Z"
  }
}
```

---

## 7. Delete Product Attribute Value (Xóa giá trị thuộc tính)

Xóa một giá trị thuộc tính.

### Endpoint
```
DELETE /api/admin/product-attribute-values/:id
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của giá trị thuộc tính |

### Request Example

```bash
curl -X DELETE "http://localhost:3000/api/admin/product-attribute-values/16" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Xóa giá trị thuộc tính thành công",
  "data": null
}
```

---

## 8. Bulk Update Sort Order (Cập nhật thứ tự hàng loạt)

Cập nhật thứ tự sắp xếp cho nhiều giá trị thuộc tính cùng lúc.

### Endpoint
```
PUT /api/admin/product-attribute-values/bulk-sort-order
```

### Request Body
```json
{
  "attribute_values": [
    {
      "id": 1,
      "sort_order": 1
    },
    {
      "id": 2,
      "sort_order": 2
    },
    {
      "id": 3,
      "sort_order": 3
    },
    {
      "id": 16,
      "sort_order": 4
    }
  ]
}
```

**Fields:**
- `attribute_values` (required): Mảng các giá trị thuộc tính cần cập nhật thứ tự

### Request Example

```bash
curl -X PUT "http://localhost:3000/api/admin/product-attribute-values/bulk-sort-order" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "attribute_values": [
      {
        "id": 1,
        "sort_order": 1
      },
      {
        "id": 2,
        "sort_order": 2
      },
      {
        "id": 3,
        "sort_order": 3
      },
      {
        "id": 16,
        "sort_order": 4
      }
    ]
  }'
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Cập nhật thứ tự thành công",
  "data": {
    "updated_count": 4
  }
}
```

---

## 9. Get Attribute Values with Variants Count (Lấy giá trị kèm số lượng biến thể)

Lấy danh sách giá trị thuộc tính kèm theo số lượng biến thể sản phẩm đang sử dụng.

### Endpoint
```
GET /api/admin/product-attribute-values/with-variants-count/:attributeId
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| attributeId | number | ID của thuộc tính |

### Request Example

```bash
curl -X GET "http://localhost:3000/api/admin/product-attribute-values/with-variants-count/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy danh sách giá trị thuộc tính thành công",
  "data": [
    {
      "id": 1,
      "value": "Đen",
      "display_value": "Đen",
      "hex_code": "#000000",
      "sort_order": 1,
      "status": "active",
      "variants_count": 8
    },
    {
      "id": 2,
      "value": "Trắng",
      "display_value": "Trắng",
      "hex_code": "#FFFFFF",
      "sort_order": 2,
      "status": "active",
      "variants_count": 6
    },
    {
      "id": 3,
      "value": "Xanh",
      "display_value": "Xanh dương",
      "hex_code": "#0000FF",
      "sort_order": 3,
      "status": "active",
      "variants_count": 4
    }
  ]
}
```

---

## Attribute Value Status

| Status | Description |
|--------|-------------|
| `active` | Đang hoạt động và có thể sử dụng |
| `inactive` | Không hoạt động, không hiển thị |

---

## Attribute Types & Fields

| Type | Description | Additional Fields |
|------|-------------|-------------------|
| `text` | Văn bản thông thường | value, display_value |
| `number` | Giá trị số | value, display_value |
| `color` | Màu sắc | value, display_value, hex_code |
| `image` | Hình ảnh | value, display_value, image_url |
| `boolean` | Đúng/Sai | value, display_value |

---

## Use Cases

### Use Case 1: Quản lý màu sắc sản phẩm

```bash
# 1. Lấy thuộc tính màu sắc
GET /api/admin/product-attributes/1

# 2. Thêm màu mới
POST /api/admin/product-attribute-values
{
  "attribute_id": 1,
  "value": "Tím",
  "display_value": "Tím nhạt",
  "hex_code": "#E6E6FA",
  "sort_order": 5,
  "status": "active"
}

# 3. Xem tất cả màu sắc
GET /api/admin/product-attribute-values/attribute/1

# 4. Sắp xếp lại màu sắc
PUT /api/admin/product-attribute-values/bulk-sort-order
{
  "attribute_values": [
    {"id": 1, "sort_order": 1},
    {"id": 2, "sort_order": 2},
    {"id": 3, "sort_order": 3},
    {"id": 16, "sort_order": 4},
    {"id": 17, "sort_order": 5}
  ]
}
```

### Use Case 2: Quản lý dung lượng lưu trữ

```bash
# 1. Thêm dung lượng mới cho thuộc tính "Dung lượng"
POST /api/admin/product-attribute-values
{
  "attribute_id": 2,
  "value": "1TB",
  "display_value": "1TB",
  "sort_order": 5,
  "status": "active"
}

# 2. Kiểm tra các biến thể đang sử dụng dung lượng này
GET /api/admin/product-attribute-values/with-variants-count/2

# 3. Nếu không có biến thể nào sử dụng, có thể xóa
DELETE /api/admin/product-attribute-values/18
```

### Use Case 3: Quản lý kích thước quần áo

```bash
# 1. Thêm kích thước mới
POST /api/admin/product-attribute-values
{
  "attribute_id": 3,
  "value": "3XL",
  "display_value": "3XL",
  "sort_order": 7,
  "status": "active"
}

# 2. Cập nhật hiển thị
PUT /api/admin/product-attribute-values/19
{
  "display_value": "3XL (Extra Large)"
}

# 3. Kiểm tra các sản phẩm đang dùng kích thước này
GET /api/admin/product-variants?search=3XL
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid data |
| 401 | Unauthorized - Invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Attribute value not found |
| 409 | Conflict - Duplicate value in same attribute |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error |

---

**Xem thêm:**
- [Admin Product Attribute API](./product-attribute.md)
- [Admin Product Variant API](./product-variant.md)
- [Admin Product API](./product.md)