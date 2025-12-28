# Admin Product Categories API

API quản lý danh mục sản phẩm (product categories) trong hệ thống admin.

## Cấu trúc

- Base URL: `http://localhost:3000/api`
- Authentication: JWT Bearer Token (bắt buộc)
- Permission: `product-category:read`, `product-category:create`, `product-category:update`, `product-category:delete`
- Headers: `Content-Type: application/json`

---

## 1. Get Product Categories List (Lấy danh sách danh mục)

### Request

```bash
curl -X GET "http://localhost:3000/api/admin/product-categories?page=1&limit=20" \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

### Query Parameters

- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số lượng mỗi trang (mặc định: 20)
- `parent_id` (optional): Lọc theo danh mục cha
- `status` (optional): Lọc theo trạng thái
- `sortBy` (optional): Trường sắp xếp
- `sortOrder` (optional): Thứ tự (`ASC` hoặc `DESC`)

### Response

**Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Điện thoại",
      "slug": "dien-thoai",
      "description": "Các sản phẩm điện thoại di động",
      "parent_id": null,
      "image": "https://example.com/category-phone.jpg",
      "icon": "phone",
      "display_order": 1,
      "product_count": 150,
      "status": "active",
      "meta_title": "Điện thoại - Mua online giá tốt",
      "meta_description": "Mua điện thoại chính hãng",
      "created_at": "2025-01-11T05:00:00.000Z",
      "updated_at": "2025-01-11T05:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 50,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## 2. Get Category by ID (Lấy thông tin danh mục)

### Request

```bash
curl -X GET http://localhost:3000/api/admin/product-categories/1 \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Điện thoại",
    "slug": "dien-thoai",
    "description": "Các sản phẩm điện thoại di động chính hãng",
    "parent_id": null,
    "image": "https://example.com/category-phone.jpg",
    "banner": "https://example.com/banner-phone.jpg",
    "icon": "phone",
    "display_order": 1,
    "product_count": 150,
    "status": "active",
    "meta_title": "Điện thoại - Mua online giá tốt",
    "meta_description": "Mua điện thoại chính hãng, giá tốt nhất",
    "meta_keywords": "điện thoại, smartphone, di động",
    "children": [
      {
        "id": 2,
        "name": "iPhone",
        "slug": "iphone",
        "parent_id": 1,
        "product_count": 50
      }
    ],
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T05:00:00.000Z"
  },
  "message": "Thành công"
}
```

---

## 3. Create Category (Tạo danh mục)

### Request

```bash
curl -X POST http://localhost:3000/api/admin/product-categories \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop Gaming",
    "slug": "laptop-gaming",
    "description": "Laptop chơi game chuyên nghiệp",
    "parent_id": 4,
    "status": "active",
    "display_order": 1
  }'
```

### Request Body

```json
{
  "name": "Laptop Gaming",
  "slug": "laptop-gaming",
  "description": "Laptop chơi game chuyên nghiệp",
  "parent_id": 4,
  "image": "https://example.com/laptop-gaming.jpg",
  "banner": "https://example.com/banner-gaming.jpg",
  "icon": "laptop",
  "display_order": 1,
  "status": "active",
  "meta_title": "Laptop Gaming - Hiệu năng cao",
  "meta_description": "Laptop gaming chính hãng",
  "meta_keywords": "laptop, gaming, game"
}
```

**Fields:**
- `name` (required): Tên danh mục
- `slug` (optional): URL slug (tự động tạo nếu không có)
- `description` (optional): Mô tả danh mục
- `parent_id` (optional): ID danh mục cha
- `image` (optional): URL hình ảnh
- `banner` (optional): URL banner
- `icon` (optional): Icon name
- `display_order` (optional): Thứ tự hiển thị
- `status` (optional): Trạng thái (mặc định: "active")
- `meta_title` (optional): SEO title
- `meta_description` (optional): SEO description
- `meta_keywords` (optional): SEO keywords

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 51,
    "name": "Laptop Gaming",
    "slug": "laptop-gaming",
    "parent_id": 4,
    "status": "active",
    "created_at": "2025-01-11T06:00:00.000Z",
    "updated_at": "2025-01-11T06:00:00.000Z"
  },
  "message": "Tạo danh mục thành công"
}
```

---

## 4. Update Category (Cập nhật danh mục)

### Request

```bash
curl -X PUT http://localhost:3000/api/admin/product-categories/1 \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tên danh mục đã cập nhật",
    "status": "active"
  }'
```

### Request Body

Tất cả fields đều optional.

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Tên danh mục đã cập nhật",
    "slug": "dien-thoai",
    "status": "active",
    "updated_at": "2025-01-11T06:05:00.000Z"
  },
  "message": "Cập nhật danh mục thành công"
}
```

---

## 5. Delete Category (Xóa danh mục)

### Request

```bash
curl -X DELETE http://localhost:3000/api/admin/product-categories/1 \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Xóa danh mục thành công"
}
```

**Note:** Không thể xóa danh mục đang có sản phẩm hoặc có danh mục con.

---

## 6. Get Category Tree (Lấy cây danh mục)

### Request

```bash
curl -X GET http://localhost:3000/api/admin/product-categories/tree \
  -H "Authorization: Bearer {{auth_token}}" \
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
      "name": "Điện thoại",
      "slug": "dien-thoai",
      "parent_id": null,
      "product_count": 150,
      "children": [
        {
          "id": 2,
          "name": "iPhone",
          "slug": "iphone",
          "parent_id": 1,
          "product_count": 50,
          "children": []
        }
      ]
    }
  ]
}
```

---

## 7. Reorder Categories (Sắp xếp lại danh mục)

### Request

```bash
curl -X POST http://localhost:3000/api/admin/product-categories/reorder \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "orders": [
      {"id": 1, "display_order": 1},
      {"id": 2, "display_order": 2},
      {"id": 3, "display_order": 3}
    ]
  }'
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Sắp xếp danh mục thành công"
}
```

---

## Category Status

- `active`: Đang hoạt động
- `inactive`: Không hoạt động

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Validation failed |
| 401 | Unauthorized |
| 403 | Forbidden - Permission denied |
| 404 | Not Found - Category not found |
| 409 | Conflict - Slug already exists or has children/products |
| 500 | Internal Server Error |

---

**Xem thêm:**
- [Admin Products API](./product.md)
- [Public Product Categories API](../public/product-category.md)