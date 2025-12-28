# Product Admin API Documentation

## Overview
This document details the API endpoints, request/response structures, and field requirements for managing products in the admin interface.

## Authentication
All endpoints require:
- **JWT Authentication**: Valid access token in `Authorization: Bearer <token>` header
- **RBAC Permissions**: Role-based access control enforced via `@Permission()` decorator

| Endpoint | Required Permission |
|----------|---------------------|
| `GET /admin/products` | `product:read` |
| `POST /admin/products` | `product:create` |
| `PUT /admin/products/:id` | `product:update` |
| `DELETE /admin/products/:id` | `product:delete` |

---

## Endpoints

### 1. GET /admin/products
Retrieve a paginated list of products with filtering and sorting.

#### Query Parameters
| Parameter | Type | Description | Example |
|----------|------|-------------|---------|
| `search` | string | Search across name and SKU | `search=iphone` |
| `status` | string | Filter by status: `active`, `inactive`, `draft` | `status=active` |
| `is_featured` | boolean | Filter featured products | `is_featured=true` |
| `is_variable` | boolean | Filter variable products | `is_variable=false` |
| `is_digital` | boolean | Filter digital products | `is_digital=true` |
| `include_deleted` | boolean | Include soft-deleted products | `include_deleted=true` |
| `include_categories` | boolean | Include category relationships | `include_categories=true` |
| `include_variants` | boolean | Include variant relationships | `include_variants=true` |
| `category_id` | string | Filter by category ID | `category_id=5` |
| `page` | number | Page number (default: 1) | `page=2` |
| `limit` | number | Items per page (default: 10, max: 100) | `limit=20` |
| `sort` | string | Sort field (e.g., `name`, `created_at`) | `sort=created_at` |
| `order` | string | Sort order: `ASC` or `DESC` | `order=DESC` |

