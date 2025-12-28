# Hướng Dẫn Tích Hợp Quản Lý Sản Phẩm Admin

## Tổng Quan

Tài liệu này cung cấp hướng dẫn chi tiết về cách tích hợp với API quản lý sản phẩm, danh mục sản phẩm, biến thể và thuộc tính sản phẩm cho trang admin.

## Base URL

```
http://localhost:8000/api
```

## Authentication

Tất cả các API endpoint đều yêu cầu authentication với JWT token và các quyền phù hợp.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## 1. Quản Lý Danh Mục Sản Phẩm (Product Categories)

### 1.1. Lấy Danh Sách Danh Mục

**Endpoint:** `GET /admin/product-categories`

**Query Parameters:**
- `page`: Số trang (mặc định: 1)
- `limit`: Số lượng item mỗi trang (mặc định: 20)
- `search`: Từ khóa tìm kiếm (tìm theo tên, slug, mô tả)
- `status`: Trạng thái (`active`, `inactive`)
- `parent_id`: ID danh mục cha
- `sort`: Sắp xếp (ví dụ: `name:asc`, `created_at:desc`)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Điện thoại",
        "slug": "dien-thoai",
        "description": "Các loại điện thoại thông minh",
        "parent_id": null,
        "image": "https://example.com/image.jpg",
        "icon": "phone",
        "status": "active",
        "sort_order": 1,
        "meta_title": "Điện thoại thông minh",
        "meta_description": "Mua điện thoại giá tốt",
        "canonical_url": "https://example.com/dien-thoai",
        "og_image": "https://example.com/og-image.jpg",
        "created_at": "2023-01-01T00:00:00.000Z",
        "updated_at": "2023-01-01T00:00:00.000Z",
        "deleted_at": null
      }
    ],
    "meta": {
      "totalItems": 1,
      "itemCount": 1,
      "itemsPerPage": 20,
      "totalPages": 1,
      "currentPage": 1
    }
  }
}
```

### 1.2. Lấy Cây Danh Mục

**Endpoint:** `GET /admin/product-categories/tree`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Điện tử",
      "slug": "dien-tu",
      "children": [
        {
          "id": 2,
          "name": "Điện thoại",
          "slug": "dien-thoai",
          "children": []
        }
      ]
    }
  ]
}
```

### 1.3. Lấy Danh Mục Gốc

**Endpoint:** `GET /admin/product-categories/root`

### 1.4. Lấy Danh Mục Con

**Endpoint:** `GET /admin/product-categories/{id}/children`

### 1.5. Lấy Chi Tiết Danh Mục

**Endpoint:** `GET /admin/product-categories/{id}`

### 1.6. Tạo Danh Mục Mới

**Endpoint:** `POST /admin/product-categories`

**Request Body:**
```json
{
  "name": "Laptop",
  "slug": "laptop",
  "description": "Các loại laptop gaming và văn phòng",
  "image": "https://example.com/laptop.jpg",
  "parent_id": 1,
  "sort_order": 2,
  "meta_title": "Laptop giá tốt",
  "meta_description": "Mua laptop chính hãng",
  "created_user_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "Laptop",
    "slug": "laptop",
    "description": "Các loại laptop gaming và văn phòng",
    "parent_id": 1,
    "image": "https://example.com/laptop.jpg",
    "status": "active",
    "sort_order": 2,
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  }
}
```

### 1.7. Cập Nhật Danh Mục

**Endpoint:** `PUT /admin/product-categories/{id}`

**Request Body:**
```json
{
  "name": "Laptop Gaming",
  "slug": "laptop-gaming",
  "description": "Các loại laptop chuyên gaming",
  "sort_order": 1,
  "updated_user_id": 1
}
```

### 1.8. Khôi Phục Danh Mục Đã Xóa

**Endpoint:** `PUT /admin/product-categories/{id}/restore`

### 1.9. Xóa Danh Mục

**Endpoint:** `DELETE /admin/product-categories/{id}`

## 2. Quản Lý Thuộc Tính Sản Phẩm (Product Attributes)

### 2.1. Lấy Danh Sách Thuộc Tính

**Endpoint:** `GET /admin/product-attributes`

