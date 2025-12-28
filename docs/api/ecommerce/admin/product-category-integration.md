# Hướng dẫn tích hợp danh mục sản phẩm cho Admin

## 1. Tổng quan hệ thống

Hệ thống đã có sẵn module quản lý danh mục sản phẩm cho admin với đầy đủ chức năng CRUD. Việc tích hợp danh mục vào sản phẩm được thực hiện thông qua bảng trung gian `ProductProductCategory`.

## 2. Cấu trúc module

```
src/modules/ecommerce/admin/product-category/
├── product-category.module.ts
├── controllers/
│   └── product-category.controller.ts
├── services/
│   └── product-category.service.ts
└── dtos/
    ├── create-product-category.dto.ts
    ├── update-product-category.dto.ts
    └── get-product-categories.dto.ts
```

## 3. Các trường trong danh mục sản phẩm

### Trường bắt buộc:
| Tên trường | Kiểu dữ liệu | Mô tả | Validation |
|------------|--------------|--------|------------|
| `name` | string | Tên danh mục | Required, 1-255 ký tự |
| `slug` | string | Đường dẫn thân thiện | Required, unique, chỉ chứa chữ thường, số và dấu gạch ngang |

### Trường tùy chọn:
| Tên trường | Kiểu dữ liệu | Mô tả | Giá trị mặc định |
|------------|--------------|--------|-------------------|
| `description` | string | Mô tả danh mục | null |
| `parent_id` | number | ID của danh mục cha | null |
| `image` | string | URL hình ảnh danh mục | null |
| `icon` | string | Icon danh mục | null |
| `sort_order` | number | Thứ tự sắp xếp | 0 |
| `meta_title` | string | Meta title cho SEO | null |
| `meta_description` | string | Meta description cho SEO | null |
| `canonical_url` | string | Canonical URL cho SEO | null |
| `og_image` | string | Open Graph image cho SEO | null |
| `status` | enum | Trạng thái | 'active' |

## 4. API endpoints cho danh mục sản phẩm

### Base URL: `/admin/product-categories`

| Method | Endpoint | Permission | Mô tả | Response |
|--------|----------|------------|--------|----------|
| **GET** | `/` | `product-category:read` | Lấy danh sách danh mục | `{ data: ProductCategory[], meta: PaginationMeta }` |
| **GET** | `/tree` | `product-category:read` | Lấy cây danh mục | `ProductCategory[]` |
| **GET** | `/root` | `product-category:read` | Lấy danh mục gốc | `ProductCategory[]` |
| **GET** | `/:id/children` | `product-category:read` | Lấy danh mục con | `ProductCategory[]` |
| **GET** | `/:id` | `product-category:read` | Lấy chi tiết danh mục | `ProductCategory` |
| **POST** | `/` | `product-category:create` | Tạo danh mục mới | `ProductCategory` |
| **PUT** | `/:id` | `product-category:update` | Cập nhật danh mục | `ProductCategory` |
| **PUT** | `/:id/restore` | `product-category:update` | Khôi phục danh mục đã xóa | `{ restored: boolean }` |
| **DELETE** | `/:id` | `product-category:delete` | Xóa danh mục | `{ deleted: boolean }` |

## 5. Tích hợp danh mục vào sản phẩm

### 5.1 Trong Create Product DTO
```typescript
// src/modules/ecommerce/admin/product/dtos/create-product.dto.ts
@IsOptional()
@IsString()
category_id?: string; // ID của danh mục chính
```

### 5.2 Trong Product Service
```typescript
// src/modules/ecommerce/admin/product/services/product.service.ts
export class AdminProductService extends CrudService<Product> {
  // Biến tạm để lưu trữ category_id
  private tempCategoryId: string = '';

  protected async beforeCreate(entity: Product, createDto: any): Promise<boolean> {
    // Xử lý category_id nếu có
    if (createDto.category_id) {
      this.tempCategoryId = createDto.category_id;
      delete createDto.category_id; // Xóa khỏi DTO vì không phải là trường của Product
    }
    return true;
  }

  protected async afterCreate(entity: Product, createDto: any): Promise<void> {
    // Xử lý category_id sau khi tạo entity
    if (this.tempCategoryId) {
      const categoryRelation = {
        product_id: entity.id,
        product_category_id: parseInt(this.tempCategoryId, 10),
      };
      await this.productProductCategoryRepository.save(categoryRelation);
      this.tempCategoryId = '';
    }
  }

  protected async beforeUpdate(entity: Product, updateDto: any): Promise<boolean> {
    // Xử lý category_id khi cập nhật
    if (updateDto.category_id) {
      // Xóa tất cả các category hiện tại
      await this.productProductCategoryRepository.delete({ product_id: entity.id });
      
      // Thêm category mới
      const categoryRelation = {
        product_id: entity.id,
        product_category_id: parseInt(updateDto.category_id, 10),
      };
      await this.productProductCategoryRepository.save(categoryRelation);
      
      delete updateDto.category_id;
    }
    return true;
  }
}
```

## 6. Dữ liệu lấy từ đâu

