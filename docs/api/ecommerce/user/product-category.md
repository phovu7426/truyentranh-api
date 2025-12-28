# User Product Category API

API danh mục sản phẩm dành cho người dùng đã đăng nhập - yêu cầu authentication.

## Cấu trúc

- Base URL: `http://localhost:3000/api`
- Authentication: JWT Bearer Token (bắt buộc)
- Headers: `Content-Type: application/json`

---

## 1. Get Categories List (Lấy danh sách danh mục)

Lấy danh sách tất cả danh mục sản phẩm với thông tin cá nhân hóa cho user.

### Endpoint
```
GET /api/user/product-categories
```

### Query Parameters
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| parent_id | number | Không | Lọc theo danh mục cha |
| level | number | Không | Lọc theo cấp độ |
| is_featured | boolean | Không | Chỉ hiển thị danh mục nổi bật |
| has_products | boolean | Không | Chỉ hiển thị danh mục có sản phẩm |
| include_empty | boolean | Không | Bao gồm danh mục rỗng (mặc định: false) |
| sort_by | string | Không | Sắp xếp theo trường (name, product_count, created_at) |
| sort_order | string | Không | Thứ tự sắp xếp (ASC/DESC) |

### Request Example

```bash
curl -X GET "http://localhost:3000/api/user/product-categories?parent_id=0" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Lấy danh mục nổi bật
curl -X GET "http://localhost:3000/api/user/product-categories?is_featured=true" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Lấy danh mục có sản phẩm đã mua
curl -X GET "http://localhost:3000/api/user/product-categories?has_purchased=true" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy danh sách danh mục thành công",
  "data": [
    {
      "id": 1,
      "name": "Điện thoại",
      "slug": "dien-thoai",
      "description": "Các loại điện thoại di động thông minh",
      "image_url": "https://example.com/categories/phones.jpg",
      "icon_url": "https://example.com/icons/phone.svg",
      "parent_id": null,
      "level": 1,
      "sort_order": 1,
      "is_featured": true,
      "is_active": true,
      "product_count": 150,
      "user_stats": {
        "viewed_products": 25,
        "purchased_products": 3,
        "wishlist_products": 5,
        "last_viewed": "2025-01-20T08:30:00.000Z"
      },
      "children": [
        {
          "id": 11,
          "name": "iPhone",
          "slug": "iphone",
          "parent_id": 1,
          "level": 2,
          "product_count": 45,
          "user_stats": {
            "viewed_products": 15,
            "purchased_products": 2,
            "wishlist_products": 3
          }
        },
        {
          "id": 12,
          "name": "Samsung",
          "slug": "samsung",
          "parent_id": 1,
          "level": 2,
          "product_count": 38,
          "user_stats": {
            "viewed_products": 8,
            "purchased_products": 1,
            "wishlist_products": 2
          }
        }
      ],
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## 2. Get Category by ID or Slug (Lấy chi tiết danh mục)

Lấy thông tin chi tiết của một danh mục cụ thể kèm theo thống kê user.

### Endpoint
```
GET /api/user/product-categories/:idOrSlug
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| idOrSlug | string | ID hoặc slug của danh mục |

### Request Example

```bash
# By ID
curl -X GET "http://localhost:3000/api/user/product-categories/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# By Slug
curl -X GET "http://localhost:3000/api/user/product-categories/dien-thoai" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy thông tin danh mục thành công",
  "data": {
    "id": 1,
    "name": "Điện thoại",
    "slug": "dien-thoai",
    "description": "Các loại điện thoại di động thông minh với nhiều tính năng hiện đại",
    "image_url": "https://example.com/categories/phones.jpg",
    "icon_url": "https://example.com/icons/phone.svg",
    "banner_url": "https://example.com/banners/phones-banner.jpg",
    "meta_title": "Điện thoại thông minh giá tốt",
    "meta_description": "Mua điện thoại thông minh giá tốt, chính hãng",
    "meta_keywords": "điện thoại, smartphone, iphone, samsung",
    "parent_id": null,
    "level": 1,
    "sort_order": 1,
    "is_featured": true,
    "is_active": true,
    "product_count": 150,
    "user_stats": {
      "viewed_products": 25,
      "purchased_products": 3,
      "wishlist_products": 5,
      "total_spent": 85000000,
      "average_rating_given": 4.5,
      "last_viewed": "2025-01-20T08:30:00.000Z",
      "favorite_products": [
        {
          "id": 1,
          "name": "iPhone 15 Pro",
          "slug": "iphone-15-pro",
          "featured_image": "https://example.com/iphone.jpg",
          "price": 29990000,
          "user_rating": 5
        }
      ]
    },
    "parent": null,
    "children": [
      {
        "id": 11,
        "name": "iPhone",
        "slug": "iphone",
        "product_count": 45,
        "user_stats": {
          "viewed_products": 15,
          "purchased_products": 2,
          "wishlist_products": 3
        }
      }
    ],
    "featured_products": [
      {
        "id": 1,
        "name": "iPhone 15 Pro",
        "slug": "iphone-15-pro",
        "price": 29990000,
        "sale_price": 27990000,
        "featured_image": "https://example.com/iphone.jpg",
        "average_rating": 4.5,
        "is_in_wishlist": true,
        "is_purchased": true
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-15T10:30:00.000Z"
  }
}
```

