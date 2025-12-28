# Admin Warehouse API

API quản lý kho hàng (warehouses) và tồn kho dành cho quản trị viên - yêu cầu authentication và permissions.

## Cấu trúc

- Base URL: `http://localhost:3000/api`
- Authentication: JWT Bearer Token (bắt buộc)
- Headers: `Content-Type: application/json`
- Required Permission: `warehouse:*` (tùy theo endpoint)

---

## 1. Get Warehouses List (Lấy danh sách kho)

Lấy danh sách tất cả kho hàng với phân trang và bộ lọc.

### Endpoint
```
GET /api/admin/warehouses
```

### Query Parameters
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| page | number | Không | Số trang (mặc định: 1) |
| limit | number | Không | Số lượng mỗi trang (mặc định: 10) |
| search | string | Không | Tìm kiếm theo tên hoặc mã |
| status | string | Không | Lọc theo trạng thái |
| city | string | Không | Lọc theo thành phố |
| sortBy | string | Không | Sắp xếp theo trường |
| sortOrder | string | Không | Thứ tự sắp xếp (ASC/DESC) |

### Request Example

```bash
curl -X GET "http://localhost:3000/api/admin/warehouses?page=1&limit=10" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy danh sách kho thành công",
  "data": [
    {
      "id": 1,
      "name": "Kho Chính - TP.HCM",
      "code": "WH-HCM-01",
      "address": "123 Nguyễn Văn Linh, Quận 7",
      "city": "TP. Hồ Chí Minh",
      "state": "TP. Hồ Chí Minh",
      "postal_code": "700000",
      "country": "Việt Nam",
      "phone": "02812345678",
      "email": "kho.hcm@example.com",
      "manager_name": "Nguyễn Văn A",
      "manager_phone": "0901234567",
      "is_primary": true,
      "status": "active",
      "total_products": 150,
      "total_value": 5000000000,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 5,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

---

## 2. Get Warehouse by ID (Lấy chi tiết kho)

Lấy thông tin chi tiết của một kho cụ thể.

### Endpoint
```
GET /api/admin/warehouses/:id
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của kho |

### Request Example

```bash
curl -X GET "http://localhost:3000/api/admin/warehouses/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy thông tin kho thành công",
  "data": {
    "id": 1,
    "name": "Kho Chính - TP.HCM",
    "code": "WH-HCM-01",
    "address": "123 Nguyễn Văn Linh, Quận 7",
    "city": "TP. Hồ Chí Minh",
    "state": "TP. Hồ Chí Minh",
    "postal_code": "700000",
    "country": "Việt Nam",
    "phone": "02812345678",
    "email": "kho.hcm@example.com",
    "manager_name": "Nguyễn Văn A",
    "manager_phone": "0901234567",
    "is_primary": true,
    "status": "active",
    "description": "Kho chính phục vụ khu vực miền Nam",
    "operating_hours": {
      "monday": "08:00-17:30",
      "tuesday": "08:00-17:30",
      "wednesday": "08:00-17:30",
      "thursday": "08:00-17:30",
      "friday": "08:00-17:30",
      "saturday": "08:00-12:00",
      "sunday": "Đóng cửa"
    },
    "total_products": 150,
    "total_value": 5000000000,
    "low_stock_products": 5,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-15T10:30:00.000Z"
  }
}
```

---

## 3. Get Warehouse Inventory (Lấy tồn kho theo kho)

Lấy danh sách sản phẩm và tồn kho trong một kho cụ thể.

