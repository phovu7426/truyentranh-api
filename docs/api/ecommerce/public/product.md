# Public Products API

API công khai cho sản phẩm (products) - không yêu cầu authentication.

## Cấu trúc

- Base URL: `http://localhost:3000/api/public/products`
- Authentication: Không yêu cầu
- Headers: `Content-Type: application/json`

---

## 1. Get Products List (Lấy danh sách sản phẩm)

### Request

```bash
curl -X GET "http://localhost:3000/api/public/products?page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Query Parameters

- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số lượng mỗi trang (mặc định: 10)
- `sortBy` (optional): Trường sắp xếp (name, price, created_at, view_count)
- `sortOrder` (optional): Thứ tự (`ASC` hoặc `DESC`)
- `category_id` (optional): Lọc theo danh mục
- `min_price` (optional): Giá tối thiểu
- `max_price` (optional): Giá tối đa
- `search` (optional): Tìm kiếm theo tên
- `is_featured` (optional): Lọc sản phẩm nổi bật (true/false)
- `status` (optional): Lọc theo trạng thái (mặc định: active)

### Response

**Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Điện thoại iPhone 15 Pro",
      "slug": "iphone-15-pro",
      "sku": "IP15PRO-128GB-BLACK",
      "short_description": "Mô tả ngắn gọn về sản phẩm",
      "price": 29990000,
      "sale_price": 27990000,
      "discount_percentage": 6.67,
      "stock_quantity": 100,
      "status": "active",
      "featured_image": "https://example.com/image.jpg",
      "is_featured": true,
      "average_rating": 4.5,
      "review_count": 150,
      "view_count": 1500,
      "categories": [
        {
          "id": 1,
          "name": "Điện thoại",
          "slug": "dien-thoai"
        }
      ],
      "created_at": "2025-01-11T05:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 150,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## 2. Get Product by Slug (Lấy thông tin sản phẩm)

### Request

```bash
# By Slug
curl -X GET http://localhost:3000/api/public/products/iphone-15-pro \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Điện thoại iPhone 15 Pro",
    "slug": "iphone-15-pro",
    "sku": "IP15PRO-128GB-BLACK",
    "description": "Mô tả chi tiết sản phẩm với HTML formatting...",
    "short_description": "Mô tả ngắn gọn về sản phẩm",
    "price": 29990000,
    "sale_price": 27990000,
    "discount_percentage": 6.67,
    "stock_quantity": 100,
    "status": "active",
    "featured_image": "https://example.com/image.jpg",
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg",
      "https://example.com/image3.jpg"
    ],
    "is_featured": true,
    "average_rating": 4.5,
    "review_count": 150,
    "view_count": 1500,
    "meta_title": "iPhone 15 Pro - Chính hãng VN/A",
    "meta_description": "Mua iPhone 15 Pro giá tốt",
    "meta_keywords": "iphone, iphone 15 pro, smartphone",
    "categories": [
      {
        "id": 1,
        "name": "Điện thoại",
        "slug": "dien-thoai"
      }
    ],
    "variants": [
      {
        "id": 1,
        "sku": "IP15PRO-128GB-BLACK",
        "price": 29990000,
        "sale_price": 27990000,
        "stock_quantity": 50,
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
        "sku": "IP15PRO-256GB-BLACK",
        "price": 33990000,
        "sale_price": 31990000,
        "stock_quantity": 30,
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
    ],
    "specifications": {
      "screen": "6.1 inch, Super Retina XDR",
      "cpu": "Apple A17 Pro",
      "ram": "8GB",
      "camera": "48MP + 12MP + 12MP"
    },
    "related_products": [
      {
        "id": 2,
        "name": "iPhone 15",
        "slug": "iphone-15",
        "price": 22990000,
        "featured_image": "https://example.com/iphone15.jpg"
      }
    ],
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T05:00:00.000Z"
  },
  "message": "Thành công"
}
```

---

## 3. Get Product Reviews (Lấy đánh giá sản phẩm)

**Lưu ý:** Endpoint này không có trong controller hiện tại. Vui lòng tham khảo [User Product Reviews API](./../user/product-review.md) để xem đánh giá sản phẩm.

---

## 4. Get Product Variants (Lấy biến thể sản phẩm)

### Request

```bash
curl -X GET http://localhost:3000/api/public/products/1/variants \
  -H "Content-Type: application/json"
