# User Product Reviews API

API quản lý đánh giá sản phẩm của người dùng (product reviews).

## Cấu trúc

- Base URL: `http://localhost:3000/api`
- Authentication: JWT Bearer Token (bắt buộc)
- Headers: `Content-Type: application/json`

## Lưu ý quan trọng

- API này tự động lọc theo tài khoản của người dùng hiện tại
- Người dùng chỉ có thể xem, chỉnh sửa, xóa các đánh giá của chính mình
- Khi gọi API GET, hệ thống sẽ tự động thêm filter `user_id` theo token xác thực

---

## 1. Get My Reviews (Lấy danh sách đánh giá của tôi)

### Request

```bash
curl -X GET "http://localhost:3000/api/user/reviews?page=1&limit=10" \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

### Query Parameters

- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số lượng mỗi trang (mặc định: 10)
- `product_id` (optional): Lọc theo sản phẩm
- `rating` (optional): Lọc theo số sao (1-5)
- `status` (optional): Lọc theo trạng thái ('approved', 'pending', 'rejected')
- `sort` (optional): Sắp xếp theo trường (mặc định: 'created_at:DESC')

**Lưu ý:** API tự động lọc theo tài khoản của người dùng hiện tại, chỉ trả về các đánh giá của người dùng đó.

### Response

**Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "product_id": 10,
      "user_id": 5,
      "rating": 5,
      "title": "Sản phẩm tuyệt vời",
      "comment": "Rất hài lòng với sản phẩm này. Chất lượng tốt, giao hàng nhanh.",
      "images": [
        "https://example.com/review-image1.jpg",
        "https://example.com/review-image2.jpg"
      ],
      "is_verified_purchase": true,
      "helpful_count": 10,
      "status": "approved",
      "product": {
        "id": 10,
        "name": "iPhone 15 Pro",
        "featured_image": "https://example.com/iphone.jpg"
      },
      "created_at": "2025-01-11T05:00:00.000Z",
      "updated_at": "2025-01-11T05:00:00.000Z"
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

## 2. Get Review by ID (Lấy thông tin đánh giá)

### Request

```bash
curl -X GET http://localhost:3000/api/user/reviews/1 \
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
    "product_id": 10,
    "user_id": 5,
    "rating": 5,
    "title": "Sản phẩm tuyệt vời",
    "comment": "Rất hài lòng với sản phẩm này. Chất lượng tốt, giao hàng nhanh.",
    "images": [
      "https://example.com/review-image1.jpg",
      "https://example.com/review-image2.jpg"
    ],
    "is_verified_purchase": true,
    "helpful_count": 10,
    "status": "approved",
    "product": {
      "id": 10,
      "name": "iPhone 15 Pro",
      "featured_image": "https://example.com/iphone.jpg"
    },
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T05:00:00.000Z"
  },
  "message": "Thành công"
}
```

---

## 3. Create Review (Tạo đánh giá)

### Request

```bash
curl -X POST http://localhost:3000/api/user/reviews \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 10,
    "rating": 5,
    "title": "Sản phẩm tuyệt vời",
    "comment": "Rất hài lòng với sản phẩm này",
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ]
  }'
