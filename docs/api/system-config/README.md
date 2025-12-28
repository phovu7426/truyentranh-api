# System Configuration API

API quản lý cấu hình hệ thống (System Configuration) bao gồm cấu hình chung và cấu hình email.

## Cấu trúc

- Base URL: `http://localhost:3000/api`
- Authentication: 
  - Admin API: JWT Bearer Token (bắt buộc)
  - Public API: Không cần authentication
- Headers: `Content-Type: application/json`

---

## Mục lục

1. [Cấu hình chung (General Config)](#1-cấu-hình-chung-general-config)
   - [1.1. Admin - Lấy cấu hình chung](#11-admin---lấy-cấu-hình-chung)
   - [1.2. Admin - Cập nhật cấu hình chung](#12-admin---cập-nhật-cấu-hình-chung)
   - [1.3. Public - Lấy cấu hình chung (có cache)](#13-public---lấy-cấu-hình-chung-có-cache)
2. [Cấu hình Email](#2-cấu-hình-email)
   - [2.1. Admin - Lấy cấu hình email](#21-admin---lấy-cấu-hình-email)
   - [2.2. Admin - Cập nhật cấu hình email](#22-admin---cập-nhật-cấu-hình-email)

---

## 1. Cấu hình chung (General Config)

### 1.1. Admin - Lấy cấu hình chung

Lấy thông tin cấu hình chung của hệ thống (dành cho admin).

#### Request

```bash
curl -X GET "http://localhost:3000/api/admin/system-config/general" \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

#### Response

**Status Code:** `200 OK`

```json
{
  "id": 1,
  "site_name": "My Website",
  "site_description": "Mô tả website",
  "site_logo": "https://example.com/logo.png",
  "site_favicon": "https://example.com/favicon.ico",
  "site_email": "contact@example.com",
  "site_phone": "0123456789",
  "site_address": "123 Đường ABC, Quận XYZ, TP.HCM",
  "site_copyright": "© 2024 My Website. All rights reserved.",
  "timezone": "Asia/Ho_Chi_Minh",
  "locale": "vi",
  "currency": "VND",
  "contact_channels": [
    {
      "type": "zalo",
      "value": "0123456789",
      "label": "Chat Zalo",
      "icon": "/icons/zalo.png",
      "url_template": "https://zalo.me/{value}",
      "enabled": true,
      "sort_order": 1
    },
    {
      "type": "messenger",
      "value": "123456789",
      "label": "Facebook Messenger",
      "icon": "/icons/messenger.png",
      "url_template": "https://m.me/{value}",
      "enabled": true,
      "sort_order": 2
    },
    {
      "type": "hotline",
      "value": "19001234",
      "label": "Hotline",
      "icon": "/icons/phone.png",
      "url_template": "tel:{value}",
      "enabled": true,
      "sort_order": 3
    }
  ],
  "created_user_id": 1,
  "updated_user_id": 1,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z",
  "deleted_at": null
}
```

#### Response Fields

| Field | Type | Required | Mô tả | Hiển thị UI | Ghi chú |
|-------|------|----------|-------|-------------|---------|
| `id` | number | ✅ | ID của config | ❌ Không cần | Tự sinh từ API |
| `site_name` | string | ✅ | Tên website | ✅ **Cần hiển thị** | Hiển thị ở header/footer |
| `site_description` | string \| null | ❌ | Mô tả website | ✅ **Cần hiển thị** | Dùng cho SEO meta description |
| `site_logo` | string \| null | ❌ | URL logo website | ✅ **Cần hiển thị** | Hiển thị ở header |
| `site_favicon` | string \| null | ❌ | URL favicon | ✅ **Cần hiển thị** | Dùng cho browser tab icon |
| `site_email` | string \| null | ❌ | Email liên hệ | ✅ **Cần hiển thị** | Hiển thị ở footer/contact |
| `site_phone` | string \| null | ❌ | Số điện thoại | ✅ **Cần hiển thị** | Hiển thị ở footer/contact |
| `site_address` | string \| null | ❌ | Địa chỉ | ✅ **Cần hiển thị** | Hiển thị ở footer |
| `site_copyright` | string \| null | ❌ | Copyright text | ✅ **Cần hiển thị** | Hiển thị ở footer |
| `timezone` | string | ✅ | Múi giờ | ⚠️ **Có thể cần** | Mặc định: `Asia/Ho_Chi_Minh` |
| `locale` | string | ✅ | Ngôn ngữ | ⚠️ **Có thể cần** | Mặc định: `vi` |
| `currency` | string | ✅ | Đơn vị tiền tệ | ⚠️ **Có thể cần** | Mặc định: `VND` |
| `contact_channels` | array \| null | ❌ | Danh sách kênh liên hệ | ✅ **Cần hiển thị** | Xem chi tiết bên dưới |
| `created_user_id` | number \| null | ❌ | User ID tạo | ❌ Không cần | Tự sinh từ API |
| `updated_user_id` | number \| null | ❌ | User ID cập nhật | ❌ Không cần | Tự sinh từ API |
| `created_at` | string (ISO 8601) | ✅ | Thời gian tạo | ❌ Không cần | Tự sinh từ API |
| `updated_at` | string (ISO 8601) | ✅ | Thời gian cập nhật | ❌ Không cần | Tự sinh từ API |
| `deleted_at` | string \| null | ❌ | Thời gian xóa | ❌ Không cần | Tự sinh từ API |

#### Contact Channels Structure

`contact_channels` là một mảng các object với cấu trúc sau:

| Field | Type | Required | Mô tả | Ví dụ |
|-------|------|----------|-------|-------|
| `type` | string | ✅ | Loại kênh liên hệ | `"zalo"`, `"messenger"`, `"hotline"`, `"telegram"`, `"whatsapp"` |
| `value` | string | ✅ | Giá trị (số điện thoại, username, ID...) | `"0123456789"`, `"123456789"` |
| `label` | string | ❌ | Tên hiển thị (nếu không có sẽ dùng type) | `"Chat Zalo"`, `"Hotline"` |
| `icon` | string | ❌ | URL icon/ảnh | `"/icons/zalo.png"`, `"https://example.com/icon.png"` |
| `url_template` | string | ❌ | Template URL, `{value}` sẽ được thay bằng `value` | `"https://zalo.me/{value}"`, `"tel:{value}"` |
| `enabled` | boolean | ✅ | Bật/tắt hiển thị | `true`, `false` |
| `sort_order` | number | ❌ | Thứ tự hiển thị (số nhỏ hơn sẽ hiển thị trước) | `1`, `2`, `3` |

**Lưu ý cho Frontend:**
- Chỉ hiển thị các channel có `enabled: true`.
- Sắp xếp theo `sort_order` (số nhỏ hơn hiển thị trước). Nếu không có `sort_order`, giữ nguyên thứ tự trong mảng.
- Khi click vào channel, sử dụng `url_template` để tạo URL:
  - Thay `{value}` bằng `value` của channel.
  - Nếu không có `url_template`, có thể xử lý theo `type`:
    - `hotline`: `tel:{value}`
    - `zalo`: `https://zalo.me/{value}`
    - `messenger`: `https://m.me/{value}`
    - `telegram`: `https://t.me/{value}`
    - `whatsapp`: `https://wa.me/{value}`
- Nếu có `icon`, hiển thị icon; nếu không, có thể dùng icon mặc định theo `type`.
- Các trường `id`, `created_user_id`, `updated_user_id`, `created_at`, `updated_at`, `deleted_at` là các trường audit, không cần hiển thị trong form.
- Các trường `timezone`, `locale`, `currency` có thể cần hiển thị nếu có chức năng cấu hình đa ngôn ngữ/đa tiền tệ.

---

### 1.2. Admin - Cập nhật cấu hình chung

Cập nhật thông tin cấu hình chung của hệ thống.

#### Request

```bash
curl -X PUT "http://localhost:3000/api/admin/system-config/general" \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "site_name": "My Website",
    "site_description": "Mô tả website mới",
    "site_logo": "https://example.com/logo.png",
    "site_favicon": "https://example.com/favicon.ico",
    "site_email": "contact@example.com",
    "site_phone": "0123456789",
    "site_address": "123 Đường ABC, Quận XYZ, TP.HCM",
    "site_copyright": "© 2024 My Website. All rights reserved.",
    "timezone": "Asia/Ho_Chi_Minh",
    "locale": "vi",
    "currency": "VND",
    "contact_channels": [
      {
        "type": "zalo",
        "value": "0123456789",
        "label": "Chat Zalo",
        "icon": "/icons/zalo.png",
        "url_template": "https://zalo.me/{value}",
        "enabled": true,
        "sort_order": 1
      },
      {
        "type": "messenger",
        "value": "123456789",
        "label": "Facebook Messenger",
        "icon": "/icons/messenger.png",
        "url_template": "https://m.me/{value}",
        "enabled": true,
        "sort_order": 2
      },
      {
        "type": "hotline",
        "value": "19001234",
        "label": "Hotline",
        "icon": "/icons/phone.png",
        "url_template": "tel:{value}",
        "enabled": true,
        "sort_order": 3
      }
    ]
  }'
```

#### Request Body

Tất cả các trường đều là **optional** (không bắt buộc). Chỉ gửi các trường cần cập nhật.

```json
{
  "site_name": "string (max 255 chars)",
  "site_description": "string (text, không giới hạn)",
  "site_logo": "string (max 500 chars, URL)",
  "site_favicon": "string (max 500 chars, URL)",
  "site_email": "string (max 255 chars, email format)",
  "site_phone": "string (max 20 chars)",
  "site_address": "string (text, không giới hạn)",
  "site_copyright": "string (max 255 chars)",
  "timezone": "string (max 50 chars, ví dụ: Asia/Ho_Chi_Minh)",
  "locale": "string (max 10 chars, ví dụ: vi, en)",
  "currency": "string (max 10 chars, ví dụ: VND, USD)",
  "contact_channels": [
    {
      "type": "string (required)",
      "value": "string (required)",
      "label": "string (max 255 chars, optional)",
      "icon": "string (max 500 chars, URL, optional)",
      "url_template": "string (max 500 chars, optional)",
      "enabled": "boolean (required)",
      "sort_order": "number (optional)"
    }
  ]
}
```

#### Validation Rules

| Field | Rules |
|-------|-------|
| `site_name` | String, max 255 characters |
| `site_description` | String, không giới hạn |
| `site_logo` | String, max 500 characters, nên là URL hợp lệ |
| `site_favicon` | String, max 500 characters, nên là URL hợp lệ |
| `site_email` | Email format, max 255 characters |
| `site_phone` | String, max 20 characters |
| `site_address` | String, không giới hạn |
| `site_copyright` | String, max 255 characters |
| `timezone` | String, max 50 characters (ví dụ: `Asia/Ho_Chi_Minh`, `UTC`) |
| `locale` | String, max 10 characters (ví dụ: `vi`, `en`, `ja`) |
| `currency` | String, max 10 characters (ví dụ: `VND`, `USD`, `EUR`) |
| `contact_channels` | Array of objects, optional. Mỗi object phải có `type`, `value`, `enabled` (required), và các trường khác optional. Xem chi tiết ở bảng Contact Channels Structure bên trên. |

#### Response

**Status Code:** `200 OK`

Response giống như [1.1. Admin - Lấy cấu hình chung](#11-admin---lấy-cấu-hình-chung)

**Lưu ý:**
- Sau khi cập nhật thành công, cache của Public API sẽ tự động bị xóa.
- Lần request tiếp theo từ Public API sẽ lấy dữ liệu mới.

---

### 1.3. Public - Lấy cấu hình chung (có cache)

Lấy thông tin cấu hình chung của hệ thống (dành cho public, có cache 1 giờ).

**⚠️ Lưu ý:** API này có cache 1 giờ, nên dùng cho frontend public để tối ưu hiệu năng.

#### Request

```bash
curl -X GET "http://localhost:3000/api/public/system-config/general" \
  -H "Content-Type: application/json"
```

**Không cần authentication token.**

#### Response

**Status Code:** `200 OK`

Response giống như [1.1. Admin - Lấy cấu hình chung](#11-admin---lấy-cấu-hình-chung)

#### Cache Behavior

- **Cache TTL:** 1 giờ (3600 giây)
- **Cache Key:** `public:general-config`
- **Cache Invalidation:** Tự động xóa khi admin cập nhật config
- **Fallback:** Nếu chưa có config trong DB, trả về config mặc định

**Lưu ý cho Frontend:**
- API này được cache, nên có thể gọi thường xuyên mà không lo về performance.
- Dữ liệu có thể không cập nhật ngay lập tức sau khi admin thay đổi (tối đa 1 giờ).
- Nếu cần dữ liệu real-time, có thể dùng Admin API (nhưng cần authentication).

---

## 2. Cấu hình Email

### 2.1. Admin - Lấy cấu hình email

Lấy thông tin cấu hình email SMTP của hệ thống.

#### Request

```bash
curl -X GET "http://localhost:3000/api/admin/system-config/email" \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json"
```

#### Response

**Status Code:** `200 OK`

```json
{
  "id": 1,
  "smtp_host": "smtp.gmail.com",
  "smtp_port": 587,
  "smtp_secure": true,
  "smtp_username": "your-email@gmail.com",
  "smtp_password": "******",
  "from_email": "noreply@example.com",
  "from_name": "My Website",
  "reply_to_email": "contact@example.com",
  "created_user_id": 1,
  "updated_user_id": 1,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z",
  "deleted_at": null
}
```

#### Response Fields

| Field | Type | Required | Mô tả | Hiển thị UI | Ghi chú |
|-------|------|----------|-------|-------------|---------|
| `id` | number | ✅ | ID của config | ❌ Không cần | Tự sinh từ API |
| `smtp_host` | string | ✅ | SMTP server host | ✅ **Cần hiển thị** | Ví dụ: `smtp.gmail.com` |
| `smtp_port` | number | ✅ | SMTP port | ✅ **Cần hiển thị** | Mặc định: `587` |
| `smtp_secure` | boolean | ✅ | SSL/TLS | ✅ **Cần hiển thị** | `true` = SSL/TLS, `false` = không |
| `smtp_username` | string | ✅ | SMTP username | ✅ **Cần hiển thị** | Email hoặc username |
| `smtp_password` | string | ✅ | SMTP password | ✅ **Cần hiển thị** | Luôn trả về `******` (masked) |
| `from_email` | string | ✅ | Email gửi đi | ✅ **Cần hiển thị** | Email sẽ hiển thị là người gửi |
| `from_name` | string | ✅ | Tên người gửi | ✅ **Cần hiển thị** | Tên hiển thị trong email |
| `reply_to_email` | string \| null | ❌ | Email reply to | ✅ **Cần hiển thị** | Email nhận reply |
| `created_user_id` | number \| null | ❌ | User ID tạo | ❌ Không cần | Tự sinh từ API |
| `updated_user_id` | number \| null | ❌ | User ID cập nhật | ❌ Không cần | Tự sinh từ API |
| `created_at` | string (ISO 8601) | ✅ | Thời gian tạo | ❌ Không cần | Tự sinh từ API |
| `updated_at` | string (ISO 8601) | ✅ | Thời gian cập nhật | ❌ Không cần | Tự sinh từ API |
| `deleted_at` | string \| null | ❌ | Thời gian xóa | ❌ Không cần | Tự sinh từ API |

**Lưu ý cho Frontend:**
- Trường `smtp_password` luôn trả về `******` (masked) để bảo mật.
- Khi update, nếu không gửi `smtp_password` hoặc gửi rỗng, password cũ sẽ được giữ nguyên.
- Các trường `id`, `created_user_id`, `updated_user_id`, `created_at`, `updated_at`, `deleted_at` là các trường audit, không cần hiển thị trong form.

---

### 2.2. Admin - Cập nhật cấu hình email

Cập nhật thông tin cấu hình email SMTP của hệ thống.

#### Request

```bash
curl -X PUT "http://localhost:3000/api/admin/system-config/email" \
  -H "Authorization: Bearer {{auth_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "smtp_host": "smtp.gmail.com",
    "smtp_port": 587,
    "smtp_secure": true,
    "smtp_username": "your-email@gmail.com",
    "smtp_password": "your-password",
    "from_email": "noreply@example.com",
    "from_name": "My Website",
    "reply_to_email": "contact@example.com"
  }'
```

#### Request Body

Tất cả các trường đều là **optional** (không bắt buộc). Chỉ gửi các trường cần cập nhật.

```json
{
  "smtp_host": "string (max 255 chars)",
  "smtp_port": "number (1-65535)",
  "smtp_secure": "boolean (true/false)",
  "smtp_username": "string (max 255 chars)",
  "smtp_password": "string (min 6, max 500 chars, chỉ gửi khi muốn đổi password)",
  "from_email": "string (max 255 chars, email format)",
  "from_name": "string (max 255 chars)",
  "reply_to_email": "string (max 255 chars, email format, optional)"
}
```

#### Validation Rules

| Field | Rules |
|-------|-------|
| `smtp_host` | String, max 255 characters, required nếu tạo mới |
| `smtp_port` | Number, từ 1 đến 65535, mặc định: `587` |
| `smtp_secure` | Boolean, `true` = SSL/TLS, `false` = không, mặc định: `true` |
| `smtp_username` | String, max 255 characters, required nếu tạo mới |
| `smtp_password` | String, min 6 characters, max 500 characters. **Chỉ gửi khi muốn đổi password mới.** Nếu không gửi, password cũ sẽ được giữ nguyên. |
| `from_email` | Email format, max 255 characters, required nếu tạo mới |
| `from_name` | String, max 255 characters, required nếu tạo mới |
| `reply_to_email` | Email format, max 255 characters, optional |

#### Response

**Status Code:** `200 OK`

Response giống như [2.1. Admin - Lấy cấu hình email](#21-admin---lấy-cấu-hình-email)

**Lưu ý:**
- Password sẽ được hash (bcrypt) trước khi lưu vào database.
- Nếu không gửi `smtp_password` trong request, password hiện tại sẽ được giữ nguyên.
- Nếu gửi `smtp_password` rỗng hoặc không hợp lệ (dưới 6 ký tự), sẽ báo lỗi validation.

---

## Error Responses

### 400 Bad Request

Khi validation fail:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "property": "site_email",
      "constraints": {
        "isEmail": "site_email must be an email"
      }
    }
  ]
}
```

### 401 Unauthorized

Khi thiếu hoặc token không hợp lệ (chỉ áp dụng cho Admin API):

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 500 Internal Server Error

Khi có lỗi server:

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## Ví dụ sử dụng trong Frontend

### TypeScript/JavaScript

```typescript
// 1. Lấy cấu hình chung (Public API - có cache)
async function getGeneralConfig() {
  const response = await fetch('http://localhost:3000/api/public/system-config/general');
  const config = await response.json();
  
  // Sử dụng config
  document.title = config.site_name;
  document.querySelector('meta[name="description"]')?.setAttribute('content', config.site_description || '');
  document.querySelector('link[rel="icon"]')?.setAttribute('href', config.site_favicon || '');
  
  // Hiển thị contact channels
  if (config.contact_channels && config.contact_channels.length > 0) {
    renderContactChannels(config.contact_channels);
  }
  
  return config;
}

// Hiển thị và xử lý contact channels
function renderContactChannels(channels: ContactChannel[]) {
  // Lọc chỉ các channel enabled
  const enabledChannels = channels
    .filter(ch => ch.enabled)
    .sort((a, b) => (a.sort_order || 999) - (b.sort_order || 999));
  
  const container = document.getElementById('contact-channels');
  if (!container) return;
  
  container.innerHTML = enabledChannels.map(channel => {
    const url = channel.url_template 
      ? channel.url_template.replace('{value}', channel.value)
      : getDefaultUrl(channel.type, channel.value);
    
    const label = channel.label || channel.type;
    const icon = channel.icon ? `<img src="${channel.icon}" alt="${label}" />` : '';
    
    return `
      <a href="${url}" class="contact-channel" data-type="${channel.type}">
        ${icon}
        <span>${label}</span>
      </a>
    `;
  }).join('');
}

// Hàm helper tạo URL mặc định nếu không có url_template
function getDefaultUrl(type: string, value: string): string {
  const urlMap: Record<string, string> = {
    'hotline': `tel:${value}`,
    'zalo': `https://zalo.me/${value}`,
    'messenger': `https://m.me/${value}`,
    'telegram': `https://t.me/${value}`,
    'whatsapp': `https://wa.me/${value}`,
  };
  return urlMap[type] || `#`;
}

// 2. Lấy cấu hình chung (Admin API - real-time)
async function getGeneralConfigAdmin(token: string) {
  const response = await fetch('http://localhost:3000/api/admin/system-config/general', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
}

// 3. Cập nhật cấu hình chung
async function updateGeneralConfig(token: string, data: Partial<GeneralConfig>) {
  const response = await fetch('http://localhost:3000/api/admin/system-config/general', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return await response.json();
}

// 4. Lấy cấu hình email
async function getEmailConfig(token: string) {
  const response = await fetch('http://localhost:3000/api/admin/system-config/email', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
}

// 5. Cập nhật cấu hình email (không đổi password)
async function updateEmailConfig(token: string, data: Partial<EmailConfig>) {
  // Không gửi smtp_password nếu không muốn đổi
  const { smtp_password, ...updateData } = data;
  
  const response = await fetch('http://localhost:3000/api/admin/system-config/email', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
  });
  return await response.json();
}

// 6. Cập nhật cấu hình email (có đổi password)
async function updateEmailConfigWithPassword(token: string, data: EmailConfig) {
  const response = await fetch('http://localhost:3000/api/admin/system-config/email', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data) // Bao gồm smtp_password mới
  });
  return await response.json();
}

// Type definitions
interface ContactChannel {
  type: string;
  value: string;
  label?: string;
  icon?: string;
  url_template?: string;
  enabled: boolean;
  sort_order?: number;
}

interface GeneralConfig {
  id: number;
  site_name: string;
  site_description?: string | null;
  site_logo?: string | null;
  site_favicon?: string | null;
  site_email?: string | null;
  site_phone?: string | null;
  site_address?: string | null;
  site_copyright?: string | null;
  timezone: string;
  locale: string;
  currency: string;
  contact_channels?: ContactChannel[] | null;
  created_user_id?: number | null;
  updated_user_id?: number | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

interface EmailConfig {
  id: number;
  smtp_host: string;
  smtp_port: number;
  smtp_secure: boolean;
  smtp_username: string;
  smtp_password: string; // Luôn là "******" khi get
  from_email: string;
  from_name: string;
  reply_to_email?: string | null;
  created_user_id?: number | null;
  updated_user_id?: number | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}
```

### React Example

```tsx
import { useState, useEffect } from 'react';

function GeneralConfigForm() {
  const [config, setConfig] = useState<GeneralConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy config từ Public API (có cache)
    fetch('http://localhost:3000/api/public/system-config/general')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setLoading(false);
      });
  }, []);

  const handleUpdate = async (data: Partial<GeneralConfig>) => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('http://localhost:3000/api/admin/system-config/general', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      const updated = await response.json();
      setConfig(updated);
      alert('Cập nhật thành công!');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!config) return <div>No config found</div>;

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      handleUpdate({
        site_name: formData.get('site_name') as string,
        site_description: formData.get('site_description') as string,
        // ... các trường khác
      });
    }}>
      <input 
        name="site_name" 
        defaultValue={config.site_name} 
        placeholder="Tên website"
      />
      <textarea 
        name="site_description" 
        defaultValue={config.site_description || ''} 
        placeholder="Mô tả website"
      />
      {/* Các trường khác... */}
      <button type="submit">Cập nhật</button>
    </form>
  );
}

// Component hiển thị Contact Channels trên trang chủ
function ContactChannels({ channels }: { channels: ContactChannel[] }) {
  // Lọc và sắp xếp channels
  const enabledChannels = channels
    .filter(ch => ch.enabled)
    .sort((a, b) => (a.sort_order || 999) - (b.sort_order || 999));

  const handleChannelClick = (channel: ContactChannel) => {
    let url: string;
    
    if (channel.url_template) {
      // Thay {value} bằng value thực tế
      url = channel.url_template.replace('{value}', channel.value);
    } else {
      // Fallback URL theo type
      const urlMap: Record<string, string> = {
        'hotline': `tel:${channel.value}`,
        'zalo': `https://zalo.me/${channel.value}`,
        'messenger': `https://m.me/${channel.value}`,
        'telegram': `https://t.me/${channel.value}`,
        'whatsapp': `https://wa.me/${channel.value}`,
      };
      url = urlMap[channel.type] || '#';
    }
    
    window.open(url, '_blank');
  };

  return (
    <div className="contact-channels">
      {enabledChannels.map((channel, index) => (
        <button
          key={index}
          className={`contact-channel contact-channel-${channel.type}`}
          onClick={() => handleChannelClick(channel)}
          title={channel.label || channel.type}
        >
          {channel.icon && (
            <img src={channel.icon} alt={channel.label || channel.type} />
          )}
          <span>{channel.label || channel.type}</span>
        </button>
      ))}
    </div>
  );
}

// Sử dụng trong component chính
function HomePage() {
  const [config, setConfig] = useState<GeneralConfig | null>(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/public/system-config/general')
      .then(res => res.json())
      .then(data => setConfig(data));
  }, []);

  if (!config) return <div>Loading...</div>;

  return (
    <div>
      {/* Nội dung trang chủ khác... */}
      
      {/* Hiển thị contact channels */}
      {config.contact_channels && config.contact_channels.length > 0 && (
        <ContactChannels channels={config.contact_channels} />
      )}
    </div>
  );
}
```

---

## Tóm tắt các trường cần hiển thị trong UI

### General Config Form

**Các trường cần hiển thị:**
- ✅ `site_name` - Input text
- ✅ `site_description` - Textarea
- ✅ `site_logo` - Input text (URL) hoặc file upload
- ✅ `site_favicon` - Input text (URL) hoặc file upload
- ✅ `site_email` - Input email
- ✅ `site_phone` - Input text
- ✅ `site_address` - Textarea
- ✅ `site_copyright` - Input text
- ✅ `contact_channels` - Dynamic form/list (xem chi tiết bên dưới)
- ⚠️ `timezone` - Select dropdown (nếu có chức năng đa múi giờ)
- ⚠️ `locale` - Select dropdown (nếu có chức năng đa ngôn ngữ)
- ⚠️ `currency` - Select dropdown (nếu có chức năng đa tiền tệ)

**Các trường KHÔNG cần hiển thị:**
- ❌ `id`, `created_user_id`, `updated_user_id`, `created_at`, `updated_at`, `deleted_at`

#### Contact Channels Form (Admin)

**Các trường cần hiển thị cho mỗi channel:**
- ✅ `type` - Select dropdown (zalo, messenger, hotline, telegram, whatsapp, hoặc custom)
- ✅ `value` - Input text (số điện thoại, username, ID...)
- ✅ `label` - Input text (tên hiển thị)
- ✅ `icon` - Input text (URL) hoặc file upload
- ✅ `url_template` - Input text (template URL với {value})
- ✅ `enabled` - Checkbox hoặc toggle
- ✅ `sort_order` - Input number (thứ tự hiển thị)

**Gợi ý UI:**
- Hiển thị dạng danh sách với nút "Thêm channel mới", "Xóa channel"
- Cho phép kéo thả để sắp xếp thứ tự (sẽ cập nhật `sort_order` tự động)
- Preview icon nếu có
- Preview URL khi nhập `url_template` và `value`

### Email Config Form

**Các trường cần hiển thị:**
- ✅ `smtp_host` - Input text
- ✅ `smtp_port` - Input number
- ✅ `smtp_secure` - Checkbox hoặc toggle
- ✅ `smtp_username` - Input text
- ✅ `smtp_password` - Input password (chỉ hiển thị khi muốn đổi, có thể có checkbox "Đổi password")
- ✅ `from_email` - Input email
- ✅ `from_name` - Input text
- ✅ `reply_to_email` - Input email (optional)

**Các trường KHÔNG cần hiển thị:**
- ❌ `id`, `created_user_id`, `updated_user_id`, `created_at`, `updated_at`, `deleted_at`

---

## Lưu ý quan trọng

1. **Cache:** Public API có cache 1 giờ, nên dữ liệu có thể không cập nhật ngay sau khi admin thay đổi.
2. **Password:** Trường `smtp_password` luôn trả về `******` khi get. Chỉ gửi password mới khi muốn đổi.
3. **Validation:** Tất cả các trường đều có validation, cần kiểm tra kỹ trước khi gửi request.
4. **Optional Fields:** Tất cả các trường trong request body đều là optional, chỉ gửi các trường cần cập nhật.
5. **Contact Channels:** 
   - Khi gửi `contact_channels`, toàn bộ mảng sẽ được thay thế (không merge). 
   - Nếu muốn xóa tất cả channels, gửi `"contact_channels": []` hoặc `"contact_channels": null`.
   - Chỉ các channel có `enabled: true` mới được hiển thị trên frontend.
   - Frontend nên sắp xếp theo `sort_order` (số nhỏ hơn hiển thị trước).
