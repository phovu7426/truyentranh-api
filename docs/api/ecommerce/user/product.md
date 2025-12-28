# User Product API

API sản phẩm dành cho người dùng đã đăng nhập - yêu cầu authentication.

## Cấu trúc

- Base URL: `http://localhost:3000/api`
- Authentication: JWT Bearer Token (bắt buộc)
- Headers: `Content-Type: application/json`

---

## 1. Get Products List (Lấy danh sách sản phẩm)

Lấy danh sách sản phẩm với phân trang và bộ lọc dành cho user đã đăng nhập.

### Endpoint
```
GET /api/user/products
```

### Query Parameters
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| page | number | Không | Số trang (mặc định: 1) |
| limit | number | Không | Số lượng mỗi trang (mặc định: 10) |
| search | string | Không | Tìm kiếm theo tên |
| category_id | number | Không | Lọc theo danh mục |
| min_price | number | Không | Giá tối thiểu |
| max_price | number | Không | Giá tối đa |
| sortBy | string | Không | Sắp xếp theo trường |
| sortOrder | string | Không | Thứ tự sắp xếp (ASC/DESC) |
| is_wishlist | boolean | Không | Chỉ hiển thị sản phẩm yêu thích |
| is_purchased | boolean | Không | Chỉ hiển thị sản phẩm đã mua |

### Request Example

```bash
curl -X GET "http://localhost:3000/api/user/products?page=1&limit=10" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Lọc sản phẩm yêu thích
curl -X GET "http://localhost:3000/api/user/products?is_wishlist=true" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Lọc sản phẩm đã mua
curl -X GET "http://localhost:3000/api/user/products?is_purchased=true" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy danh sách sản phẩm thành công",
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
      "is_in_wishlist": true,
      "is_purchased": true,
      "purchase_date": "2025-01-10T10:30:00.000Z",
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

## 2. Get Product by ID or Slug (Lấy thông tin sản phẩm)

Lấy thông tin chi tiết sản phẩm kèm theo thông tin cá nhân hóa cho user.

### Endpoint
```
GET /api/user/products/:idOrSlug
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| idOrSlug | string | ID hoặc slug của sản phẩm |

### Request Example

```bash
# By ID
curl -X GET "http://localhost:3000/api/user/products/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# By Slug
curl -X GET "http://localhost:3000/api/user/products/iphone-15-pro" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy thông tin sản phẩm thành công",
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
    "user_info": {
      "is_in_wishlist": true,
      "is_purchased": true,
      "purchase_date": "2025-01-10T10:30:00.000Z",
      "can_review": true,
      "user_review": {
        "id": 25,
        "rating": 5,
        "title": "Sản phẩm tuyệt vời",
        "comment": "Rất hài lòng với sản phẩm này. Chất lượng tốt, giao hàng nhanh.",
        "images": [
          "https://example.com/review1.jpg"
        ],
        "is_verified_purchase": true,
        "helpful_count": 10,
        "created_at": "2025-01-12T14:30:00.000Z"
      }
    },
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
        "featured_image": "https://example.com/iphone15.jpg",
        "is_in_wishlist": false,
        "is_purchased": false
      }
    ],
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T05:00:00.000Z"
  }
}
```

---

## 3. Add to Wishlist (Thêm vào danh sách yêu thích)

Thêm sản phẩm vào danh sách yêu thích của user.

### Endpoint
```
POST /api/user/products/:id/wishlist
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của sản phẩm |

### Request Example

```bash
curl -X POST "http://localhost:3000/api/user/products/1/wishlist" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Thêm vào danh sách yêu thích thành công",
  "data": {
    "product_id": 1,
    "user_id": 5,
    "added_at": "2025-01-20T08:30:00.000Z"
  }
}
```

**Error - Already in Wishlist (409):**
```json
{
  "success": false,
  "message": "Sản phẩm đã có trong danh sách yêu thích",
  "code": "ALREADY_IN_WISHLIST"
}
```

---

## 4. Remove from Wishlist (Xóa khỏi danh sách yêu thích)

Xóa sản phẩm khỏi danh sách yêu thích của user.

### Endpoint
```
DELETE /api/user/products/:id/wishlist
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của sản phẩm |

### Request Example

```bash
curl -X DELETE "http://localhost:3000/api/user/products/1/wishlist" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Xóa khỏi danh sách yêu thích thành công",
  "data": null
}
```

---

## 5. Get Wishlist (Lấy danh sách yêu thích)

Lấy danh sách tất cả sản phẩm trong danh sách yêu thích của user.

### Endpoint
```
GET /api/user/products/wishlist
```

### Query Parameters
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| page | number | Không | Số trang (mặc định: 1) |
| limit | number | Không | Số lượng mỗi trang (mặc định: 10) |
| sortBy | string | Không | Sắp xếp theo trường |
| sortOrder | string | Không | Thứ tự sắp xếp (ASC/DESC) |

### Request Example