**Query Parameters:**
- `page`: Số trang
- `limit`: Số lượng item mỗi trang
- `search`: Từ khóa tìm kiếm
- `type`: Loại thuộc tính (`text`, `select`, `multiselect`, `color`, `image`)
- `sort`: Sắp xếp

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Màu sắc",
        "code": "color",
        "description": "Màu sắc của sản phẩm",
        "type": "color",
        "default_value": null,
        "is_required": true,
        "is_filterable": true,
        "is_visible_on_frontend": true,
        "sort_order": 1,
        "validation_rules": null,
        "created_at": "2023-01-01T00:00:00.000Z",
        "updated_at": "2023-01-01T00:00:00.000Z"
      }
    ],
    "meta": {
      "totalItems": 1,
      "itemCount": 1,
      "itemsPerPage": 20,
      "totalPages": 1,
      "currentPage": 1
    }
  }
}
```

### 2.2. Lấy Thuộc Tính Kèm Giá Trị

**Endpoint:** `GET /admin/product-attributes/with-values`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Màu sắc",
      "code": "color",
      "type": "color",
      "values": [
        {
          "id": 1,
          "attribute_id": 1,
          "value": "Đen",
          "sort_order": 1
        },
        {
          "id": 2,
          "attribute_id": 1,
          "value": "Trắng",
          "sort_order": 2
        }
      ]
    }
  ]
}
```

### 2.3. Lấy Thuộc Tính Theo Code

**Endpoint:** `GET /admin/product-attributes/code/{code}`

### 2.4. Lấy Chi Tiết Thuộc Tính

**Endpoint:** `GET /admin/product-attributes/{id}`

### 2.5. Tạo Thuộc Tính Mới

**Endpoint:** `POST /admin/product-attributes`

**Request Body:**
```json
{
  "name": "Kích thước",
  "code": "size",
  "description": "Kích thước của sản phẩm",
  "type": "select",
  "is_required": true,
  "is_filterable": true,
  "is_visible_on_frontend": true,
  "sort_order": 2,
  "created_user_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Kích thước",
    "code": "size",
    "description": "Kích thước của sản phẩm",
    "type": "select",
    "is_required": true,
    "is_filterable": true,
    "is_visible_on_frontend": true,
    "sort_order": 2,
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  }
}
```

### 2.6. Cập Nhật Thuộc Tính

**Endpoint:** `PUT /admin/product-attributes/{id}`

### 2.7. Khôi Phục Thuộc Tính Đã Xóa

**Endpoint:** `PUT /admin/product-attributes/{id}/restore`

### 2.8. Xóa Thuộc Tính

**Endpoint:** `DELETE /admin/product-attributes/{id}`

## 3. Quản Lý Giá Trị Thuộc Tính (Product Attribute Values)

### 3.1. Lấy Danh Sách Giá Trị Thuộc Tính

**Endpoint:** `GET /admin/product-attribute-values`

**Query Parameters:**
- `page`: Số trang
- `limit`: Số lượng item mỗi trang
- `search`: Từ khóa tìm kiếm
- `attribute_id`: ID thuộc tính
- `sort`: Sắp xếp

### 3.2. Lấy Giá Trị Theo Thuộc Tính

**Endpoint:** `GET /admin/product-attribute-values/attribute/{attributeId}`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "attribute_id": 1,
      "value": "Đen",
      "sort_order": 1,
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "attribute_id": 1,
      "value": "Trắng",
      "sort_order": 2,
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### 3.3. Lấy Chi Tiết Giá Trị Thuộc Tính

**Endpoint:** `GET /admin/product-attribute-values/{id}`

### 3.4. Tạo Giá Trị Thuộc Tính Mới

**Endpoint:** `POST /admin/product-attribute-values`

**Request Body:**
```json
{
  "attribute_id": 1,
  "value": "Xanh",
  "sort_order": 3,
  "created_user_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "attribute_id": 1,
    "value": "Xanh",
    "sort_order": 3,
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  }
}
```

### 3.5. Cập Nhật Giá Trị Thuộc Tính

**Endpoint:** `PUT /admin/product-attribute-values/{id}`

### 3.6. Khôi Phục Giá Trị Thuộc Tính Đã Xóa

**Endpoint:** `PUT /admin/product-attribute-values/{id}/restore`

### 3.7. Xóa Giá Trị Thuộc Tính

**Endpoint:** `DELETE /admin/product-attribute-values/{id}`

## 4. Quản Lý Sản Phẩm (Products)