### Endpoint
```
GET /api/admin/warehouses/:id/inventory
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của kho |

### Query Parameters
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| page | number | Không | Số trang (mặc định: 1) |
| limit | number | Không | Số lượng mỗi trang (mặc định: 10) |
| search | string | Không | Tìm kiếm theo tên sản phẩm hoặc SKU |
| low_stock | boolean | Không | Chỉ hiển thị sản phẩm tồn kho thấp |

### Request Example

```bash
curl -X GET "http://localhost:3000/api/admin/warehouses/1/inventory?page=1&limit=10" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Chỉ xem sản phẩm tồn kho thấp
curl -X GET "http://localhost:3000/api/admin/warehouses/1/inventory?low_stock=true" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy tồn kho thành công",
  "data": [
    {
      "id": 1,
      "warehouse_id": 1,
      "product_variant_id": 1,
      "product_name": "iPhone 15 Pro",
      "variant_name": "128GB - Đen",
      "sku": "IP15PRO-128GB-BLACK",
      "quantity": 50,
      "min_stock_level": 10,
      "max_stock_level": 100,
      "reserved_quantity": 5,
      "available_quantity": 45,
      "unit_cost": 25000000,
      "total_value": 1250000000,
      "last_updated": "2025-01-20T08:30:00.000Z",
      "is_low_stock": false,
      "product_variant": {
        "id": 1,
        "sku": "IP15PRO-128GB-BLACK",
        "name": "iPhone 15 Pro - 128GB - Đen",
        "image_url": "https://example.com/iphone.jpg"
      }
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
  "summary": {
    "total_products": 150,
    "total_quantity": 5000,
    "total_value": 5000000000,
    "low_stock_count": 5,
    "out_of_stock_count": 2
  }
}
```

---

## 4. Create Warehouse (Tạo kho mới)

Tạo một kho mới.

### Endpoint
```
POST /api/admin/warehouses
```

### Request Body
```json
{
  "name": "Kho Chi Nhánh - Hà Nội",
  "code": "WH-HN-01",
  "address": "456 Trần Duy Hưng, Quận Cầu Giấy",
  "city": "Hà Nội",
  "state": "Hà Nội",
  "postal_code": "100000",
  "country": "Việt Nam",
  "phone": "02412345678",
  "email": "kho.hn@example.com",
  "manager_name": "Trần Văn B",
  "manager_phone": "0909876543",
  "is_primary": false,
  "status": "active",
  "description": "Kho chi nhánh phục vụ khu vực miền Bắc",
  "operating_hours": {
    "monday": "08:00-17:30",
    "tuesday": "08:00-17:30",
    "wednesday": "08:00-17:30",
    "thursday": "08:00-17:30",
    "friday": "08:00-17:30",
    "saturday": "08:00-12:00",
    "sunday": "Đóng cửa"
  }
}
```

**Fields:**
- `name` (required): Tên kho
- `code` (required): Mã kho (duy nhất)
- `address` (required): Địa chỉ
- `city` (required): Thành phố
- `state` (required): Tỉnh/Thành phố
- `postal_code` (optional): Mã bưu chính
- `country` (required): Quốc gia
- `phone` (optional): Số điện thoại
- `email` (optional): Email
- `manager_name` (optional): Tên người quản lý
- `manager_phone` (optional): SĐT người quản lý
- `is_primary` (required): Có phải kho chính không
- `status` (required): Trạng thái (active/inactive)
- `description` (optional): Mô tả
- `operating_hours` (optional): Giờ hoạt động

### Request Example

```bash
curl -X POST "http://localhost:3000/api/admin/warehouses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Kho Chi Nhánh - Hà Nội",
    "code": "WH-HN-01",
    "address": "456 Trần Duy Hưng, Quận Cầu Giấy",
    "city": "Hà Nội",
    "state": "Hà Nội",
    "postal_code": "100000",
    "country": "Việt Nam",
    "phone": "02412345678",
    "email": "kho.hn@example.com",
    "manager_name": "Trần Văn B",
    "manager_phone": "0909876543",
    "is_primary": false,
    "status": "active",
    "description": "Kho chi nhánh phục vụ khu vực miền Bắc"
  }'
