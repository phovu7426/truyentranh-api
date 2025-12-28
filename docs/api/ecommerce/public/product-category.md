# Public Product Categories API

API công khai cho danh mục sản phẩm (product categories) - không yêu cầu authentication.

## Cấu trúc

- Base URL: `http://localhost:3000/api/public/product-categories`
- Authentication: Không yêu cầu
- Headers: `Content-Type: application/json`

---

## 1. Get Product Categories List (Lấy danh sách danh mục)

### Request

```bash
curl -X GET "http://localhost:3000/api/public/product-categories?page=1&limit=20" \
  -H "Content-Type: application/json"
```

### Query Parameters

- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số lượng mỗi trang (mặc định: 20)
- `parent_id` (optional): Lọc theo danh mục cha (null để lấy danh mục gốc)
- `status` (optional): Lọc theo trạng thái (mặc định: active)

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
      "children": [
        {
          "id": 2,
          "name": "iPhone",
          "slug": "iphone",
          "parent_id": 1,
          "product_count": 50
        },
        {
          "id": 3,
          "name": "Samsung",
          "slug": "samsung",
          "parent_id": 1,
          "product_count": 60
        }
      ],
      "created_at": "2025-01-11T05:00:00.000Z"
    },
    {
      "id": 4,
      "name": "Laptop",
      "slug": "laptop",
      "description": "Các sản phẩm máy tính xách tay",
      "parent_id": null,
      "image": "https://example.com/category-laptop.jpg",
      "icon": "laptop",
      "display_order": 2,
      "product_count": 200,
      "status": "active",
      "created_at": "2025-01-11T05:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 15,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

---

## 2. Get Category by ID or Slug (Lấy thông tin danh mục)

### Request

```bash
# By Slug
curl -X GET http://localhost:3000/api/public/product-categories/dien-thoai \
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
    "description": "Các sản phẩm điện thoại di động chính hãng, đa dạng mẫu mã và thương hiệu",
    "parent_id": null,
    "image": "https://example.com/category-phone.jpg",
    "banner": "https://example.com/banner-phone.jpg",
    "icon": "phone",
    "display_order": 1,
    "product_count": 150,
    "status": "active",
    "meta_title": "Điện thoại - Mua online giá tốt",
    "meta_description": "Mua điện thoại chính hãng, giá tốt nhất thị trường",
    "meta_keywords": "điện thoại, smartphone, di động",
    "parent": null,
    "children": [
      {
        "id": 2,
        "name": "iPhone",
        "slug": "iphone",
        "parent_id": 1,
        "image": "https://example.com/iphone.jpg",
        "product_count": 50
      },
      {
        "id": 3,
        "name": "Samsung",
        "slug": "samsung",
        "parent_id": 1,
        "image": "https://example.com/samsung.jpg",
        "product_count": 60
      },
      {
        "id": 4,
        "name": "Xiaomi",
        "slug": "xiaomi",
        "parent_id": 1,
        "image": "https://example.com/xiaomi.jpg",
        "product_count": 40
      }
    ],
    "breadcrumbs": [
      {
        "id": 1,
        "name": "Điện thoại",
        "slug": "dien-thoai"
      }
    ],
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T05:00:00.000Z"
  },
  "message": "Thành công"
}
```

---

## 3. Get Category Tree (Lấy cây danh mục)

Lấy toàn bộ cấu trúc cây danh mục (hierarchical).

### Request

```bash
curl -X GET http://localhost:3000/api/public/product-categories/tree \
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
      "icon": "phone",
      "product_count": 150,
      "children": [
        {
          "id": 2,
          "name": "iPhone",
          "slug": "iphone",
          "parent_id": 1,
          "product_count": 50,
          "children": []
        },
        {
          "id": 3,
          "name": "Samsung",
          "slug": "samsung",
          "parent_id": 1,
          "product_count": 60,
          "children": [
            {
              "id": 5,
              "name": "Galaxy S Series",
              "slug": "galaxy-s-series",
              "parent_id": 3,
              "product_count": 25,
              "children": []
            }
          ]
        }
      ]
    },
    {
      "id": 4,
      "name": "Laptop",
      "slug": "laptop",
      "parent_id": null,
      "icon": "laptop",
      "product_count": 200,
      "children": [
        {
          "id": 6,
          "name": "MacBook",
          "slug": "macbook",
          "parent_id": 4,
          "product_count": 30,
          "children": []
        }
      ]
    }
  ]
}
```

---

## 4. Get Root Categories (Lấy danh mục gốc)

Lấy chỉ các danh mục cấp cao nhất (không có parent).

### Request

```bash
curl -X GET http://localhost:3000/api/public/product-categories/root \
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
      "description": "Các sản phẩm điện thoại di động",
      "image": "https://example.com/category-phone.jpg",
      "icon": "phone",
      "display_order": 1,
      "product_count": 150
    },
    {
      "id": 4,
      "name": "Laptop",
      "slug": "laptop",
      "description": "Các sản phẩm máy tính xách tay",
      "image": "https://example.com/category-laptop.jpg",
      "icon": "laptop",
      "display_order": 2,
      "product_count": 200
    }
  ]
}
```

---

## 5. Get Category Products (Lấy sản phẩm trong danh mục)

### Request

```bash
curl -X GET "http://localhost:3000/api/public/product-categories/1/products?page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Query Parameters

- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số lượng mỗi trang (mặc định: 10)
- `sortBy` (optional): Trường sắp xếp
- `sortOrder` (optional): Thứ tự
- `min_price` (optional): Giá tối thiểu
- `max_price` (optional): Giá tối đa
- `include_children` (optional): Bao gồm sản phẩm từ danh mục con (true/false)

### Response

Same as Products API response

---

## 6. Get Popular Categories (Lấy danh mục phổ biến)

Lấy danh mục có nhiều sản phẩm hoặc nhiều lượt xem nhất.

### Request

```bash
curl -X GET "http://localhost:3000/api/public/product-categories/popular?limit=8" \
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
      "image": "https://example.com/category-phone.jpg",
      "product_count": 150,
      "view_count": 5000
    },
    {
      "id": 4,
      "name": "Laptop",
      "slug": "laptop",
      "image": "https://example.com/category-laptop.jpg",
      "product_count": 200,
      "view_count": 4500
    }
  ]
}
```

---

## 7. Search Categories (Tìm kiếm danh mục)

### Request

```bash
curl -X GET "http://localhost:3000/api/public/product-categories/search?q=điện+thoại" \
  -H "Content-Type: application/json"