### 6.1 Danh mục sản phẩm:
| Trường | Nguồn dữ liệu | Ghi chú |
|--------|---------------|---------|
| `name` | Form input | Nhập từ form admin |
| `slug` | Auto-generate/Tự nhập | Tự động tạo từ name nếu không nhập |
| `parent_id` | Dropdown select | Chọn từ danh sách danh mục cha |
| `status` | Radio/Select | Chọn từ dropdown ('active'/'inactive') |
| `image` | File upload | Upload qua media manager |
| `description` | Textarea | Nhập từ form |
| `SEO fields` | SEO section | Nhập từ form SEO section |

### 6.2 Sản phẩm - Danh mục:
| Trường | Nguồn dữ liệu | Ghi chú |
|--------|---------------|---------|
| `category_id` | Dropdown select | Chọn từ dropdown danh mục trong form sản phẩm |

## 7. Cấu trúc database

### 7.1 Bảng product_categories
```sql
CREATE TABLE product_categories (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  parent_id BIGINT,
  image VARCHAR(500),
  icon VARCHAR(100),
  status ENUM('active', 'inactive') DEFAULT 'active',
  sort_order INT DEFAULT 0,
  meta_title VARCHAR(255),
  meta_description TEXT,
  canonical_url VARCHAR(500),
  og_image VARCHAR(500),
  created_user_id BIGINT,
  updated_user_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  
  INDEX idx_product_categories_name (name),
  INDEX idx_product_categories_slug (slug),
  INDEX idx_product_categories_parent_id (parent_id),
  INDEX idx_product_categories_status (status),
  FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL
);
```

### 7.2 Bảng trung gian product_category
```sql
CREATE TABLE product_category (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  product_category_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY uk_ppc_product_category (product_id, product_category_id),
  INDEX idx_ppc_product_id (product_id),
  INDEX idx_ppc_category_id (product_category_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (product_category_id) REFERENCES product_categories(id) ON DELETE CASCADE
);
```

## 8. Validation rules

### 8.1 Danh mục sản phẩm:
| Trường | Validation | Message lỗi |
|--------|------------|---------------|
| `name` | Required, 1-255 chars | "Tên danh mục là bắt buộc" |
| `slug` | Required, unique, regex: `^[a-z0-9-]+$` | "Slug chỉ được chứa chữ thường, số và dấu gạch ngang" |
| `parent_id` | Phải tồn tại trong DB | "Danh mục cha không tồn tại" |
| `status` | Chỉ nhận 'active'/'inactive' | "Trạng thái không hợp lệ" |

### 8.2 Sản phẩm - Danh mục:
| Trường | Validation | Message lỗi |
|--------|------------|---------------|
| `category_id` | Phải tồn tại trong DB | "Danh mục không tồn tại" |

## 9. Best practices

### 9.1 Tự động hóa:
- **Slug tự động**: Nếu không nhập slug, hệ thống tự động tạo từ name
- **Audit trail**: Tự động ghi nhận người tạo/cập nhật
- **Soft delete**: Hỗ trợ khôi phục danh mục đã xóa

### 9.2 Performance:
- **Indexing**: Có đầy đủ index cho các trường thường query
- **Caching**: Danh mục được cache để tối ưu performance
- **Pagination**: Hỗ trợ phân trang cho danh sách

### 9.3 SEO optimization:
- **Meta fields**: Đầy đủ các trường SEO meta
- **Canonical URL**: Hỗ trợ canonical URL
- **Open Graph**: Hỗ trợ OG tags

### 9.4 Tree structure:
- **Unlimited levels**: Hỗ trợ danh mục phân cấp không giới hạn cấp độ
- **Parent-child relations**: Quan hệ cha-con rõ ràng
- **Tree traversal**: Có sẵn methods để duyệt cây danh mục

## 10. Ví dụ API calls

### 10.1 Tạo danh mục mới:
```bash
POST /admin/product-categories
Headers: Authorization: Bearer <token>
Body: {
  "name": "Điện thoại",
  "slug": "dien-thoai",
  "description": "Danh mục điện thoại thông minh",
  "parent_id": null,
  "sort_order": 1,
  "status": "active"
}
```

### 10.2 Lấy cây danh mục:
```bash
GET /admin/product-categories/tree
Headers: Authorization: Bearer <token>
```

### 10.3 Tạo sản phẩm với danh mục:
```bash
POST /admin/products
Headers: Authorization: Bearer <token>
Body: {
  "name": "iPhone 15 Pro",
  "sku": "IPHONE15PRO",
  "category_id": "1",
  "status": "active",
  "price": 25000000
}
```

## 11. Lưu ý quan trọng

1. **Module đã hoàn thiện**: Không cần phát triển thêm, đã sẵn sàng sử dụng
2. **Permission required**: Cần cấp quyền phù hợp cho từng endpoint
3. **Validation strict**: Tất cả dữ liệu đầu vào đều được validate kỹ lưỡng
4. **Audit trail**: Tự động ghi nhận người thực hiện các thao tác
5. **Soft delete**: Có thể khôi phục danh mục đã xóa

Module admin danh mục sản phẩm đã được xây dựng hoàn chỉnh với đầy đủ các tính năng cần thiết cho việc quản lý danh mục và tích hợp với sản phẩm.