---

## 3. Get Category Tree (Lấy cây danh mục)

Lấy cấu trúc cây đầy đủ của danh mục sản phẩm.

### Endpoint
```
GET /api/user/product-categories/tree
```

### Query Parameters
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| max_level | number | Không | Cấp độ tối đa (mặc định: 3) |
| include_stats | boolean | Không | Bao gồm thống kê user (mặc định: true) |
| parent_id | number | Không | Bắt đầu từ danh mục cha cụ thể |

### Request Example

```bash
curl -X GET "http://localhost:3000/api/user/product-categories/tree?max_level=2" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy cây danh mục thành công",
  "data": [
    {
      "id": 1,
      "name": "Điện thoại",
      "slug": "dien-thoai",
      "image_url": "https://example.com/categories/phones.jpg",
      "product_count": 150,
      "user_stats": {
        "viewed_products": 25,
        "purchased_products": 3,
        "wishlist_products": 5
      },
      "children": [
        {
          "id": 11,
          "name": "iPhone",
          "slug": "iphone",
          "product_count": 45,
          "user_stats": {
            "viewed_products": 15,
            "purchased_products": 2,
            "wishlist_products": 3
          },
          "children": [
            {
              "id": 111,
              "name": "iPhone 15 Series",
              "slug": "iphone-15-series",
              "product_count": 12,
              "user_stats": {
                "viewed_products": 8,
                "purchased_products": 1,
                "wishlist_products": 2
              }
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 4. Get Category Products (Lấy sản phẩm theo danh mục)

Lấy danh sách sản phẩm trong một danh mục với thông tin cá nhân hóa.

### Endpoint
```
GET /api/user/product-categories/:idOrSlug/products
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| idOrSlug | string | ID hoặc slug của danh mục |

### Query Parameters
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| page | number | Không | Số trang (mặc định: 1) |
| limit | number | Không | Số lượng mỗi trang (mặc định: 10) |
| search | string | Không | Tìm kiếm theo tên sản phẩm |
| min_price | number | Không | Giá tối thiểu |
| max_price | number | Không | Giá tối đa |
| sort_by | string | Không | Sắp xếp theo trường |
| sort_order | string | Không | Thứ tự sắp xếp (ASC/DESC) |
| is_wishlist | boolean | Không | Chỉ hiển thị sản phẩm yêu thích |
| is_purchased | boolean | Không | Chỉ hiển thị sản phẩm đã mua |

### Request Example

```bash
curl -X GET "http://localhost:3000/api/user/product-categories/dien-thoai/products?page=1&limit=10" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Lọc sản phẩm yêu thích trong danh mục
curl -X GET "http://localhost:3000/api/user/product-categories/dien-thoai/products?is_wishlist=true" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy sản phẩm theo danh mục thành công",
  "data": {
    "category": {
      "id": 1,
      "name": "Điện thoại",
      "slug": "dien-thoai",
      "product_count": 150,
      "user_stats": {
        "viewed_products": 25,
        "purchased_products": 3,
        "wishlist_products": 5
      }
    },
    "products": [
      {
        "id": 1,
        "name": "Điện thoại iPhone 15 Pro",
        "slug": "iphone-15-pro",
        "sku": "IP15PRO-128GB-BLACK",
        "price": 29990000,
        "sale_price": 27990000,
        "discount_percentage": 6.67,
        "featured_image": "https://example.com/image.jpg",
        "average_rating": 4.5,
        "review_count": 150,
        "is_in_wishlist": true,
        "is_purchased": true,
        "purchase_date": "2025-01-10T10:30:00.000Z",
        "view_count": 5
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "totalItems": 150,
      "totalPages": 15,
      "hasNextPage": true,
      "hasPreviousPage": false
    },
    "filters": {
      "price_range": {
        "min": 5000000,
        "max": 35000000
      },
      "brands": [
        {
          "id": 1,
          "name": "Apple",
          "product_count": 45
        },
        {
          "id": 2,
          "name": "Samsung",
          "product_count": 38
        }
      ],
      "attributes": [
        {
          "id": 1,
          "name": "Màu sắc",
          "values": [
            {
              "id": 1,
              "value": "Đen",
              "product_count": 60
            },
            {
              "id": 2,
              "value": "Trắng",
              "product_count": 45
            }
          ]
        }
      ]
    }
  }
}
```

---

## 5. Get Favorite Categories (Lấy danh mục yêu thích)

Lấy danh sách các danh mục mà user thường xuyên tương tác nhất.

### Endpoint
```
GET /api/user/product-categories/favorites
```

### Query Parameters
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| limit | number | Không | Số lượng danh mục (mặc định: 10) |
| sort_by | string | Không | Sắp xếp theo (view_count, purchase_count, wishlist_count) |

