## CMS Admin FE Integration – Comics / Chapters / Comic Categories

Tài liệu này tóm tắt **cách FE CMS gọi API** cho 3 phần:

- **Comics**: quản lý truyện
- **Chapters**: quản lý chương
- **Comic Categories**: quản lý danh mục truyện

Tài liệu chi tiết tham khảo thêm trong:

- `docs/api/comics/admin/comics.md`
- `docs/api/comics/admin/chapters.md`
- `docs/api/comics/admin/comic-categories.md`

---

## 1. Thông tin chung

- **Base URL chung**: `http://<BACKEND_HOST>/api`
- **Auth**: Header `Authorization: Bearer <ACCESS_TOKEN>`
- **Permission bắt buộc**: `comic.manage`
- **Content-Type**:
  - JSON: `application/json`
  - Upload file: `multipart/form-data`

---

## 2. Comics – Quản lý truyện

- **Base path**: `/admin/comics`

### 2.1. Danh sách truyện (list / filter / sort / paginate)

- **GET** `/admin/comics`
- **Dùng cho**: màn list truyện trong CMS.

**Query params:**

- `page` (number, optional) – default `1`
- `limit` (number, optional) – default `10`
- `search` (string, optional) – tìm theo `title`
- `filters[status]` (string, optional) – `draft`, `published`, `completed`, `hidden`
- `filters[author]` (string, optional)
- `filters[category_id]` (number, optional)
- `sort` (string, optional) – ví dụ: `created_at:DESC`

**Response (rút gọn):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slug": "truyen-tranh-mau",
      "title": "Truyện Tranh Mẫu",
      "description": "Mô tả...",
      "cover_image": "https://example.com/cover.jpg",
      "author": "Tác giả",
      "status": "published",
      "categories": [
        { "id": 1, "name": "Hành động", "slug": "hanh-dong" }
      ],
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

### 2.2. Danh sách đơn giản (dropdown / select)

- **GET** `/admin/comics/simple`
- **Dùng cho**: dropdown chọn truyện (chỉ cần `id`, `title`, `slug`).

---

### 2.3. Chi tiết truyện (view / edit)

- **GET** `/admin/comics/:id`
- **Dùng cho**: màn “Edit comic” hoặc trang chi tiết truyện trong CMS.

**Path param**:

- `id` – ID truyện (number)