```

### Path Parameters

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của sản phẩm |

### Response

**Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "sku": "IP15PRO-128GB-BLACK",
      "name": "iPhone 15 Pro - 128GB - Đen",
      "price": "29990000",
      "sale_price": "27990000",
      "stock_quantity": 50,
      "image_url": "https://example.com/iphone-black.jpg",
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
      "sku": "IP15PRO-256GB-BLACK",
      "name": "iPhone 15 Pro - 256GB - Đen",
      "price": "33990000",
      "sale_price": "31990000",
      "stock_quantity": 30,
      "image_url": "https://example.com/iphone-black-256.jpg",
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

## 5. Get Featured Products (Lấy sản phẩm nổi bật)

### Request

```bash
curl -X GET "http://localhost:3000/api/public/products/featured?limit=8" \
  -H "Content-Type: application/json"
```

### Query Parameters

- `limit` (optional): Số lượng sản phẩm (mặc định: 10)

### Response

**Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "iPhone 15 Pro",
      "slug": "iphone-15-pro",
      "price": 29990000,
      "sale_price": 27990000,
      "featured_image": "https://example.com/image.jpg",
      "average_rating": 4.5,
      "review_count": 150
    }
  ]
}
```

---

## 6. Get Products by Category Slug (Lấy sản phẩm theo slug danh mục)

### Request

```bash
curl -X GET "http://localhost:3000/api/public/products/category/dien-thoai?page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Path Parameters

| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| slug | string | Slug của danh mục sản phẩm |

### Query Parameters

- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số lượng mỗi trang (mặc định: 10)
- `sortBy` (optional): Trường sắp xếp (name, price, created_at, view_count)
- `sortOrder` (optional): Thứ tự (`ASC` hoặc `DESC`)
- `min_price` (optional): Giá tối thiểu
- `max_price` (optional): Giá tối đa
- `search` (optional): Tìm kiếm theo tên
- `is_featured` (optional): Lọc sản phẩm nổi bật (true/false)

### Response

**Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Điện thoại iPhone 15 Pro",
      "slug": "iphone-15-pro",
      "sku": "IP15PRO-128GB-BLACK",
      "short_description": "Mô tả ngắn gọn về sản phẩm",
      "price": 29990000,
      "sale_price": 27990000,
      "discount_percentage": 6.67,
      "stock_quantity": 100,
      "status": "active",
      "featured_image": "https://example.com/image.jpg",
      "is_featured": true,
      "average_rating": 4.5,
      "review_count": 150,
      "view_count": 1500,
      "categories": [
        {
          "id": 1,
          "name": "Điện thoại",
          "slug": "dien-thoai"
        }
      ],
      "created_at": "2025-01-11T05:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Category with slug 'invalid-category' not found"
}
```

---

## Filter & Sort Options

### Sort Options
- `name:ASC` - Tên A-Z
- `name:DESC` - Tên Z-A
- `price:ASC` - Giá thấp đến cao
- `price:DESC` - Giá cao đến thấp
- `created_at:DESC` - Mới nhất
- `view_count:DESC` - Xem nhiều nhất
- `average_rating:DESC` - Đánh giá cao nhất

### Filter Examples

```bash
# Lọc theo giá
curl "http://localhost:3000/api/public/products?min_price=10000000&max_price=30000000"

# Lọc theo danh mục và giá
curl "http://localhost:3000/api/public/products?category_id=1&min_price=20000000"

# Sản phẩm nổi bật trong khoảng giá
curl "http://localhost:3000/api/public/products?is_featured=true&min_price=10000000&max_price=50000000"

# Tìm kiếm và lọc
curl "http://localhost:3000/api/public/products?search=iphone&category_id=1&sortBy=price&sortOrder=ASC"

# Lọc theo slug danh mục
curl "http://localhost:3000/api/public/products/category/dien-thoai?sortBy=price&sortOrder=ASC"

# Lọc theo slug danh mục và khoảng giá
curl "http://localhost:3000/api/public/products/category/dien-thoai?min_price=10000000&max_price=30000000"
```

---

## Product Status

Chỉ hiển thị sản phẩm có status = `active` trong API công khai.

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 404 | Not Found - Product not found |
| 500 | Internal Server Error |

---

**Xem thêm:**
- [Public Product Categories API](./product-category.md)
- [Public Cart API](./cart.md)
- [User Product Reviews API](./../user/product-review.md)
- [Admin Products API](./../admin/product.md)