```bash
curl -X GET "http://localhost:3000/api/user/products/wishlist?page=1&limit=10" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy danh sách yêu thích thành công",
  "data": [
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
      "added_at": "2025-01-15T10:30:00.000Z",
      "is_in_stock": true,
      "is_on_sale": true
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

## 6. Get Purchase History (Lấy lịch sử mua hàng)

Lấy danh sách sản phẩm đã mua của user.

### Endpoint
```
GET /api/user/products/purchased
```

### Query Parameters
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| page | number | Không | Số trang (mặc định: 1) |
| limit | number | Không | Số lượng mỗi trang (mặc định: 10) |
| search | string | Không | Tìm kiếm theo tên sản phẩm |
| category_id | number | Không | Lọc theo danh mục |
| date_from | string | Không | Lọc từ ngày (YYYY-MM-DD) |
| date_to | string | Không | Lọc đến ngày (YYYY-MM-DD) |

### Request Example

```bash
curl -X GET "http://localhost:3000/api/user/products/purchased?page=1&limit=10" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy lịch sử mua hàng thành công",
  "data": [
    {
      "id": 1,
      "name": "Điện thoại iPhone 15 Pro",
      "slug": "iphone-15-pro",
      "sku": "IP15PRO-128GB-BLACK",
      "price": 29990000,
      "sale_price": 27990000,
      "featured_image": "https://example.com/image.jpg",
      "average_rating": 4.5,
      "purchase_info": {
        "order_id": 123,
        "order_code": "ORD-20250110-001",
        "quantity": 1,
        "unit_price": 27990000,
        "total_price": 27990000,
        "purchase_date": "2025-01-10T10:30:00.000Z",
        "order_status": "completed",
        "payment_status": "completed"
      },
      "can_review": true,
      "has_reviewed": true,
      "user_review": {
        "id": 25,
        "rating": 5,
        "title": "Sản phẩm tuyệt vời",
        "comment": "Rất hài lòng với sản phẩm này.",
        "created_at": "2025-01-12T14:30:00.000Z"
      }
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

## 7. Get Recommended Products (Lấy sản phẩm gợi ý)

Lấy danh sách sản phẩm gợi ý dựa trên lịch sử mua hàng và xem của user.

### Endpoint
```
GET /api/user/products/recommended
```

### Query Parameters
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| limit | number | Không | Số lượng sản phẩm (mặc định: 10) |
| category_id | number | Không | Lọc theo danh mục |
| min_price | number | Không | Giá tối thiểu |
| max_price | number | Không | Giá tối đa |

### Request Example

```bash
curl -X GET "http://localhost:3000/api/user/products/recommended?limit=10" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy sản phẩm gợi ý thành công",
  "data": [
    {
      "id": 5,
      "name": "Samsung Galaxy S24 Ultra",
      "slug": "samsung-galaxy-s24-ultra",
      "sku": "SSS24U-256GB-TITAN",
      "price": 28990000,
      "sale_price": 26990000,
      "discount_percentage": 6.9,
      "featured_image": "https://example.com/samsung.jpg",
      "average_rating": 4.7,
      "review_count": 89,
      "is_in_wishlist": false,
      "is_purchased": false,
      "recommendation_score": 0.92,
      "recommendation_reason": "Dựa trên sản phẩm tương tự bạn đã xem"
    }
  ]
}
```

---

## 8. Track Product View (Theo dõi xem sản phẩm)

Ghi lại khi user xem một sản phẩm (dùng cho recommendation engine).

### Endpoint
```
POST /api/user/products/:id/track-view
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của sản phẩm |

### Request Body (Optional)
```json
{
  "duration": 45,
  "source": "search",
  "referrer": "google"
}
```

**Fields:**
- `duration` (optional): Thời gian xem (giây)
- `source` (optional): Nguồn truy cập (search, category, recommendation, etc.)
- `referrer` (optional): Nguồn giới thiệu

### Request Example

```bash
curl -X POST "http://localhost:3000/api/user/products/1/track-view" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "duration": 45,
    "source": "search",
    "referrer": "google"
  }'
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Theo dõi xem sản phẩm thành công",
  "data": {
    "product_id": 1,
    "user_id": 5,
    "viewed_at": "2025-01-20T08:30:00.000Z",
    "duration": 45,
    "source": "search"
  }
}
```

---

## Use Cases

### Use Case 1: User browsing và wishlist

```bash
# 1. User xem danh sách sản phẩm
GET /api/user/products?page=1&limit=10

# 2. User xem chi tiết sản phẩm
GET /api/user/products/1

# 3. User thích sản phẩm và thêm vào wishlist
POST /api/user/products/1/wishlist

# 4. User xem danh sách yêu thích
GET /api/user/products/wishlist

# 5. User quyết định bỏ sản phẩm khỏi wishlist
DELETE /api/user/products/1/wishlist
```

### Use Case 2: User xem lại sản phẩm đã mua

```bash
# 1. User xem lịch sử mua hàng
GET /api/user/products/purchased

# 2. User xem lại chi tiết sản phẩm đã mua
GET /api/user/products/1

# 3. User đánh giá sản phẩm (nếu chưa đánh giá)
POST /api/user/reviews
{
  "product_id": 1,
  "rating": 5,
  "title": "Sản phẩm tuyệt vời",
  "comment": "Rất hài lòng với sản phẩm này."
}
```

### Use Case 3: Recommendation engine

```bash
# 1. User xem sản phẩm
GET /api/user/products/1

# 2. Theo dõi thời gian xem
POST /api/user/products/1/track-view
{
  "duration": 120,
  "source": "recommendation"
}

# 3. Lấy sản phẩm gợi ý
GET /api/user/products/recommended?limit=5

# 4. User xem sản phẩm gợi ý
GET /api/user/products/5
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid data |
| 401 | Unauthorized - Invalid token |
| 404 | Not Found - Product not found |
| 409 | Conflict - Already in wishlist |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error |

---

**Xem thêm:**
- [Public Product API](../public/product.md)
- [User Product Review API](./product-review.md)
- [User Order API](./order.md)