### 4.1. Lấy Danh Sách Sản Phẩm

**Endpoint:** `GET /admin/products`

**Query Parameters:**
- `page`: Số trang
- `limit`: Số lượng item mỗi trang
- `search`: Từ khóa tìm kiếm (tên, SKU, mô tả)
- `status`: Trạng thái (`active`, `inactive`, `draft`)
- `is_featured`: Sản phẩm nổi bật (true/false)
- `is_variable`: Sản phẩm có biến thể (true/false)
- `is_digital`: Sản phẩm số (true/false)
- `category_id`: ID danh mục sản phẩm
- `sort`: Sắp xếp (ví dụ: `name:asc`, `created_at:desc`, `price:asc`)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "iPhone 15 Pro",
        "slug": "iphone-15-pro",
        "sku": "IP15PRO001",
        "description": "iPhone 15 Pro với chip A17 Pro",
        "short_description": "iPhone 15 Pro 128GB",
        "min_stock_level": 10,
        "image": "https://example.com/iphone-15-pro.jpg",
        "gallery": [
          "https://example.com/iphone-15-pro-1.jpg",
          "https://example.com/iphone-15-pro-2.jpg"
        ],
        "status": "active",
        "is_featured": true,
        "is_variable": true,
        "is_digital": false,
        "download_limit": null,
        "meta_title": "iPhone 15 Pro - Chính hãng",
        "meta_description": "Mua iPhone 15 Pro giá tốt nhất",
        "canonical_url": "https://example.com/iphone-15-pro",
        "og_title": "iPhone 15 Pro",
        "og_description": "iPhone 15 Pro với chip A17 Pro",
        "og_image": "https://example.com/iphone-15-pro-og.jpg",
        "created_at": "2023-01-01T00:00:00.000Z",
        "updated_at": "2023-01-01T00:00:00.000Z",
        "deleted_at": null,
        "variants": [
          {
            "id": 1,
            "product_id": 1,
            "sku": "IP15PRO128BK",
            "name": "iPhone 15 Pro 128GB Đen",
            "price": "28990000.00",
            "sale_price": "26990000.00",
            "cost_price": "22000000.00",
            "stock_quantity": 50,
            "weight": "187.00",
            "image": "https://example.com/iphone-15-pro-black.jpg",
            "status": "active"
          }
        ],
        "categories": [
          {
            "id": 1,
            "product_id": 1,
            "category_id": 2
          }
        ]
      }
    ],
    "meta": {
      "totalItems": 1,
      "itemCount": 1,
      "itemsPerPage": 20,
      "totalPages": 1,
      "currentPage": 1
    }
  }
}
```

### 4.2. Lấy Chi Tiết Sản Phẩm

**Endpoint:** `GET /admin/products/{id}`

### 4.3. Tạo Sản Phẩm Mới

**Endpoint:** `POST /admin/products`

**Request Body:**
```json
{
  "name": "Samsung Galaxy S24 Ultra",
  "slug": "samsung-galaxy-s24-ultra",
  "sku": "SGS24U001",
  "description": "Samsung Galaxy S24 Ultra với camera 200MP",
  "short_description": "Samsung Galaxy S24 Ultra 256GB",
  "min_stock_level": 5,
  "image": "https://example.com/galaxy-s24-ultra.jpg",
  "gallery": [
    "https://example.com/galaxy-s24-ultra-1.jpg",
    "https://example.com/galaxy-s24-ultra-2.jpg"
  ],
  "is_featured": true,
  "is_variable": true,
  "is_digital": false,
  "meta_title": "Samsung Galaxy S24 Ultra - Chính hãng",
  "meta_description": "Mua Samsung Galaxy S24 Ultra giá tốt nhất",
  "canonical_url": "https://example.com/samsung-galaxy-s24-ultra",
  "og_title": "Samsung Galaxy S24 Ultra",
  "og_description": "Samsung Galaxy S24 Ultra với camera 200MP",
  "og_image": "https://example.com/galaxy-s24-ultra-og.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Samsung Galaxy S24 Ultra",
    "slug": "samsung-galaxy-s24-ultra",
    "sku": "SGS24U001",
    "description": "Samsung Galaxy S24 Ultra với camera 200MP",
    "short_description": "Samsung Galaxy S24 Ultra 256GB",
    "min_stock_level": 5,
    "image": "https://example.com/galaxy-s24-ultra.jpg",
    "gallery": [
      "https://example.com/galaxy-s24-ultra-1.jpg",
      "https://example.com/galaxy-s24-ultra-2.jpg"
    ],
    "status": "active",
    "is_featured": true,
    "is_variable": true,
    "is_digital": false,
    "download_limit": null,
    "meta_title": "Samsung Galaxy S24 Ultra - Chính hãng",
    "meta_description": "Mua Samsung Galaxy S24 Ultra giá tốt nhất",
    "canonical_url": "https://example.com/samsung-galaxy-s24-ultra",
    "og_title": "Samsung Galaxy S24 Ultra",
    "og_description": "Samsung Galaxy S24 Ultra với camera 200MP",
    "og_image": "https://example.com/galaxy-s24-ultra-og.jpg",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z",
    "deleted_at": null
  }
}
```

### 4.4. Cập Nhật Sản Phẩm

**Endpoint:** `PUT /admin/products/{id}`

### 4.5. Xóa Sản Phẩm

**Endpoint:** `DELETE /admin/products/{id}`

## 5. Quản Lý Biến Thể Sản Phẩm (Product Variants)

### 5.1. Lấy Danh Sách Biến Thể

**Endpoint:** `GET /admin/product-variants`

**Query Parameters:**
- `page`: Số trang
- `limit`: Số lượng item mỗi trang
- `search`: Từ khóa tìm kiếm
- `product_id`: ID sản phẩm
- `status`: Trạng thái (`active`, `inactive`)
- `sort`: Sắp xếp

### 5.2. Lấy Biến Thể Theo Sản Phẩm

**Endpoint:** `GET /admin/product-variants/product/{productId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "sku": "IP15PRO128BK",
        "name": "iPhone 15 Pro 128GB Đen",
        "price": "28990000.00",
        "sale_price": "26990000.00",
        "cost_price": "22000000.00",
        "stock_quantity": 50,
        "weight": "187.00",
        "image": "https://example.com/iphone-15-pro-black.jpg",
        "status": "active",
        "created_at": "2023-01-01T00:00:00.000Z",
        "updated_at": "2023-01-01T00:00:00.000Z",
        "deleted_at": null,
        "product": {
          "id": 1,
          "name": "iPhone 15 Pro",
          "sku": "IP15PRO001"
        }
      }
    ]
  }
}
```

### 5.3. Tìm Kiếm Biến Thể

**Endpoint:** `POST /admin/product-variants/search`

**Request Body:**
```json
{
  "product_id": 1,
  "attributes": [
    {
      "attribute_id": 1,
      "value_id": 1
    },
    {
      "attribute_id": 2,
      "value_id": 3
    }
  ]
}
```

### 5.4. Lấy Biến Thể Theo SKU

**Endpoint:** `GET /admin/product-variants/sku/{sku}`

### 5.5. Lấy Chi Tiết Biến Thể

**Endpoint:** `GET /admin/product-variants/{id}`

### 5.6. Tạo Biến Thể Mới

**Endpoint:** `POST /admin/product-variants`

**Request Body:**
```json
{
  "product_id": 1,
  "name": "iPhone 15 Pro 256GB Trắng",
  "sku": "IP15PRO256WT",
  "price": "32990000.00",
  "sale_price": "30990000.00",
  "cost_price": "25000000.00",
  "stock_quantity": 30,
  "weight": "187.00",
  "image": "https://example.com/iphone-15-pro-white.jpg",
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "product_id": 1,
    "name": "iPhone 15 Pro 256GB Trắng",
    "sku": "IP15PRO256WT",
    "price": "32990000.00",
    "sale_price": "30990000.00",
    "cost_price": "25000000.00",
    "stock_quantity": 30,
    "weight": "187.00",
    "image": "https://example.com/iphone-15-pro-white.jpg",
    "status": "active",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z",
    "deleted_at": null
  }
}
```

### 5.7. Cập Nhật Biến Thể

**Endpoint:** `PUT /admin/product-variants/{id}`

### 5.8. Khôi Phục Biến Thể Đã Xóa

**Endpoint:** `PUT /admin/product-variants/{id}/restore`

### 5.9. Xóa Biến Thể

**Endpoint:** `DELETE /admin/product-variants/{id}`

## 6. Quản Lý Thuộc Tính Biến Thể Sản Phẩm (Product Variant Attributes)

### 6.1. Lấy Danh Sách Thuộc Tính Biến Thể

**Endpoint:** `GET /admin/product-variant-attributes`

**Query Parameters:**
- `page`: Số trang
- `limit`: Số lượng item mỗi trang
- `product_variant_id`: ID biến thể sản phẩm
- `product_attribute_id`: ID thuộc tính sản phẩm
- `product_attribute_value_id`: ID giá trị thuộc tính
- `sort`: Sắp xếp

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "product_variant_id": 1,
        "product_attribute_id": 1,
        "product_attribute_value_id": 1,
        "created_at": "2023-01-01T00:00:00.000Z",
        "updated_at": "2023-01-01T00:00:00.000Z",
        "variant": {
          "id": 1,
          "name": "iPhone 15 Pro 128GB Đen",
          "sku": "IP15PRO128BK"
        },
        "attribute": {
          "id": 1,
          "name": "Màu sắc",
          "code": "color"
        },
        "value": {
          "id": 1,
          "value": "Đen"
        }
      }
    ],
    "meta": {
      "totalItems": 1,
      "itemCount": 1,
      "itemsPerPage": 20,
      "totalPages": 1,
      "currentPage": 1
    }
  }
}
```