### Request Example

```bash
curl -X GET "http://localhost:3000/api/user/product-categories/favorites?limit=5" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy danh mục yêu thích thành công",
  "data": [
    {
      "id": 1,
      "name": "Điện thoại",
      "slug": "dien-thoai",
      "image_url": "https://example.com/categories/phones.jpg",
      "product_count": 150,
      "user_stats": {
        "viewed_products": 25,
        "purchased_products": 3,
        "wishlist_products": 5,
        "total_spent": 85000000,
        "last_viewed": "2025-01-20T08:30:00.000Z",
        "interaction_score": 0.85
      }
    },
    {
      "id": 5,
      "name": "Laptop",
      "slug": "laptop",
      "image_url": "https://example.com/categories/laptops.jpg",
      "product_count": 80,
      "user_stats": {
        "viewed_products": 18,
        "purchased_products": 2,
        "wishlist_products": 3,
        "total_spent": 45000000,
        "last_viewed": "2025-01-18T14:20:00.000Z",
        "interaction_score": 0.72
      }
    }
  ]
}
```

---

## 6. Get Recommended Categories (Lấy danh mục gợi ý)

Lấy danh sách danh mục gợi ý dựa trên lịch sử của user.

### Endpoint
```
GET /api/user/product-categories/recommended
```

### Query Parameters
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| limit | number | Không | Số lượng danh mục (mặc định: 10) |
| exclude_viewed | boolean | Không | Loại trừ danh mục đã xem (mặc định: false) |

### Request Example

```bash
curl -X GET "http://localhost:3000/api/user/product-categories/recommended?limit=5" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy danh mục gợi ý thành công",
  "data": [
    {
      "id": 8,
      "name": "Phụ kiện điện tử",
      "slug": "phu-kien-dien-tu",
      "image_url": "https://example.com/categories/accessories.jpg",
      "product_count": 120,
      "recommendation_score": 0.78,
      "recommendation_reason": "Dựa trên sản phẩm bạn đã xem trong danh mục Điện thoại",
      "featured_products": [
        {
          "id": 25,
          "name": "AirPods Pro",
          "slug": "airpods-pro",
          "price": 5990000,
          "featured_image": "https://example.com/airpods.jpg"
        }
      ]
    }
  ]
}
```

---

## 7. Track Category View (Theo dõi xem danh mục)

Ghi lại khi user xem một danh mục (dùng cho recommendation engine).

### Endpoint
```
POST /api/user/product-categories/:id/track-view
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của danh mục |

### Request Body (Optional)
```json
{
  "source": "navigation",
  "referrer": "homepage"
}
```

**Fields:**
- `source` (optional): Nguồn truy cập (navigation, search, recommendation, etc.)
- `referrer` (optional): Nguồn giới thiệu

### Request Example

```bash
curl -X POST "http://localhost:3000/api/user/product-categories/1/track-view" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "source": "navigation",
    "referrer": "homepage"
  }'
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Theo dõi xem danh mục thành công",
  "data": {
    "category_id": 1,
    "user_id": 5,
    "viewed_at": "2025-01-20T08:30:00.000Z",
    "source": "navigation"
  }
}
```

---

## Use Cases

### Use Case 1: User browsing categories

```bash
# 1. User xem cây danh mục
GET /api/user/product-categories/tree

# 2. User chọn danh mục Điện thoại
GET /api/user/product-categories/dien-thoai

# 3. User xem sản phẩm trong danh mục
GET /api/user/product-categories/dien-thoai/products

# 4. Theo dõi việc xem danh mục
POST /api/user/product-categories/1/track-view
{
  "source": "navigation"
}
```

### Use Case 2: Personalized category experience

```bash
# 1. User xem danh mục yêu thích
GET /api/user/product-categories/favorites

# 2. User xem danh mục gợi ý
GET /api/user/product-categories/recommended

# 3. User xem danh mục với thống kê cá nhân
GET /api/user/product-categories/dien-thoai

# Response sẽ bao gồm:
# - Số sản phẩm đã xem
# - Số sản phẩm đã mua
# - Số sản phẩm yêu thích
# - Tổng chi tiêu
# - Sản phẩm yêu thích trong danh mục
```

### Use Case 3: Category-based filtering

```bash
# 1. User xem danh mục con
GET /api/user/product-categories?parent_id=1

# 2. User lọc sản phẩm trong danh mục theo giá
GET /api/user/product-categories/dien-thoai/products?min_price=10000000&max_price=20000000

# 3. User lọc sản phẩm yêu thích trong danh mục
GET /api/user/product-categories/dien-thoai/products?is_wishlist=true

# 4. User lọc sản phẩm đã mua trong danh mục
GET /api/user/product-categories/dien-thoai/products?is_purchased=true
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid data |
| 401 | Unauthorized - Invalid token |
| 404 | Not Found - Category not found |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error |

---

**Xem thêm:**
- [Public Product Category API](../public/product-category.md)
- [User Product API](./product.md)
- [User Product Review API](./product-review.md)