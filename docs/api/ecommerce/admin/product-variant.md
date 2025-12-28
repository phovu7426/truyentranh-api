# Admin Product Variant API

API quản lý biến thể sản phẩm (product variants) dành cho quản trị viên - yêu cầu authentication và permissions.

## Cấu trúc

- Base URL: `http://localhost:3000/api`
- Authentication: JWT Bearer Token (bắt buộc)
- Headers: `Content-Type: application/json`
- Required Permission: `product-variant:*` (tùy theo endpoint)

---

## 1. Get Product Variants List (Lấy danh sách biến thể sản phẩm)

Lấy danh sách tất cả biến thể sản phẩm với phân trang và bộ lọc.

### Endpoint
```
GET /api/admin/product-variants
```

### Query Parameters
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| page | number | Không | Số trang (mặc định: 1) |
| limit | number | Không | Số lượng mỗi trang (mặc định: 10) |
| search | string | Không | Tìm kiếm theo tên hoặc SKU |
| product_id | number | Không | Lọc theo ID sản phẩm |
| status | string | Không | Lọc theo trạng thái |
| min_price | number | Không | Giá tối thiểu |
| max_price | number | Không | Giá tối đa |
| sortBy | string | Không | Sắp xếp theo trường |
| sortOrder | string | Không | Thứ tự sắp xếp (ASC/DESC) |

### Request Example

```bash
curl -X GET "http://localhost:3000/api/admin/product-variants?page=1&limit=10&product_id=1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy danh sách biến thể sản phẩm thành công",
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "sku": "IP15PRO-128GB-BLACK",
      "name": "iPhone 15 Pro - 128GB - Đen",
      "price": 29990000,
      "sale_price": 27990000,
      "stock_quantity": 50,
      "weight": 0.2,
      "dimensions": {
        "length": 15,
        "width": 7.5,
        "height": 0.8
      },
      "image_url": "https://example.com/iphone15pro-black.jpg",
      "status": "active",
      "track_inventory": true,
      "allow_backorder": false,
      "product": {
        "id": 1,
        "name": "iPhone 15 Pro",
        "slug": "iphone-15-pro"
      },
      "attributes": [
        {
          "id": 1,
          "name": "Màu sắc",
          "value": "Đen"
        },
        {
          "id": 2,
          "name": "Dung lượng",
          "value": "128GB"
        }
      ],
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## 2. Get Product Variant by ID (Lấy chi tiết biến thể sản phẩm)

Lấy thông tin chi tiết của một biến thể sản phẩm cụ thể.

### Endpoint
```
GET /api/admin/product-variants/:id
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của biến thể sản phẩm |

### Request Example

```bash
curl -X GET "http://localhost:3000/api/admin/product-variants/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy thông tin biến thể sản phẩm thành công",
  "data": {
    "id": 1,
    "product_id": 1,
    "sku": "IP15PRO-128GB-BLACK",
    "name": "iPhone 15 Pro - 128GB - Đen",
    "description": "iPhone 15 Pro màu đen, dung lượng 128GB",
    "price": 29990000,
    "sale_price": 27990000,
    "cost_price": 25000000,
    "stock_quantity": 50,
    "min_stock_level": 10,
    "max_stock_level": 100,
    "weight": 0.2,
    "dimensions": {
      "length": 15,
      "width": 7.5,
      "height": 0.8
    },
    "image_url": "https://example.com/iphone15pro-black.jpg",
    "images": [
      "https://example.com/iphone15pro-black-1.jpg",
      "https://example.com/iphone15pro-black-2.jpg"
    ],
    "status": "active",
    "track_inventory": true,
    "allow_backorder": false,
    "requires_shipping": true,
    "taxable": true,
    "product": {
      "id": 1,
      "name": "iPhone 15 Pro",
      "slug": "iphone-15-pro",
      "status": "active"
    },
    "attributes": [
      {
        "id": 1,
        "attribute_id": 1,
        "name": "Màu sắc",
        "value": "Đen",
        "attribute_value_id": 1
      },
      {
        "id": 2,
        "attribute_id": 2,
        "name": "Dung lượng",
        "value": "128GB",
        "attribute_value_id": 3
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-15T10:30:00.000Z"
  }
}
```

---

## 3. Get Product Variants by Product ID (Lấy biến thể theo sản phẩm)

Lấy tất cả biến thể của một sản phẩm cụ thể.