### 6.2. Lấy Thuộc Tính Biến Thể Theo Biến Thể

**Endpoint:** `GET /admin/product-variant-attributes/variant/{variantId}`

### 6.3. Lấy Chi Tiết Thuộc Tính Biến Thể

**Endpoint:** `GET /admin/product-variant-attributes/{id}`

### 6.4. Tạo Thuộc Tính Biến Thể Mới

**Endpoint:** `POST /admin/product-variant-attributes`

**Request Body:**
```json
{
  "product_variant_id": 1,
  "product_attribute_id": 1,
  "product_attribute_value_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "product_variant_id": 1,
    "product_attribute_id": 1,
    "product_attribute_value_id": 1,
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  }
}
```

### 6.5. Cập Nhật Thuộc Tính Biến Thể

**Endpoint:** `PUT /admin/product-variant-attributes/{id}`

**Request Body:**
```json
{
  "product_attribute_value_id": 2
}
```

### 6.6. Xóa Thuộc Tính Biến Thể

**Endpoint:** `DELETE /admin/product-variant-attributes/{id}`

## 7. Quy Trình Tích Hợp Gợi Ý

### 7.1. Quy Trình Tạo Sản Phẩm Mới

1. **Tạo thuộc tính sản phẩm (nếu cần):**
   - Gọi API `POST /admin/product-attributes` để tạo các thuộc tính như màu sắc, kích thước, etc.
   - Gọi API `POST /admin/product-attribute-values` để tạo các giá trị cho từng thuộc tính

