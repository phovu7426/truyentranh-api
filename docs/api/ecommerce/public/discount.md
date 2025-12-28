# Discount API Documentation

## Overview

This document describes the public API endpoints for managing discounts and coupons in the e-commerce system.

## Base URL

```
/api/public/discounts
```

## Authentication

Most endpoints require JWT authentication. Some endpoints are publicly accessible.

## Response Format

All responses follow the standard format:

```json
{
  "success": true,
  "message": "Success message",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": {},
  "meta": {},
  "timestamp": "2025-11-21T10:03:10+07:00"
}
```

## Architecture Notes

The discount system follows a clean architecture pattern:
- **DiscountService**: Handles coupon validation and discount calculation only
- **CartService**: Manages cart data and applies discounts to the cart
- **Controller**: Coordinates between services to provide complete functionality

## Endpoints

### 1. Get Available Coupons

Get list of available coupons for the current user.

**Endpoint:** `GET /coupons/available`

**Authentication:** Optional (JWT token for user-specific coupons)

**Query Parameters:** None

**Response:**

```json
{
  "success": true,
  "message": "Lấy danh sách mã giảm giá thành công",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": [
    {
      "id": "1",
      "code": "WELCOME10",
      "name": "Welcome Discount",
      "description": "10% discount for new customers",
      "discount_type": "percentage",
      "discount_value": 10,
      "minimum_order_amount": 0,
      "maximum_discount_amount": null,
      "usage_limit": 100,
      "usage_count": 0,
      "start_date": "2025-11-20T19:50:13.000Z",
      "end_date": "2026-02-20T19:50:13.000Z",
      "is_active": true,
      "applicable_for": "all",
      "user_usage_count": 0,
      "can_use": true
    }
  ],
  "meta": {},
  "timestamp": "2025-11-21T10:03:10+07:00"
}
```

### 2. Apply Coupon

Apply a coupon code to the user's cart.

**Endpoint:** `POST /apply-coupon`

**Authentication:** Required (JWT token)

**Request Body:**

```json
{
  "cart_uuid": "9cbb946c-a0c0-44c0-be29-1572a69cec67",
  "coupon_code": "SAVE20"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Áp dụng mã giảm giá thành công",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": {
    "cart_uuid": "9cbb946c-a0c0-44c0-be29-1572a69cec67",
    "subtotal": 2902521,
    "discount_amount": 580504.2,
    "shipping_amount": 0,
    "tax_amount": 0,
    "total_amount": 2322016.8,
    "applied_coupon": {
      "id": "2",
      "code": "SAVE20",
      "name": "Save 20%",
      "discount_type": "percentage",
      "discount_value": 20,
      "discount_amount": 580504.2
    },
    "items": [
      {
        "id": "1",
        "product_name": "Xiaomi Redmi Buds 4",
        "quantity": 1,
        "unit_price": 2902521,
        "total_price": 2902521
      }
    ]
  },
  "meta": {},
  "timestamp": "2025-11-21T11:25:33+07:00"
}
```

**Important Notes:**
- The discount amount is now properly calculated and saved to the database
- The cart total is updated to reflect the discount
- Only one coupon can be applied per cart

### 3. Remove Coupon

Remove the applied coupon from the user's cart.

**Endpoint:** `DELETE /remove-coupon`

**Authentication:** Required (JWT token)

**Query Parameters:**
- `cart_uuid` (string): The UUID of the cart

**Response:**

```json
{
  "success": true,
  "message": "Xóa mã giảm giá thành công",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": {
    "cart_uuid": "9cbb946c-a0c0-44c0-be29-1572a69cec67",
    "subtotal": 2902521,
    "discount_amount": 0,
    "shipping_amount": 0,
    "tax_amount": 0,
    "total_amount": 2902521,
    "items": [
      {
        "id": "1",
        "product_name": "Xiaomi Redmi Buds 4",
        "quantity": 1,
        "unit_price": 2902521,
        "total_price": 2902521
      }
    ]
  },
  "meta": {},
  "timestamp": "2025-11-21T11:25:33+07:00"
}
```

**Important Notes:**
- The discount amount is reset to 0 in the database
- The cart total is recalculated without the discount

### 4. Validate Coupon

Validate a coupon code without applying it to the cart.

**Endpoint:** `POST /validate-coupon`

**Authentication:** Optional (JWT token for user-specific validation)

**Request Body:**

```json
{
  "coupon_code": "SAVE20",
  "cart_total": 2902521
}
```

**Response:**

```json
{
  "success": true,
  "message": "Mã giảm giá hợp lệ",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": {
    "id": "2",
    "code": "SAVE20",
    "name": "Save 20%",
    "description": "20% discount on orders above $50",
    "discount_type": "percentage",
    "discount_value": 20,
    "minimum_order_amount": 50,
    "maximum_discount_amount": null,
    "is_valid": true,
    "estimated_discount": 580504.2,
    "final_amount": 2322016.8,
    "user_usage_count": 0,
    "remaining_usage": 50
  },
  "meta": {},
  "timestamp": "2025-11-21T10:03:10+07:00"
}
```

## Error Responses

### Invalid Coupon

```json
{
  "success": false,
  "message": "Invalid coupon code",
  "code": "INVALID_COUPON",
  "httpStatus": 400,
  "data": null,
  "meta": {},
  "timestamp": "2025-11-21T10:03:10+07:00"
}
```

### Coupon Expired

```json
{
  "success": false,
  "message": "Coupon has expired",
  "code": "COUPON_EXPIRED",
  "httpStatus": 400,
  "data": null,
  "meta": {},
  "timestamp": "2025-11-21T10:03:10+07:00"
}
```

### Usage Limit Reached

```json
{
  "success": false,
  "message": "Coupon usage limit reached",
  "code": "USAGE_LIMIT_REACHED",
  "httpStatus": 400,
  "data": null,
  "meta": {},
  "timestamp": "2025-11-21T10:03:10+07:00"
}
```

### Minimum Order Not Met

```json
{
  "success": false,
  "message": "Minimum order value is 50",
  "code": "MINIMUM_ORDER_NOT_MET",
  "httpStatus": 400,
  "data": null,
  "meta": {},
  "timestamp": "2025-11-21T10:03:10+07:00"
}
```

## Notes

- Only one coupon can be applied to a cart at a time
- Coupons are validated against the cart subtotal
- Free shipping coupons only affect shipping costs
- Percentage coupons are calculated on the cart subtotal
- Fixed amount coupons have a maximum discount equal to the cart subtotal
- **NEW**: Discount amounts are now properly saved to the database and reflected in cart totals
- **IMPORTANT**: All cart operations now use `cart_uuid` instead of `session_id` for better consistency and cross-device support