### Endpoint
```
GET /api/admin/product-variants/product/:productId
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| productId | number | ID của sản phẩm |

### Request Example

```bash
curl -X GET "http://localhost:3000/api/admin/product-variants/product/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy danh sách biến thể sản phẩm thành công",
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "sku": "IP15PRO-128GB-BLACK",
      "name": "iPhone 15 Pro - 128GB - Đen",
      "price": 29990000,
      "sale_price": 27990000,
      "stock_quantity": 50,
      "status": "active",
      "attributes": [
        {
          "name": "Màu sắc",
          "value": "Đen"
        },
        {
          "name": "Dung lượng",
          "value": "128GB"
        }
      ]
    },
    {
      "id": 2,
      "product_id": 1,
      "sku": "IP15PRO-256GB-BLACK",
      "name": "iPhone 15 Pro - 256GB - Đen",
      "price": 33990000,
      "sale_price": 31990000,
      "stock_quantity": 30,
      "status": "active",
      "attributes": [
        {
          "name": "Màu sắc",
          "value": "Đen"
        },
        {
          "name": "Dung lượng",
          "value": "256GB"
        }
      ]
    }
  ]
}
```

---

## 4. Get Product Variant by SKU (Lấy biến thể theo SKU)

Tìm biến thể sản phẩm theo mã SKU.

### Endpoint
```
GET /api/admin/product-variants/sku/:sku
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| sku | string | SKU của biến thể sản phẩm |

### Request Example

```bash
curl -X GET "http://localhost:3000/api/admin/product-variants/sku/IP15PRO-128GB-BLACK" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy thông tin biến thể sản phẩm thành công",
  "data": {
    "id": 1,
    "product_id": 1,
    "sku": "IP15PRO-128GB-BLACK",
    "name": "iPhone 15 Pro - 128GB - Đen",
    "price": 29990000,
    "sale_price": 27990000,
    "stock_quantity": 50,
    "status": "active",
    "attributes": [...]
  }
}
```

---

## 5. Search Product Variants (Tìm kiếm biến thể sản phẩm)

Tìm kiếm biến thể sản phẩm theo các thuộc tính.

### Endpoint
```
POST /api/admin/product-variants/search
```

### Request Body
```json
{
  "product_id": 1,
  "attributes": [
    {
      "attribute_id": 1,
      "attribute_value_id": 1
    },
    {
      "attribute_id": 2,
      "attribute_value_id": 3
    }
  ]
}
```

**Fields:**
- `product_id` (required): ID của sản phẩm
- `attributes` (required): Mảng các thuộc tính cần tìm

### Request Example

```bash
curl -X POST "http://localhost:3000/api/admin/product-variants/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "product_id": 1,
    "attributes": [
      {
        "attribute_id": 1,
        "attribute_value_id": 1
      },
      {
        "attribute_id": 2,
        "attribute_value_id": 3
      }
    ]
  }'
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Tìm kiếm biến thể sản phẩm thành công",
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "sku": "IP15PRO-128GB-BLACK",
      "name": "iPhone 15 Pro - 128GB - Đen",
      "price": 29990000,
      "sale_price": 27990000,
      "stock_quantity": 50,
      "status": "active",
      "attributes": [
        {
          "attribute_id": 1,
          "name": "Màu sắc",
          "value": "Đen"
        },
        {
          "attribute_id": 2,
          "name": "Dung lượng",
          "value": "128GB"
        }
      ]
    }
  ]
}
```

---

## 6. Create Product Variant (Tạo biến thể sản phẩm mới)

Tạo một biến thể sản phẩm mới.

### Endpoint
```
POST /api/admin/product-variants
```

### Request Body
```json
{
  "product_id": 1,
  "sku": "IP15PRO-512GB-WHITE",
  "name": "iPhone 15 Pro - 512GB - Trắng",
  "description": "iPhone 15 Pro màu trắng, dung lượng 512GB",
  "price": 39990000,
  "sale_price": 37990000,
  "cost_price": 35000000,
  "stock_quantity": 20,
  "min_stock_level": 5,
  "max_stock_level": 50,
  "weight": 0.2,
  "dimensions": {
    "length": 15,
    "width": 7.5,
    "height": 0.8
  },
  "image_url": "https://example.com/iphone15pro-white.jpg",
  "images": [
    "https://example.com/iphone15pro-white-1.jpg",
    "https://example.com/iphone15pro-white-2.jpg"
  ],
  "status": "active",
  "track_inventory": true,
  "allow_backorder": false,
  "requires_shipping": true,
  "taxable": true,
  "attributes": [
    {
      "attribute_id": 1,
      "attribute_value_id": 2
    },
    {
      "attribute_id": 2,
      "attribute_value_id": 4
    }
  ]
}
```