#### Response Structure
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "iPhone 15",
      "slug": "iphone-15",
      "sku": "IP15-001",
      "description": "Latest iPhone model",
      "short_description": "Powerful and sleek",
      "min_stock_level": 10,
      "image": "https://example.com/images/iphone15.jpg",
      "gallery": ["https://example.com/images/iphone15-1.jpg", "https://example.com/images/iphone15-2.jpg"],
      "status": "active",
      "is_featured": true,
      "is_variable": true,
      "is_digital": false,
      "download_limit": null,
      "meta_title": "iPhone 15 - Apple",
      "meta_description": "Buy iPhone 15 with best price",
      "canonical_url": "https://example.com/products/iphone-15",
      "og_title": "iPhone 15 - Apple",
      "og_description": "Latest iPhone model",
      "og_image": "https://example.com/images/iphone15-og.jpg",
      "created_at": "2025-11-20T10:00:00Z",
      "updated_at": "2025-11-24T15:30:00Z",
      "categories": [
        {
          "id": 3,
          "name": "Smartphones",
          "slug": "smartphones"
        }
      ],
      "variants": [
        {
          "id": 10,
          "name": "128GB - Black",
          "sku": "IP15-128-BLK"
        }
      ]
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "pages": 15
  }
}
```

---

### 2. GET /admin/products/:id
Retrieve a single product by ID.

#### Path Parameters
| Parameter | Type | Description |
|----------|------|-------------|
| `id` | number | Product ID |

#### Response Structure
Same as individual product object in `GET /admin/products` response.

---

### 3. POST /admin/products
Create a new product.

#### Request Body (JSON)
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `name` | string | ✅ Yes | `IsString(), IsNotEmpty(), Length(3,255), Matches(...)` | Product name (Vietnamese characters allowed) |
| `sku` | string | ✅ Yes | `IsString(), IsNotEmpty(), Length(3,100), Matches(...)` | Unique SKU (uppercase letters, numbers, hyphens, underscores) |
| `slug` | string | ❌ No | `IsString(), Length(3,255), Matches(/^[a-z0-9-]+$/)` | URL-friendly slug (lowercase, hyphens only) |
| `description` | string | ❌ No | `IsString(), Length(0,10000)` | Full product description |
| `short_description` | string | ❌ No | `IsString(), Length(0,500)` | Brief summary (e.g., for listings) |
| `min_stock_level` | number | ❌ No | `IsInt(), Min(0), Max(9999)` | Minimum stock threshold |
| `image` | string | ❌ No | `IsUrl(), Length(0,500)` | Main product image URL |
| `gallery` | array | ❌ No | `IsObject()` | Array of image URLs for gallery |
| `is_featured` | boolean | ❌ No | `IsBoolean()` | Display as featured product (default: false) |
| `is_variable` | boolean | ❌ No | `IsBoolean()` | Product has variants (default: true) |
| `is_digital` | boolean | ❌ No | `IsBoolean()` | Digital product (no shipping) (default: false) |
| `download_limit` | number | ❌ No | `IsInt(), Min(0), Max(1000)` | Max downloads for digital products |
| `meta_title` | string | ❌ No | `IsString(), Length(0,255)` | SEO meta title |
| `meta_description` | string | ❌ No | `IsString(), Length(0,500)` | SEO meta description |
| `canonical_url` | string | ❌ No | `IsUrl(), Length(0,500)` | Canonical URL for SEO |
| `og_title` | string | ❌ No | `IsString(), Length(0,255)` | Open Graph title |
| `og_description` | string | ❌ No | `IsString(), Length(0,500)` | Open Graph description |
| `og_image` | string | ❌ No | `IsUrl(), Length(0,500)` | Open Graph image URL |

#### Example Request
```json
{
  "name": "iPhone 15",
  "sku": "IP15-001",
  "description": "Latest iPhone model with A17 chip",
  "short_description": "Powerful and sleek",
  "min_stock_level": 10,
  "image": "https://example.com/images/iphone15.jpg",
  "gallery": [
    "https://example.com/images/iphone15-1.jpg",
    "https://example.com/images/iphone15-2.jpg"
  ],
  "is_featured": true,
  "is_variable": true,
  "meta_title": "iPhone 15 - Apple",
  "meta_description": "Buy iPhone 15 with best price",
  "canonical_url": "https://example.com/products/iphone-15",
  "og_title": "iPhone 15 - Apple",
  "og_description": "Latest iPhone model",
  "og_image": "https://example.com/images/iphone15-og.jpg"
}
```

#### Response Structure
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 1,
    "name": "iPhone 15",
    "slug": "iphone-15",
    "sku": "IP15-001",
    "description": "Latest iPhone model with A17 chip",
    "short_description": "Powerful and sleek",
    "min_stock_level": 10,
    "image": "https://example.com/images/iphone15.jpg",
    "gallery": [
      "https://example.com/images/iphone15-1.jpg",
      "https://example.com/images/iphone15-2.jpg"
    ],
    "status": "active",
    "is_featured": true,
    "is_variable": true,
    "is_digital": false,
    "download_limit": null,
    "meta_title": "iPhone 15 - Apple",
    "meta_description": "Buy iPhone 15 with best price",
    "canonical_url": "https://example.com/products/iphone-15",
    "og_title": "iPhone 15 - Apple",
    "og_description": "Latest iPhone model",
    "og_image": "https://example.com/images/iphone15-og.jpg",
    "created_at": "2025-11-25T03:53:00Z",
    "updated_at": "2025-11-25T03:53:00Z"
  }
}
```

---

### 4. PUT /admin/products/:id
Update an existing product.

#### Path Parameters
| Parameter | Type | Description |
|----------|------|-------------|
| `id` | number | Product ID |

#### Request Body (JSON)
Same fields as `POST /admin/products`, but **all fields are optional**. Only provided fields will be updated.

#### Example Request
```json
{
  "name": "iPhone 15 Pro",
  "is_featured": false,
  "min_stock_level": 5
}
```

#### Response Structure
Same as `POST /admin/products` response.

---

### 5. DELETE /admin/products/:id
Soft-delete a product (sets `deleted_at`).

#### Path Parameters
| Parameter | Type | Description |
|----------|------|-------------|
| `id` | number | Product ID |

#### Response Structure
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": null
}
```

---

## Error Responses
All endpoints return standard error format:

```json
{
  "success": false,
  "message": "Validation failed: name is required",
  "errors": [
    {
      "field": "name",
      "message": "Product name is required"
    }
  ]
}
```

## Notes
- All timestamps are in ISO 8601 UTC format.
- `gallery` and `variants` are nested objects and require separate API calls to manage.
- `slug` is auto-generated from `name` if not provided.
- `status` defaults to `active` on creation.