```

### Request Body

```json
{
  "product_id": 10,
  "rating": 5,
  "title": "Sản phẩm tuyệt vời",
  "comment": "Rất hài lòng với sản phẩm này. Chất lượng tốt, giao hàng nhanh.",
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```

**Fields:**
- `product_id` (required): ID sản phẩm
- `rating` (required): Số sao đánh giá (1-5)
- `title` (optional): Tiêu đề đánh giá
- `comment` (required): Nội dung đánh giá
- `images` (optional): Mảng URL hình ảnh

**Lưu ý:**
- Chỉ có thể đánh giá sản phẩm đã mua
- Mỗi sản phẩm chỉ được đánh giá 1 lần
- Đánh giá cần được admin duyệt trước khi hiển thị công khai
- API này chỉ trả về các đánh giá của người dùng hiện tại, không cần truyền user_id

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 51,
    "product_id": 10,
    "user_id": 5,
    "rating": 5,
    "title": "Sản phẩm tuyệt vời",
    "comment": "Rất hài lòng với sản phẩm này. Chất lượng tốt, giao hàng nhanh.",
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    "is_verified_purchase": true,
    "helpful_count": 0,
    "status": "pending",
    "created_at": "2025-01-11T06:00:00.000Z",
    "updated_at": "2025-01-11T06:00:00.000Z"
  },
  "message": "Đánh giá của bạn đã được gửi và đang chờ duyệt"
}
```

---

## 4. Update Review (Cập nhật đánh giá)

Chỉ có thể cập nhật đánh giá của mình và trong vòng 7 ngày kể từ khi tạo.
- Chỉ cập nhật được các đánh giá có trạng thái 'pending'
- Không thể cập nhật đánh giá đã được duyệt (status: 'approved')

### Request

```bash
curl -X PUT http://localhost:3000/api/user/reviews/1 \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 4,
    "title": "Tiêu đề đã cập nhật",
    "comment": "Nội dung đã cập nhật"
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
    "rating": 4,
    "title": "Tiêu đề đã cập nhật",
    "comment": "Nội dung đã cập nhật",
    "status": "pending",
    "updated_at": "2025-01-11T06:05:00.000Z"
  },
  "message": "Cập nhật đánh giá thành công. Đang chờ duyệt lại."
}
```

---

## 5. Delete Review (Xóa đánh giá)

### Request

```bash
curl -X DELETE http://localhost:3000/api/user/reviews/1 \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Xóa đánh giá thành công"
}
```

---

## 6. Mark Review as Helpful (Đánh dấu đánh giá hữu ích)

### Request

```bash
curl -X POST http://localhost:3000/api/user/reviews/1/helpful \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "review_id": 1,
    "helpful_count": 11
  },
  "message": "Đã đánh dấu đánh giá hữu ích"
}
```

---

## 7. Check if Can Review Product (Kiểm tra có thể đánh giá)

Kiểm tra xem người dùng có thể đánh giá sản phẩm hay không.

### Request

```bash
curl -X GET http://localhost:3000/api/user/reviews/can-review/10 \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "can_review": true,
    "has_purchased": true,
    "has_reviewed": false,
    "reason": null
  },
  "message": "Thành công"
}
```

**Không thể đánh giá:**
```json
{
  "success": true,
  "data": {
    "can_review": false,
    "has_purchased": false,
    "has_reviewed": false,
    "reason": "Bạn cần mua sản phẩm này trước khi đánh giá"
  },
  "message": "Thành công"
}
```

---

## Review Status

Các trạng thái đánh giá:

- `pending`: Chờ duyệt
- `approved`: Đã duyệt
- `rejected`: Bị từ chối

---

## Rating System

Hệ thống đánh giá 5 sao:

- `5 stars`: Xuất sắc
- `4 stars`: Tốt
- `3 stars`: Trung bình
- `2 stars`: Kém
- `1 star`: Rất kém

---

## Review Guidelines

Hướng dẫn viết đánh giá:

1. **Trung thực**: Viết đánh giá dựa trên trải nghiệm thực tế
2. **Chi tiết**: Mô tả cụ thể về sản phẩm, chất lượng, dịch vụ
3. **Hữu ích**: Cung cấp thông tin giúp người khác đưa ra quyết định
4. **Lịch sự**: Tránh ngôn từ thô tục, xúc phạm
5. **Hình ảnh**: Đính kèm hình ảnh thực tế của sản phẩm (nếu có)

**Không được phép:**
- Đánh giá sản phẩm chưa mua
- Spam, quảng cáo
- Nội dung không phù hợp
- Đánh giá giả mạo

## Phân biệt giữa User API và Public API

- **User API** (`/user/product-reviews`): Chỉ hiển thị các đánh giá của tài khoản hiện tại
- **Public API** (`/public/product-reviews`): Hiển thị tất cả các đánh giá đã được duyệt, không lọc theo người dùng

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Validation failed |
| 401 | Unauthorized |
| 403 | Forbidden - Cannot review this product |
| 404 | Not Found - Review or product not found |
| 409 | Conflict - Already reviewed this product |
| 500 | Internal Server Error |

---

**Xem thêm:**
- [Public Products API](./../public/product.md)
- [User Orders API](./order.md)