**Fields:**
- `product_id` (required): ID của sản phẩm cha
- `sku` (required): Mã SKU (duy nhất)
- `name` (required): Tên biến thể
- `description` (optional): Mô tả chi tiết
- `price` (required): Giá bán
- `sale_price` (optional): Giá khuyến mãi
- `cost_price` (optional): Giá vốn
- `stock_quantity` (required): Số lượng tồn kho
- `min_stock_level` (optional): Mức tồn kho tối thiểu
- `max_stock_level` (optional): Mức tồn kho tối đa
- `weight` (optional): Cân nặng (kg)
- `dimensions` (optional): Kích thước
- `image_url` (optional): URL hình ảnh chính
- `images` (optional): Mảng URL hình ảnh bổ sung
- `status` (required): Trạng thái (active/inactive)
- `track_inventory` (required): Theo dõi tồn kho
- `allow_backorder` (required): Cho phép đặt hàng trước
- `requires_shipping` (required): Yêu cầu vận chuyển
- `taxable` (required): Có chịu thuế
- `attributes` (required): Mảng các thuộc tính

### Request Example

```bash
curl -X POST "http://localhost:3000/api/admin/product-variants" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "product_id": 1,
    "sku": "IP15PRO-512GB-WHITE",
    "name": "iPhone 15 Pro - 512GB - Trắng",
    "price": 39990000,
    "sale_price": 37990000,
    "stock_quantity": 20,
    "status": "active",
    "track_inventory": true,
    "allow_backorder": false,
    "attributes": [
      {
        "attribute_id": 1,
        "attribute_value_id": 2
      },
      {
        "attribute_id": 2,
        "attribute_value_id": 4
      }
    ]
  }'
```

### Response

**Success (201):**
```json
{
  "success": true,
  "message": "Tạo biến thể sản phẩm thành công",
  "data": {
    "id": 15,
    "product_id": 1,
    "sku": "IP15PRO-512GB-WHITE",
    "name": "iPhone 15 Pro - 512GB - Trắng",
    "price": 39990000,
    "sale_price": 37990000,
    "stock_quantity": 20,
    "status": "active",
    "track_inventory": true,
    "allow_backorder": false,
    "created_at": "2025-01-20T08:30:00.000Z",
    "updated_at": "2025-01-20T08:30:00.000Z"
  }
}
```

---

## 7. Update Product Variant (Cập nhật biến thể sản phẩm)

Cập nhật thông tin của một biến thể sản phẩm.

### Endpoint
```
PUT /api/admin/product-variants/:id
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của biến thể sản phẩm |

### Request Body
```json
{
  "name": "iPhone 15 Pro - 512GB - Trắng (Cập nhật)",
  "price": 40990000,
  "sale_price": 38990000,
  "stock_quantity": 25,
  "status": "active"
}
```

### Request Example

```bash
curl -X PUT "http://localhost:3000/api/admin/product-variants/15" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "iPhone 15 Pro - 512GB - Trắng (Cập nhật)",
    "price": 40990000,
    "sale_price": 38990000,
    "stock_quantity": 25,
    "status": "active"
  }'
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Cập nhật biến thể sản phẩm thành công",
  "data": {
    "id": 15,
    "product_id": 1,
    "sku": "IP15PRO-512GB-WHITE",
    "name": "iPhone 15 Pro - 512GB - Trắng (Cập nhật)",
    "price": 40990000,
    "sale_price": 38990000,
    "stock_quantity": 25,
    "status": "active",
    "updated_at": "2025-01-20T09:15:00.000Z"
  }
}
```

---

## 8. Restore Product Variant (Khôi phục biến thể sản phẩm)

Khôi phục một biến thể sản phẩm đã bị xóa.

### Endpoint
```
PUT /api/admin/product-variants/:id/restore
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của biến thể sản phẩm |

### Request Example

```bash
curl -X PUT "http://localhost:3000/api/admin/product-variants/15/restore" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Khôi phục biến thể sản phẩm thành công",
  "data": {
    "id": 15,
    "sku": "IP15PRO-512GB-WHITE",
    "name": "iPhone 15 Pro - 512GB - Trắng (Cập nhật)",
    "status": "active",
    "deleted_at": null,
    "updated_at": "2025-01-20T10:30:00.000Z"
  }
}
```

---

## 9. Delete Product Variant (Xóa biến thể sản phẩm)