**Response (rút gọn):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "slug": "truyen-tranh-mau",
    "title": "Truyện Tranh Mẫu",
    "description": "Mô tả...",
    "cover_image": "https://example.com/cover.jpg",
    "author": "Tác giả",
    "status": "published",
    "categories": [
      { "id": 1, "name": "Hành động", "slug": "hanh-dong" }
    ],
    "stats": {
      "view_count": 1000,
      "follow_count": 50,
      "review_count": 20,
      "average_rating": 4.5
    }
  }
}
```

---

### 2.4. Tạo truyện (Create)

- **POST** `/admin/comics`
- **Dùng cho**: form “Create comic”.

**Body FE gửi:**

| Field          | Type      | Required | Ghi chú                                                                 |
|----------------|-----------|----------|-------------------------------------------------------------------------|
| `title`        | string    | ✅       | Tối đa 255 ký tự                                                        |
| `slug`         | string    | ❌       | Nếu không gửi, BE tự sinh từ `title`                                   |
| `description`  | string    | ❌       | Mô tả truyện                                                            |
| `cover_image`  | string    | ❌       | URL ảnh bìa (thường set sau khi upload cover)                          |
| `author`       | string    | ❌       | Tối đa 255 ký tự                                                        |
| `status`       | enum      | ❌       | `draft` \| `published` \| `completed` \| `hidden` (mặc định: `draft`)  |
| `category_ids` | number[]  | ❌       | Danh sách ID danh mục                                                   |

**Field auto (không gửi từ FE):**

- `id`, `created_at`, `updated_at`, `created_user_id`, `updated_user_id`, `deleted_at`
- `slug` nếu FE không gửi.

---

### 2.5. Cập nhật truyện (Update)

- **PUT** `/admin/comics/:id`
- **Dùng cho**: form “Edit comic”.

**Body** – tất cả **optional**, FE gửi field cần thay đổi:

| Field          | Type     | Ghi chú                                         |
|----------------|----------|-------------------------------------------------|
| `title`        | string   |                                                 |
| `slug`         | string   | BE sẽ check unique                              |
| `description`  | string   |                                                 |
| `cover_image`  | string   | URL ảnh bìa                                     |
| `author`       | string   |                                                 |
| `status`       | enum     | `draft` \| `published` \| `completed` \| `hidden` |
| `category_ids` | number[] | Thay thế toàn bộ danh sách category của truyện |

---

### 2.6. Xóa / Khôi phục truyện (Soft delete)

- **DELETE** `/admin/comics/:id`  
  → Soft delete (`deleted_at` khác null).
- **POST** `/admin/comics/:id/restore`  
  → Khôi phục truyện đã xóa mềm.

---

### 2.7. Gán danh mục cho truyện

- **POST** `/admin/comics/:id/comic-categories`
- **Dùng cho**: màn chỉnh sửa “Danh mục” của 1 truyện.

**Body:**

```json
{
  "category_ids": [1, 2, 3]
}
```

---

### 2.8. Upload ảnh bìa (cover)

- **POST** `/admin/comics/:id/cover`
- **Dùng cho**: upload file ảnh bìa sau khi đã tạo truyện.
- **Content-Type**: `multipart/form-data`
- **Field file**: `file`

**Flow gợi ý cho FE:**

1. Gửi form `POST /admin/comics` (không cần `cover_image`).
2. Nhận `comic.id`.
3. Upload cover: `POST /admin/comics/:id/cover` với `formData.append('file', file)`.
4. BE trả về comic đã được cập nhật `cover_image`.

---

## 3. Chapters – Quản lý chương

- **Base path**: `/admin/chapters`

### 3.1. Danh sách chương

- **GET** `/admin/chapters`
- **Dùng cho**: list chương chung hoặc filter theo truyện.

**Query params:**

- `page`, `limit`
- `filters[comic_id]` – lọc theo truyện
- `filters[status]` – `draft` \| `published`
- `sort` – mặc định `chapter_index:ASC`

---

### 3.2. Lấy chương theo ID

- **GET** `/admin/chapters/:id`
- **Dùng cho**: màn edit chi tiết chương (metadata + pages).

---

### 3.3. Lấy tất cả chương của 1 truyện

- **GET** `/admin/chapters/comics/:comicId`
- **Dùng cho**: tab “Chapters” trong trang chi tiết truyện.
- Trả về toàn bộ chương của truyện `comicId`, sắp xếp theo `chapter_index`.

---

### 3.4. Tạo chương (Create)

- **POST** `/admin/chapters`
- **Dùng cho**: form “Create chapter”.

**Body FE gửi:**

| Field           | Type          | Required | Ghi chú                                        |
|-----------------|---------------|----------|------------------------------------------------|
| `comic_id`      | number        | ✅       | ID truyện                                      |
| `team_id`       | number        | ❌       | ID nhóm dịch (nếu có)                         |
| `title`         | string        | ✅       | Tên chương                                    |
| `chapter_index` | number        | ✅       | Số chương (>=1, unique theo truyện)           |
| `chapter_label` | string        | ❌       | Label hiển thị, ví dụ `"Chapter 1"`           |
| `status`        | enum          | ❌       | `draft` \| `published` (default: `draft`)     |
| `pages`         | Page[]        | ❌       | Nếu đã có URL ảnh sẵn                          |

**Cấu trúc `Page` trong `pages`:**

| Field       | Type   | Required | Ghi chú                 |
|-------------|--------|----------|-------------------------|
| `image_url` | string | ✅       | URL ảnh                 |
| `width`     | number | ❌       | px                      |
| `height`    | number | ❌       | px                      |
| `file_size` | number | ❌       | bytes                   |

---

### 3.5. Cập nhật chương (Update)

- **PUT** `/admin/chapters/:id`
- **Dùng cho**: form “Edit chapter” (metadata).

**Body** – tất cả **optional**:

| Field           | Type   | Ghi chú                      |
|-----------------|--------|------------------------------|
| `team_id`       | number |                              |
| `title`         | string |                              |
| `chapter_index` | number | >= 1                         |
| `chapter_label` | string |                              |
| `status`        | enum   | `draft` \| `published`       |

---

### 3.6. Reorder chương

- **PUT** `/admin/chapters/:id/reorder`

**Body:**

```json
{
  "chapter_index": 2
}
```

---

### 3.7. Quản lý pages (trang ảnh) của chương

#### 3.7.1. Lấy danh sách pages

- **GET** `/admin/chapters/:id/pages`
- Dùng cho UI để hiển thị / reorder / chỉnh sửa pages của chương.

#### 3.7.2. Upload pages (nhiều file)

- **POST** `/admin/chapters/:id/pages`
- **Content-Type**: `multipart/form-data`
- **Field file**: `files` (array), tối đa 100 files.

**Flow FE gợi ý:**

1. Tạo chapter (metadata) → nhận `chapter.id`.
2. Upload nhiều ảnh → `POST /admin/chapters/:id/pages` với `FormData.append('files', file)` cho từng file.
3. BE upload file, tạo pages với `image_url`, `file_size`… và trả về danh sách pages mới.

#### 3.7.3. Cập nhật lại danh sách pages (override)

- **PUT** `/admin/chapters/:id/pages`

**Body:**

```json
{
  "pages": [
    {
      "image_url": "https://example.com/page-1.jpg",
      "width": 800,
      "height": 1200,
      "file_size": 150000
    }
  ]
}
```

- Dùng cho: khi FE muốn sắp xếp lại, thêm/bớt, sửa URL,… và gửi danh sách mới full list.

---

### 3.8. Xóa / Khôi phục chương

- **DELETE** `/admin/chapters/:id` – soft delete.
- **POST** `/admin/chapters/:id/restore` – khôi phục.

---

## 4. Comic Categories – Quản lý danh mục truyện

- **Base path**: `/admin/comic-categories`

### 4.1. Danh sách danh mục

- **GET** `/admin/comic-categories`
- **Dùng cho**: màn list danh mục + dropdown chọn category.

**Query params:**

- `page`, `limit`
- `search` – tìm theo `name`
- `sort` – mặc định `created_at:DESC`

---

### 4.2. Chi tiết danh mục

- **GET** `/admin/comic-categories/:id`
- Trả về:
  - Thông tin category: `id`, `name`, `slug`, `description`,…
  - Có thể kèm danh sách truyện thuộc danh mục (tối giản).

---

### 4.3. Tạo danh mục

- **POST** `/admin/comic-categories`

**Body FE gửi:**

| Field         | Type   | Required | Ghi chú                                 |
|---------------|--------|----------|-----------------------------------------|
| `name`        | string | ✅       | Tên danh mục (tối đa 255 ký tự)        |
| `slug`        | string | ❌       | Nếu không gửi, BE tự sinh từ `name`    |
| `description` | string | ❌       | Mô tả                                   |

---

### 4.4. Cập nhật danh mục

- **PUT** `/admin/comic-categories/:id`

**Body** – tất cả **optional**:

| Field         | Type   | Ghi chú                      |
|---------------|--------|------------------------------|
| `name`        | string |                              |
| `slug`        | string | BE sẽ chuẩn hóa & check trùng |
| `description` | string |                              |

---

### 4.5. Xóa danh mục (Soft delete)

- **DELETE** `/admin/comic-categories/:id`
- Lưu ý:
  - Là soft delete (`deleted_at`), không xóa hẳn khỏi DB.
  - Không xóa truyện, chỉ ngắt liên kết `comic ↔ category`.

---

## 5. Gợi ý flow tích hợp cho FE

### 5.1. Tạo truyện mới + chương + ảnh

1. **Tạo truyện**: `POST /admin/comics`
2. (Optional) **Gán danh mục**: `POST /admin/comics/:id/comic-categories`
3. **Upload cover**: `POST /admin/comics/:id/cover`
4. **Tạo chương**: `POST /admin/chapters`
5. **Upload pages**: `POST /admin/chapters/:id/pages`
6. **Xuất bản chương**: `PUT /admin/chapters/:id` với `status = "published"`

### 5.2. Chỉnh sửa chương hiện có

1. Lấy chương: `GET /admin/chapters/:id`
2. Sửa metadata: `PUT /admin/chapters/:id`
3. Nếu cần sửa toàn bộ pages: gọi `PUT /admin/chapters/:id/pages` với danh sách `pages` mới.

---

## 6. Lưu ý cho FE

- **Status hiển thị public**: chỉ truyện/chương có `status = "published"` hoặc `"completed"` mới xuất hiện ở Public API.
- **Soft delete**: tất cả delete trong admin là soft delete, có thể khôi phục.
- **Slug**: nếu FE không muốn xử lý, có thể bỏ trống để BE tự sinh từ `title` / `name`.


