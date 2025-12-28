# Product-Related Entity APIs for Admin Interface

## Overview
This document details the APIs for managing entities related to products in the admin interface. These APIs are essential for creating and managing product variants, attributes, categories, shipping methods, warehouses, and coupons.

---

## Product Categories

### 1. GET /admin/product-categories
Retrieve a list of product categories with filtering and pagination.

#### Query Parameters
| Parameter | Type | Description | Example |
|----------|------|-------------|---------|
| `search` | string | Search across name and slug | `search=electronics` |
| `status` | string | Filter by status: `active`, `inactive` | `status=active` |
| `parent_id` | number | Filter by parent category ID | `parent_id=5` |
| `include_children` | boolean | Include child categories in response | `include_children=true` |
| `tree` | boolean | Return hierarchical tree structure | `tree=true` |
| `page` | number | Page number (default: 1) | `page=2` |
| `limit` | number | Items per page (default: 10, max: 100) | `limit=20` |

#### Response Structure
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Electronics",
      "slug": "electronics",
      "description": "Electronic devices and gadgets",
      "parent_id": null,
      "image": "https://example.com/images/electronics.jpg",
      "icon": "icon-electronics",
      "status": "active",
      "sort_order": 1,
      "meta_title": "Electronics - Shop Now",
      "meta_description": "Best electronics at competitive prices",
      "canonical_url": "https://example.com/categories/electronics",
      "og_image": "https://example.com/images/electronics-og.jpg",
      "created_at": "2025-11-20T10:00:00Z",
      "updated_at": "2025-11-24T15:30:00Z"
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

### 2. GET /admin/product-categories/tree
Retrieve the complete category hierarchy as a nested tree structure.

#### Response Structure
```json
{
  "success": true,
  "message": "Category tree retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Electronics",
      "slug": "electronics",
      "children": [
        {
          "id": 2,
          "name": "Smartphones",
          "slug": "smartphones",
          "children": [
            {
              "id": 3,
              "name": "iPhone",
              "slug": "iphone",
              "children": []
            }
          ]
        }
      ]
    }
  ]
}
```

### 3. GET /admin/product-categories/root
Retrieve only top-level (parentless) categories.

#### Response Structure
Same as `GET /admin/product-categories` but only returns categories with `parent_id: null`.

### 4. GET /admin/product-categories/:id/children
Retrieve all direct children of a specific category.

#### Path Parameters
| Parameter | Type | Description |
|----------|------|-------------|
| `id` | number | Parent category ID |

#### Response Structure
Same as `GET /admin/product-categories` but filtered to children of the specified ID.

---

## Product Attributes

### 1. GET /admin/product-attributes
Retrieve a list of product attributes with filtering.

#### Query Parameters
| Parameter | Type | Description | Example |
|----------|------|-------------|---------|
| `search` | string | Search across name and slug | `search=color` |
| `type` | string | Filter by type: `text`, `select`, `multiselect`, `color`, `image` | `type=select` |
| `is_required` | boolean | Filter by required status | `is_required=true` |
| `is_variation` | boolean | Filter by variation status | `is_variation=true` |
| `is_filterable` | boolean | Filter by filterable status | `is_filterable=true` |
| `status` | string | Filter by status: `active`, `inactive` | `status=active` |
| `page` | number | Page number (default: 1) | `page=2` |
| `limit` | number | Items per page (default: 10, max: 100) | `limit=20` |

### 2. GET /admin/product-attributes/with-values
Retrieve all attributes with their associated values (for dropdowns).

#### Response Structure
```json
{
  "success": true,
  "message": "Attributes with values retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Color",
      "slug": "color",
      "type": "select",
      "is_required": true,
      "is_variation": true,
      "is_filterable": true,
      "status": "active",
      "values": [
        {
          "id": 10,
          "value": "Red",
          "color_code": "#FF0000",
          "image": null,
          "sort_order": 1,
          "status": "active"
        },
        {
          "id": 11,
          "value": "Blue",
          "color_code": "#0000FF",
          "image": null,
          "sort_order": 2,
          "status": "active"
        }
      ]
    }
  ]
}
```

### 3. GET /admin/product-attributes/code/:code
Retrieve a specific attribute by its code (slug).

#### Path Parameters
| Parameter | Type | Description |
|----------|------|-------------|
| `code` | string | Attribute slug |

#### Response Structure
Same as individual attribute object from `GET /admin/product-attributes`.

---

## Product Attribute Values

### 1. GET /admin/product-attribute-values
Retrieve a list of attribute values with filtering.

#### Query Parameters
| Parameter | Type | Description | Example |
|----------|------|-------------|---------|
| `attribute_id` | number | Filter by attribute ID | `attribute_id=1` |
| `search` | string | Search across value | `search=red` |
| `status` | string | Filter by status: `active`, `inactive` | `status=active` |
| `page` | number | Page number (default: 1) | `page=2` |
| `limit` | number | Items per page (default: 10, max: 100) | `limit=20` |

### 2. GET /admin/product-attribute-values/attribute/:attributeId
Retrieve all values for a specific attribute.

#### Path Parameters
| Parameter | Type | Description |
|----------|------|-------------|
| `attributeId` | number | Product attribute ID |

#### Response Structure
```json
{
  "success": true,
  "message": "Attribute values retrieved successfully",
  "data": [
    {
      "id": 10,
      "value": "Red",
      "color_code": "#FF0000",
      "image": null,
      "sort_order": 1,
      "status": "active"
    },
    {
      "id": 11,
      "value": "Blue",
      "color_code": "#0000FF",
      "image": null,
      "sort_order": 2,
      "status": "active"
    }
  ]
}
```

---

## Product Variants

### 1. GET /admin/product-variants
Retrieve a list of product variants with filtering.

