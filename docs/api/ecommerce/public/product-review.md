# Product Review API (Public)

API này cung cấp các endpoint công khai để xem đánh giá sản phẩm mà không cần xác thực.

## Base URL
```
/api/v1/ecommerce/public/product-reviews
```

## Endpoints

### 1. Lấy danh sách đánh giá sản phẩm

Lấy danh sách các đánh giá sản phẩm đã được duyệt với bộ lọc và phân trang.

**Endpoint:** `GET /api/v1/ecommerce/public/product-reviews`

**Permissions:** Công khai (không cần xác thực)

**Query Parameters:**
- `page` (number, optional): Số trang (mặc định: 1)
- `limit` (number, optional): Số lượng item mỗi trang (mặc định: 10)
- `sort` (string, optional): Trường để sắp xếp (mặc định: 'created_at:DESC')
- `product_id` (number, optional): Lọc theo ID sản phẩm
- `rating` (number, optional): Lọc theo số sao đánh giá (1-5)
- `status` (string, optional): Lọc theo trạng thái ('approved', 'pending', 'rejected')
- `search` (string, optional): Tìm kiếm theo nội dung đánh giá

**Response:**
```json
{
  "success": true,
  "message": "Reviews retrieved successfully",
  "data": {
    "items": [
      {
        "id": 1,
        "userId": 123,
        "productId": 456,
        "rating": 5,
        "title": "Sản phẩm tuyệt vời",
        "content": "Chất lượng vượt mong đợi, sẽ mua lại",
        "pros": "Chất lượng tốt, giao hàng nhanh",
        "cons": "Giá hơi cao",
        "isVerifiedPurchase": true,
        "helpfulCount": 12,
        "status": "approved",
        "createdAt": "2023-11-15T10:30:00Z",
        "updatedAt": "2023-11-15T10:30:00Z",
        "user": {
          "id": 123,
          "name": "Nguyễn Văn A",
          "avatar": "https://example.com/avatar.jpg"
        },
        "product": {
          "id": 456,
          "name": "iPhone 15 Pro Max",
          "slug": "iphone-15-pro-max",
          "images": [
            "https://example.com/product1.jpg"
          ]
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

### 2. Lấy thống kê đánh giá của sản phẩm

Lấy thống kê đánh giá của một sản phẩm cụ thể.

**Endpoint:** `GET /api/v1/ecommerce/public/product-reviews/product/:productId/stats`

**Permissions:** Công khai (không cần xác thực)

**Path Parameters:**
- `productId` (number, required): ID của sản phẩm

**Response:**
```json
{
  "success": true,
  "message": "Product review stats retrieved successfully",
  "data": {
    "productId": 456,
    "totalReviews": 50,
    "averageRating": 4.5,
    "ratingDistribution": {
      "5": 25,
      "4": 15,
      "3": 7,
      "2": 2,
      "1": 1
    },
    "recommendationPercentage": 90,
    "verifiedPurchasePercentage": 85
  }
}
```

### 3. Lấy các đánh giá nổi bật của sản phẩm

Lấy các đánh giá nổi bật (được đánh giá cao) của một sản phẩm.

**Endpoint:** `GET /api/v1/ecommerce/public/product-reviews/product/:productId/featured`

**Permissions:** Công khai (không cần xác thực)

**Path Parameters:**
- `productId` (number, required): ID của sản phẩm

**Query Parameters:**
- `limit` (number, optional): Số lượng review trả về (mặc định: 3)

**Response:**
```json
{
  "success": true,
  "message": "Featured reviews retrieved successfully",
  "data": [
    {
      "id": 1,
      "userId": 123,
      "productId": 456,
      "rating": 5,
      "title": "Sản phẩm tuyệt vời",
      "comment": "Chất lượng vượt mong đợi, sẽ mua lại",
      "isVerifiedPurchase": true,
      "helpfulCount": 12,
      "status": "approved",
      "createdAt": "2023-11-15T10:30:00Z",
      "user": {
        "id": 123,
        "name": "Nguyễn Văn A",
        "avatar": "https://example.com/avatar.jpg"
      }
    }
  ]
}
```

### 4. Đánh giá review hữu ích

Đánh giá một review là hữu ích.

**Endpoint:** `POST /api/v1/ecommerce/public/product-reviews/:id/helpful`

**Permissions:** Công khai (không cần xác thực)

**Path Parameters:**
- `id` (number, required): ID của review

**Response:**
```json
{
  "success": true,
  "message": "Review marked as helpful successfully",
  "data": {
    "reviewId": 1,
    "helpfulCount": 13
  }
}
```

## Error Responses

### 404 Not Found
```json
{
  "success": false,
  "message": "Review not found",
  "error": {
    "code": "REVIEW_NOT_FOUND",
    "details": "Review with ID 999 not found"
  }
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid input data",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "productId": "productId must be a positive number"
    }
  }
}
```

## Notes

- Các endpoint public này không yêu cầu xác thực JWT
- Chỉ các đánh giá có trạng thái 'approved' mới được hiển thị cho công khai (mặc định)
- Thống kê đánh giá được tính toán dựa trên các đánh giá đã được duyệt
- Một người dùng có thể đánh giá nhiều review là hữu ích
- API public hiển thị tất cả các đánh giá đã được duyệt, không lọc theo người dùng