2. **Tạo danh mục sản phẩm (nếu cần):**
   - Gọi API `POST /admin/product-categories` để tạo danh mục sản phẩm

3. **Tạo sản phẩm:**
   - Gọi API `POST /admin/products` để tạo sản phẩm mới
   - Lưu ý đặt `is_variable: true` nếu sản phẩm có biến thể

4. **Tạo biến thể sản phẩm (nếu là sản phẩm có biến thể):**
   - Gọi API `POST /admin/product-variants` để tạo các biến thể
   - Liên kết thuộc tính với biến thể thông qua API `POST /admin/product-variant-attributes`

### 7.2. Quy Trình Cập Nhật Sản Phẩm

1. **Cập nhật thông tin sản phẩm:**
   - Gọi API `PUT /admin/products/{id}` để cập nhật thông tin cơ bản

2. **Cập nhật biến thể:**
   - Gọi API `PUT /admin/product-variants/{id}` để cập nhật thông tin biến thể
   - Gọi API `GET /admin/product-variant-attributes/variant/{variantId}` để lấy thuộc tính biến thể
   - Gọi API `PUT /admin/product-variant-attributes/{id}` để cập nhật thuộc tính biến thể

### 7.3. Quy Trình Xóa Sản Phẩm

1. **Kiểm tra biến thể:**
   - Gọi API `GET /admin/product-variants/product/{productId}` để lấy danh sách biến thể