#### Query Parameters
| Parameter | Type | Description | Example |
|----------|------|-------------|---------|
| `product_id` | number | Filter by product ID | `product_id=5` |
| `search` | string | Search across name and SKU | `search=iphone` |
| `sku` | string | Filter by exact SKU | `sku=IP15-128-BLK` |
| `status` | string | Filter by status: `active`, `inactive` | `status=active` |
| `include_product` | boolean | Include product details | `include_product=true` |
| `page` | number | Page number (default: 1) | `page=2` |
| `limit` | number | Items per page (default: 10, max: 100) | `limit=20` |

### 2. GET /admin/product-variants/product/:productId
Retrieve all variants for a specific product.

#### Path Parameters
| Parameter | Type | Description |
|----------|------|-------------|
| `productId` | number | Product ID |

#### Response Structure
```json
{
  "success": true,
  "message": "Product variants retrieved successfully",
  "data": [
    {
      "id": 10,
      "product_id": 5,
      "sku": "IP15-128-BLK",
      "name": "iPhone 15 - 128GB - Black",
      "price": "1299.00",
      "sale_price": "1199.00",
      "cost_price": "800.00",
      "stock_quantity": 50,
      "weight": "0.2",
      "image": "https://example.com/images/iphone15-black.jpg",
      "status": "active",
      "created_at": "2025-11-20T10:00:00Z",
      "updated_at": "2025-11-24T15:30:00Z",
      "attributes": [
        {
          "id": 20,
          "product_attribute_id": 1,
          "product_attribute_value_id": 10,
          "value": "Red"
        }
      ]
    }
  ]
}
```

### 3. POST /admin/product-variants/search
Search variants by product and attribute combinations.

#### Request Body
```json
{
  "product_id": 5,
  "attributes": [
    {
      "attribute_id": 1,
      "value_id": 10
    },
    {
      "attribute_id": 2,
      "value_id": 15
    }
  ]
}
```

#### Response Structure
Same as `GET /admin/product-variants/product/:productId` but filtered by attribute combinations.

---

## Shipping Methods

### 1. GET /admin/shipping-methods
Retrieve a list of shipping methods with filtering.

#### Query Parameters
| Parameter | Type | Description | Example |
|----------|------|-------------|---------|
| `search` | string | Search across name and code | `search=express` |
| `status` | string | Filter by status: `active`, `inactive` | `status=active` |
| `page` | number | Page number (default: 1) | `page=2` |
| `limit` | number | Items per page (default: 10, max: 100) | `limit=20` |

### 2. GET /admin/shipping-methods/active
Retrieve only active shipping methods (for checkout).

#### Response Structure
```json
{
  "success": true,
  "message": "Active shipping methods retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Standard Shipping",
      "code": "standard",
      "description": "Delivery in 3-5 business days",
      "base_cost": "5.00",
      "estimated_days": 5,
      "status": "active",
      "created_at": "2025-11-20T10:00:00Z",
      "updated_at": "2025-11-24T15:30:00Z"
    }
  ]
}
```

### 3. GET /admin/shipping-methods/code/:code
Retrieve a specific shipping method by its code.

#### Path Parameters
| Parameter | Type | Description |
|----------|------|-------------|
| `code` | string | Shipping method code |

#### Response Structure
Same as individual shipping method object from `GET /admin/shipping-methods`.

---

## Warehouses

### 1. GET /admin/warehouses
Retrieve a list of warehouses with filtering.

#### Query Parameters
| Parameter | Type | Description | Example |
|----------|------|-------------|---------|
| `search` | string | Search across name and code | `search=warehouse` |
| `is_active` | boolean | Filter by active status | `is_active=true` |
| `page` | number | Page number (default: 1) | `page=2` |
| `limit` | number | Items per page (default: 10, max: 100) | `limit=20` |

### 2. GET /admin/warehouses/:id/inventory
Retrieve inventory levels for a specific warehouse.

#### Path Parameters
| Parameter | Type | Description |
|----------|------|-------------|
| `id` | number | Warehouse ID |

#### Query Parameters
| Parameter | Type | Description | Example |
|----------|------|-------------|---------|
| `low_stock` | boolean | Include only low stock items | `low_stock=true` |

#### Response Structure
```json
{
  "success": true,
  "message": "Warehouse inventory retrieved successfully",
  "data": [
    {
      "product_variant_id": 10,
      "product_variant_name": "iPhone 15 - 128GB - Black",
      "sku": "IP15-128-BLK",
      "stock_quantity": 50,
      "min_stock_level": 10,
      "is_low_stock": false
    }
  ]
}
```

---

## Coupons

### 1. GET /admin/coupons
Retrieve a list of coupons with filtering.

#### Query Parameters
| Parameter | Type | Description | Example |
|----------|------|-------------|---------|
| `search` | string | Search across code and name | `search=SUMMER25` |
| `status` | string | Filter by status: `active`, `inactive`, `expired` | `status=active` |
| `type` | string | Filter by type: `percentage`, `fixed_amount`, `free_shipping` | `type=percentage` |
| `page` | number | Page number (default: 1) | `page=2` |
| `limit` | number | Items per page (default: 10, max: 100) | `limit=20` |

### 2. GET /admin/coupons/:id/stats
Retrieve usage statistics for a specific coupon.

#### Path Parameters
| Parameter | Type | Description |
|----------|------|-------------|
| `id` | number | Coupon ID |

#### Response Structure
```json
{
  "success": true,
  "message": "Coupon statistics retrieved successfully",
  "data": {
    "total_used": 150,
    "used_per_customer": 2,
    "remaining_uses": 50,
    "total_revenue_generated": "12500.00",
    "customers_who_used": 75
  }
}