Xóa mềm một biến thể sản phẩm.

### Endpoint
```
DELETE /api/admin/product-variants/:id
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của biến thể sản phẩm |

### Request Example

```bash
curl -X DELETE "http://localhost:3000/api/admin/product-variants/15" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Xóa biến thể sản phẩm thành công",
  "data": null
}
```

---

## 10. Update Stock (Cập nhật tồn kho)

Cập nhật số lượng tồn kho của một biến thể sản phẩm.

### Endpoint
```
PUT /api/admin/product-variants/:id/stock
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của biến thể sản phẩm |

### Request Body
```json
{
  "stock_quantity": 100,
  "min_stock_level": 10,
  "max_stock_level": 200,
  "reason": "Nhập hàng mới từ nhà cung cấp"
}
```

**Fields:**
- `stock_quantity` (required): Số lượng tồn kho mới
- `min_stock_level` (optional): Mức tồn kho tối thiểu
- `max_stock_level` (optional): Mức tồn kho tối đa
- `reason` (optional): Lý do cập nhật

### Request Example

```bash
curl -X PUT "http://localhost:3000/api/admin/product-variants/15/stock" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "stock_quantity": 100,
    "min_stock_level": 10,
    "max_stock_level": 200,
    "reason": "Nhập hàng mới từ nhà cung cấp"
  }'
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Cập nhật tồn kho thành công",
  "data": {
    "id": 15,
    "sku": "IP15PRO-512GB-WHITE",
    "stock_quantity": 100,
    "min_stock_level": 10,
    "max_stock_level": 200,
    "updated_at": "2025-01-20T11:00:00.000Z"
  }
}
```

---

## Product Variant Status

| Status | Description |
|--------|-------------|
| `active` | Đang hoạt động và có thể bán |
| `inactive` | Không hoạt động, không hiển thị |
| `out_of_stock` | Hết hàng |

---

## Use Cases

### Use Case 1: Tạo biến thể cho sản phẩm có nhiều thuộc tính

```bash
# 1. Tạo biến thể iPhone 15 Pro màu đen, 128GB
POST /api/admin/product-variants
{
  "product_id": 1,
  "sku": "IP15PRO-128GB-BLACK",
  "name": "iPhone 15 Pro - 128GB - Đen",
  "price": 29990000,
  "stock_quantity": 50,
  "attributes": [
    {
      "attribute_id": 1,  // Màu sắc
      "attribute_value_id": 1  // Đen
    },
    {
      "attribute_id": 2,  // Dung lượng
      "attribute_value_id": 3  // 128GB
    }
  ]
}

# 2. Tạo biến thể iPhone 15 Pro màu đen, 256GB
POST /api/admin/product-variants
{
  "product_id": 1,
  "sku": "IP15PRO-256GB-BLACK",
  "name": "iPhone 15 Pro - 256GB - Đen",
  "price": 33990000,
  "stock_quantity": 30,
  "attributes": [
    {
      "attribute_id": 1,
      "attribute_value_id": 1
    },
    {
      "attribute_id": 2,
      "attribute_value_id": 4  // 256GB
    }
  ]
}

# 3. Xem tất cả biến thể của sản phẩm
GET /api/admin/product-variants/product/1
```

### Use Case 2: Quản lý tồn kho

```bash
# 1. Kiểm tra tồn kho hiện tại
GET /api/admin/product-variants/1

# 2. Cập nhật tồn kho sau khi nhập hàng
PUT /api/admin/product-variants/1/stock
{
  "stock_quantity": 100,
  "reason": "Nhập hàng mới từ Apple"
}

# 3. Kiểm tra các biến thể sắp hết hàng
GET /api/admin/product-variants?status=out_of_stock
```

### Use Case 3: Tìm kiếm biến thể theo thuộc tính

```bash
# 1. Tìm iPhone 15 Pro màu đen, 128GB
POST /api/admin/product-variants/search
{
  "product_id": 1,
  "attributes": [
    {
      "attribute_id": 1,
      "attribute_value_id": 1
    },
    {
      "attribute_id": 2,
      "attribute_value_id": 3
    }
  ]
}

# 2. Tìm theo SKU
GET /api/admin/product-variants/sku/IP15PRO-128GB-BLACK
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
| 404 | Not Found - Product variant not found |
| 409 | Conflict - Duplicate SKU |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error |

---

**Xem thêm:**
- [Admin Product API](./product.md)
- [Admin Product Attribute API](./product-attribute.md)
- [Admin Product Attribute Value API](./product-attribute-value.md)