2. **Xóa thuộc tính biến thể:**
   - Gọi API `GET /admin/product-variant-attributes/variant/{variantId}` để lấy danh sách thuộc tính biến thể
   - Gọi API `DELETE /admin/product-variant-attributes/{id}` để xóa từng thuộc tính biến thể

3. **Xóa biến thể:**
   - Gọi API `DELETE /admin/product-variants/{id}` để xóa từng biến thể

4. **Xóa sản phẩm:**
   - Gọi API `DELETE /admin/products/{id}` để xóa sản phẩm

## 8. Xử Lý Lỗi

### 8.1. Mã Lỗi Phổ Biến

- `400 Bad Request`: Dữ liệu không hợp lệ
- `401 Unauthorized`: Chưa xác thực hoặc token hết hạn
- `403 Forbidden`: Không có quyền truy cập
- `404 Not Found`: Không tìm thấy tài nguyên
- `409 Conflict`: Dữ liệu trùng lặp (ví dụ: SKU, slug đã tồn tại)

### 8.2. Định Dạng Lỗi

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "ERROR",
  "data": {
    "name": "Name is required",
    "sku": "SKU must be unique"
  },
  "httpStatus": 400,
  "meta": "Bad Request",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

## 9. Lưu Ý Quan Trọng

1. **Slug và SKU phải là duy nhất** trong toàn bộ hệ thống
2. **Sử dụng soft delete** cho hầu hết các entity, có thể khôi phục bằng API `restore`
3. **Giá trị thuộc tính** cần được tạo trước khi liên kết với biến thể
4. **Sản phẩm có biến thể** cần có ít nhất một biến thể để hiển thị
5. **Hình ảnh** nên là URL hợp lệ, hệ thống không xử lý upload file
6. **Giá trị số** (price, sale_price, cost_price, weight) được truyền dưới dạng chuỗi để đảm bảo độ chính xác
7. **Phân trang** sử dụng các tham số `page` và `limit`, thông tin phân trang trả về trong `meta`
8. **Sắp xếp** sử dụng định dạng `field:direction` (ví dụ: `name:asc`, `created_at:desc`)
9. **Thuộc tính biến thể** là liên kết giữa biến thể và giá trị thuộc tính, mỗi biến thể có thể có nhiều thuộc tính

## 10. Ví Dụ Code

### 10.1. JavaScript/TypeScript Example

```typescript
// Tạo sản phẩm mới với biến thể
async function createProductWithVariants() {
  try {
    // 1. Tạo sản phẩm
    const productResponse = await fetch('/api/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        sku: 'IP15PRO001',
        description: 'iPhone 15 Pro với chip A17 Pro',
        is_variable: true,
        is_featured: true
      })
    });
    
    const product = await productResponse.json();
    
    // 2. Tạo biến thể
    const variantResponse = await fetch('/api/admin/product-variants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        product_id: product.data.id,
        name: 'iPhone 15 Pro 128GB Đen',
        sku: 'IP15PRO128BK',
        price: '28990000.00',
        sale_price: '26990000.00',
        stock_quantity: 50
      })
    });
    
    const variant = await variantResponse.json();
    
    console.log('Product created:', product.data);
    console.log('Variant created:', variant.data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### 10.2. React Example

```jsx
import React, { useState, useEffect } from 'react';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  
  useEffect(() => {
    fetchProducts();
  }, []);
  
  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/products?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data.items);
        setPagination(data.data.meta);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const deleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/admin/products/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          fetchProducts();
        }
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };
  
  return (
    <div>
      <h1>Products</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.sku}</td>
                <td>
                  {product.variants && product.variants.length > 0
                    ? product.variants[0].price
                    : 'N/A'}
                </td>
                <td>{product.status}</td>
                <td>
                  <button onClick={() => deleteProduct(product.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      <div>
        {pagination.currentPage > 1 && (
          <button onClick={() => fetchProducts(pagination.currentPage - 1)}>
            Previous
          </button>
        )}
        <span>
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        {pagination.currentPage < pagination.totalPages && (
          <button onClick={() => fetchProducts(pagination.currentPage + 1)}>
            Next
          </button>
        )}
      </div>
    </div>
  );
}

export default ProductList;
```

## 10. Tài Liệu Tham Khảo

- [API Documentation](../README.md)
- [Authentication Guide](../../auth/auth.md)
- [Database Schema](../../../database_schema/README.md)