```

### Response

**Success (201):**
```json
{
  "success": true,
  "message": "Tạo kho thành công",
  "data": {
    "id": 6,
    "name": "Kho Chi Nhánh - Hà Nội",
    "code": "WH-HN-01",
    "address": "456 Trần Duy Hưng, Quận Cầu Giấy",
    "city": "Hà Nội",
    "state": "Hà Nội",
    "postal_code": "100000",
    "country": "Việt Nam",
    "phone": "02412345678",
    "email": "kho.hn@example.com",
    "manager_name": "Trần Văn B",
    "manager_phone": "0909876543",
    "is_primary": false,
    "status": "active",
    "description": "Kho chi nhánh phục vụ khu vực miền Bắc",
    "created_at": "2025-01-20T08:30:00.000Z",
    "updated_at": "2025-01-20T08:30:00.000Z"
  }
}
```

---

## 5. Update Warehouse (Cập nhật kho)

Cập nhật thông tin của một kho.

### Endpoint
```
PUT /api/admin/warehouses/:id
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của kho |

### Request Body
```json
{
  "name": "Kho Chi Nhánh - Hà Nội (Cập nhật)",
  "phone": "02412345679",
  "manager_name": "Trần Văn C",
  "status": "active"
}
```

### Request Example

```bash
curl -X PUT "http://localhost:3000/api/admin/warehouses/6" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Kho Chi Nhánh - Hà Nội (Cập nhật)",
    "phone": "02412345679",
    "manager_name": "Trần Văn C",
    "status": "active"
  }'
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Cập nhật kho thành công",
  "data": {
    "id": 6,
    "name": "Kho Chi Nhánh - Hà Nội (Cập nhật)",
    "code": "WH-HN-01",
    "phone": "02412345679",
    "manager_name": "Trần Văn C",
    "status": "active",
    "updated_at": "2025-01-20T09:15:00.000Z"
  }
}
```

---

## 6. Delete Warehouse (Xóa kho)

Xóa mềm một kho.

### Endpoint
```
DELETE /api/admin/warehouses/:id
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của kho |

### Request Example

```bash
curl -X DELETE "http://localhost:3000/api/admin/warehouses/6" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Xóa kho thành công",
  "data": null
}
```

---

## 7. Update Inventory Stock (Cập nhật tồn kho)

Cập nhật số lượng tồn kho của một sản phẩm trong kho.

### Endpoint
```
PUT /api/admin/warehouses/inventory/update
```

### Request Body
```json
{
  "warehouse_id": 1,
  "product_variant_id": 1,
  "quantity": 100,
  "min_stock_level": 10,
  "max_stock_level": 200,
  "reason": "Nhập hàng mới từ nhà cung cấp"
}
```

**Fields:**
- `warehouse_id` (required): ID của kho
- `product_variant_id` (required): ID của biến thể sản phẩm
- `quantity` (required): Số lượng tồn kho mới
- `min_stock_level` (optional): Mức tồn kho tối thiểu
- `max_stock_level` (optional): Mức tồn kho tối đa
- `reason` (optional): Lý do cập nhật

### Request Example

```bash
curl -X PUT "http://localhost:3000/api/admin/warehouses/inventory/update" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "warehouse_id": 1,
    "product_variant_id": 1,
    "quantity": 100,
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
    "warehouse_id": 1,
    "product_variant_id": 1,
    "quantity": 100,
    "min_stock_level": 10,
    "max_stock_level": 200,
    "previous_quantity": 50,
    "change": "+50",
    "updated_at": "2025-01-20T10:30:00.000Z"
  }
}
```

---

## 8. Create Stock Transfer (Tạo phiếu chuyển kho)

Tạo phiếu chuyển hàng giữa các kho.

### Endpoint
```
POST /api/admin/warehouses/transfers
```

### Request Body
```json
{
  "from_warehouse_id": 1,
  "to_warehouse_id": 2,
  "product_variant_id": 1,
  "quantity": 20,
  "notes": "Chuyển hàng tồn kho dư từ kho chính sang chi nhánh"
}
```

**Fields:**
- `from_warehouse_id` (required): ID kho xuất
- `to_warehouse_id` (required): ID kho nhập
- `product_variant_id` (required): ID biến thể sản phẩm
- `quantity` (required): Số lượng chuyển
- `notes` (optional): Ghi chú

### Request Example

```bash
curl -X POST "http://localhost:3000/api/admin/warehouses/transfers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "from_warehouse_id": 1,
    "to_warehouse_id": 2,
    "product_variant_id": 1,
    "quantity": 20,
    "notes": "Chuyển hàng tồn kho dư từ kho chính sang chi nhánh"
  }'
