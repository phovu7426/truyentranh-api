# Admin Product Attributes API

API quản lý thuộc tính sản phẩm (product attributes) - màu sắc, kích thước, dung lượng, v.v.

## Cấu trúc

- Base URL: `http://localhost:3000/api`
- Authentication: JWT Bearer Token (bắt buộc)
- Permission: `product:manage`
- Headers: `Content-Type: application/json`

---

## 1. Get Attributes List (Lấy danh sách thuộc tính)

### Request

```bash
curl -X GET "http://localhost:3000/api/admin/product-attributes?page=1&limit=20" \
  -H "Authorization: Bearer {{auth_token}}"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Màu sắc",
      "code": "color",
      "type": "select",
      "display_order": 1,
      "is_required": false,
      "is_filterable": true,
      "values": [
        {"id": 1, "value": "Đen", "color_code": "#000000"},
        {"id": 2, "value": "Trắng", "color_code": "#FFFFFF"}
      ]
    },
    {
      "id": 2,
      "name": "Dung lượng",
      "code": "storage",
      "type": "select",
      "display_order": 2,
      "is_required": true,
      "is_filterable": true,
      "values": [
        {"id": 3, "value": "128GB"},
        {"id": 4, "value": "256GB"},
        {"id": 5, "value": "512GB"}
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 10
  }
}
```

---

## 2. Get Attribute by ID

### Request

```bash
curl -X GET http://localhost:3000/api/admin/product-attributes/1 \
  -H "Authorization: Bearer {{auth_token}}"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Màu sắc",
    "code": "color",
    "type": "select",
    "description": "Màu sắc của sản phẩm",
    "display_order": 1,
    "is_required": false,
    "is_filterable": true,
    "is_visible_on_front": true,
    "values": [
      {
        "id": 1,
        "value": "Đen",
        "display_value": "Màu đen",
        "color_code": "#000000",
        "image": null,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T05:00:00.000Z"
  }
}
```

---

## 3. Create Attribute

### Request

```bash
curl -X POST http://localhost:3000/api/admin/product-attributes \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kích thước màn hình",
    "code": "screen_size",
    "type": "select",
    "is_required": false,
    "is_filterable": true,
    "values": [
      {"value": "6.1 inch"},
      {"value": "6.7 inch"}
    ]
  }'
```

### Request Body

```json
{
  "name": "Kích thước màn hình",
  "code": "screen_size",
  "type": "select",
  "description": "Kích thước màn hình của điện thoại",
  "display_order": 3,
  "is_required": false,
  "is_filterable": true,
  "is_visible_on_front": true,
  "values": [
    {
      "value": "6.1 inch",
      "display_value": "6.1 inch",
      "display_order": 1
    },
    {
      "value": "6.7 inch",
      "display_value": "6.7 inch",
      "display_order": 2
    }
  ]
}
```

**Fields:**
- `name` (required): Tên thuộc tính
- `code` (required): Mã code (unique, lowercase, underscore)
- `type` (required): Loại (`select`, `text`, `color`, `image`)
- `description` (optional): Mô tả
- `display_order` (optional): Thứ tự hiển thị
- `is_required` (optional): Bắt buộc (default: false)
- `is_filterable` (optional): Có thể lọc (default: true)
- `is_visible_on_front` (optional): Hiển thị ngoài front (default: true)
- `values` (optional): Mảng giá trị

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 11,
    "name": "Kích thước màn hình",
    "code": "screen_size",
    "type": "select"
  },
  "message": "Tạo thuộc tính thành công"
}
```

---

## 4. Update Attribute

### Request

```bash
curl -X PUT http://localhost:3000/api/admin/product-attributes/1 \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Màu sắc sản phẩm",
    "is_filterable": true
  }'
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Màu sắc sản phẩm",
    "updated_at": "2025-01-11T06:00:00.000Z"
  },
  "message": "Cập nhật thuộc tính thành công"
}
```

---

## 5. Delete Attribute

### Request

```bash
curl -X DELETE http://localhost:3000/api/admin/product-attributes/1 \
  -H "Authorization: Bearer {{auth_token}}"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Xóa thuộc tính thành công"
}
```

---

## 6. Add Attribute Value

### Request

```bash
curl -X POST http://localhost:3000/api/admin/product-attributes/1/values \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "value": "Xanh dương",
    "color_code": "#0000FF"
  }'
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "attribute_id": 1,
    "value": "Xanh dương",
    "color_code": "#0000FF"
  },
  "message": "Thêm giá trị thành công"
}
```

---

## Attribute Types

- `select`: Dropdown selection
- `text`: Text input
- `color`: Color picker
- `image`: Image selection

---

**Xem thêm:**
- [Admin Products API](./product.md)
- [Admin Product Variants API](./product-variant.md)