```

### Query Parameters

- `q` (required): Từ khóa tìm kiếm
- `limit` (optional): Số lượng kết quả (mặc định: 10)

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
      "image": "https://example.com/category-phone.jpg",
      "product_count": 150,
      "breadcrumbs": [
        {
          "name": "Điện thoại",
          "slug": "dien-thoai"
        }
      ]
    },
    {
      "id": 2,
      "name": "iPhone",
      "slug": "iphone",
      "image": "https://example.com/iphone.jpg",
      "product_count": 50,
      "breadcrumbs": [
        {
          "name": "Điện thoại",
          "slug": "dien-thoai"
        },
        {
          "name": "iPhone",
          "slug": "iphone"
        }
      ]
    }
  ]
}
```

---

## Breadcrumbs

API tự động tạo breadcrumbs cho danh mục hierarchical:

```json
{
  "breadcrumbs": [
    {
      "id": 1,
      "name": "Điện thoại",
      "slug": "dien-thoai"
    },
    {
      "id": 2,
      "name": "iPhone",
      "slug": "iphone"
    },
    {
      "id": 5,
      "name": "iPhone 15 Series",
      "slug": "iphone-15-series"
    }
  ]
}
```

---

## Category Display Order

Danh mục được sắp xếp theo `display_order` (ASC) và sau đó theo `name` (ASC).

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 404 | Not Found - Category not found |
| 500 | Internal Server Error |

---

**Xem thêm:**
- [Public Products API](./product.md)
- [Admin Product Categories API](./../admin/product-category.md)