```

### Response

**Success (201):**
```json
{
  "success": true,
  "message": "Tạo phiếu chuyển kho thành công",
  "data": {
    "id": 1,
    "transfer_code": "TF-20250120-001",
    "from_warehouse_id": 1,
    "to_warehouse_id": 2,
    "product_variant_id": 1,
    "quantity": 20,
    "status": "pending",
    "notes": "Chuyển hàng tồn kho dư từ kho chính sang chi nhánh",
    "created_by": 1,
    "created_at": "2025-01-20T11:00:00.000Z",
    "updated_at": "2025-01-20T11:00:00.000Z",
    "from_warehouse": {
      "id": 1,
      "name": "Kho Chính - TP.HCM",
      "code": "WH-HCM-01"
    },
    "to_warehouse": {
      "id": 2,
      "name": "Kho Chi Nhánh - Hà Nội",
      "code": "WH-HN-01"
    },
    "product_variant": {
      "id": 1,
      "sku": "IP15PRO-128GB-BLACK",
      "name": "iPhone 15 Pro - 128GB - Đen"
    }
  }
}
```

---

## 9. Get Stock Transfers (Lấy danh sách phiếu chuyển kho)

Lấy danh sách các phiếu chuyển kho.

### Endpoint
```
GET /api/admin/warehouses/transfers/list
```

### Query Parameters
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| page | number | Không | Số trang (mặc định: 1) |
| limit | number | Không | Số lượng mỗi trang (mặc định: 10) |
| status | string | Không | Lọc theo trạng thái |
| warehouse_id | number | Không | Lọc theo kho |

### Request Example

```bash
curl -X GET "http://localhost:3000/api/admin/warehouses/transfers/list?page=1&limit=10" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Lấy danh sách phiếu chuyển kho thành công",
  "data": [
    {
      "id": 1,
      "transfer_code": "TF-20250120-001",
      "from_warehouse_id": 1,
      "to_warehouse_id": 2,
      "product_variant_id": 1,
      "quantity": 20,
      "status": "pending",
      "notes": "Chuyển hàng tồn kho dư từ kho chính sang chi nhánh",
      "created_at": "2025-01-20T11:00:00.000Z",
      "updated_at": "2025-01-20T11:00:00.000Z",
      "from_warehouse": {
        "id": 1,
        "name": "Kho Chính - TP.HCM",
        "code": "WH-HCM-01"
      },
      "to_warehouse": {
        "id": 2,
        "name": "Kho Chi Nhánh - Hà Nội",
        "code": "WH-HN-01"
      },
      "product_variant": {
        "id": 1,
        "sku": "IP15PRO-128GB-BLACK",
        "name": "iPhone 15 Pro - 128GB - Đen"
      }
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

## 10. Approve Stock Transfer (Duyệt phiếu chuyển kho)

Duyệt một phiếu chuyển kho.

### Endpoint
```
PUT /api/admin/warehouses/transfers/:id/approve
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của phiếu chuyển kho |

### Request Example

```bash
curl -X PUT "http://localhost:3000/api/admin/warehouses/transfers/1/approve" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Duyệt phiếu chuyển kho thành công",
  "data": {
    "id": 1,
    "transfer_code": "TF-20250120-001",
    "status": "approved",
    "approved_by": 1,
    "approved_at": "2025-01-20T12:00:00.000Z",
    "updated_at": "2025-01-20T12:00:00.000Z"
  }
}
```

---

## 11. Complete Stock Transfer (Hoàn thành phiếu chuyển kho)

Hoàn thành một phiếu chuyển kho (đã nhận hàng).

### Endpoint
```
PUT /api/admin/warehouses/transfers/:id/complete
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của phiếu chuyển kho |

### Request Example

```bash
curl -X PUT "http://localhost:3000/api/admin/warehouses/transfers/1/complete" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Hoàn thành phiếu chuyển kho thành công",
  "data": {
    "id": 1,
    "transfer_code": "TF-20250120-001",
    "status": "completed",
    "completed_by": 2,
    "completed_at": "2025-01-20T14:00:00.000Z",
    "updated_at": "2025-01-20T14:00:00.000Z"
  }
}
```

---

## 12. Cancel Stock Transfer (Hủy phiếu chuyển kho)

Hủy một phiếu chuyển kho.

### Endpoint
```
PUT /api/admin/warehouses/transfers/:id/cancel
```

### Path Parameters
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| id | number | ID của phiếu chuyển kho |

### Request Example

```bash
curl -X PUT "http://localhost:3000/api/admin/warehouses/transfers/1/cancel" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Hủy phiếu chuyển kho thành công",
  "data": {
    "id": 1,
    "transfer_code": "TF-20250120-001",
    "status": "cancelled",
    "cancelled_by": 1,
    "cancelled_at": "2025-01-20T15:00:00.000Z",
    "updated_at": "2025-01-20T15:00:00.000Z"
  }
}
```

---

## Warehouse Status

| Status | Description |
|--------|-------------|
| `active` | Đang hoạt động |
| `inactive` | Không hoạt động |
| `maintenance` | Đang bảo trì |

---

## Stock Transfer Status

| Status | Description |
|--------|-------------|
| `pending` | Chờ duyệt |
| `approved` | Đã duyệt |
| `in_transit` | Đang vận chuyển |
| `completed` | Đã hoàn thành |
| `cancelled` | Đã hủy |

---

## Use Cases

### Use Case 1: Quản lý kho hàng

```bash
# 1. Tạo kho mới
POST /api/admin/warehouses
{
  "name": "Kho Đà Nẵng",
  "code": "WH-DN-01",
  "address": "789 Lê Duẩn, Quận Hải Châu",
  "city": "Đà Nẵng",
  "state": "Đà Nẵng",
  "country": "Việt Nam",
  "is_primary": false,
  "status": "active"
}

# 2. Xem danh sách kho
GET /api/admin/warehouses

# 3. Xem tồn kho kho chính
GET /api/admin/warehouses/1/inventory

# 4. Kiểm tra hàng tồn kho thấp
GET /api/admin/warehouses/1/inventory?low_stock=true
```

### Use Case 2: Quản lý tồn kho

```bash
# 1. Cập nhật tồn kho sau khi nhập hàng
PUT /api/admin/warehouses/inventory/update
{
  "warehouse_id": 1,
  "product_variant_id": 1,
  "quantity": 100,
  "reason": "Nhập hàng mới từ Apple"
}

# 2. Kiểm tra lại tồn kho
GET /api/admin/warehouses/1/inventory?search=IP15PRO

# 3. Cập nhật mức tồn kho tối thiểu
PUT /api/admin/warehouses/inventory/update
{
  "warehouse_id": 1,
  "product_variant_id": 1,
  "min_stock_level": 15,
  "max_stock_level": 150
}
```

### Use Case 3: Chuyển kho giữa các chi nhánh

```bash
# 1. Tạo phiếu chuyển kho
POST /api/admin/warehouses/transfers
{
  "from_warehouse_id": 1,
  "to_warehouse_id": 2,
  "product_variant_id": 1,
  "quantity": 20,
  "notes": "Chuyển hàng tồn kho dư"
}

# 2. Quản lý duyệt phiếu
GET /api/admin/warehouses/transfers/list?status=pending

# 3. Duyệt phiếu chuyển kho
PUT /api/admin/warehouses/transfers/1/approve

# 4. Xác nhận đã nhận hàng
PUT /api/admin/warehouses/transfers/1/complete

# 5. Kiểm tra lại tồn kho cả hai kho
GET /api/admin/warehouses/1/inventory
GET /api/admin/warehouses/2/inventory
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
| 404 | Not Found - Warehouse not found |
| 409 | Conflict - Duplicate warehouse code |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error |

---

**Xem thêm:**
- [Admin Product Variant API](./product-variant.md)
- [Admin Product API](./product.md)
- [Admin Order API](./order.md)