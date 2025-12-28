# HƯỚNG DẪN TÍCH HỢP GIÁ TRỊ THUỘC TÍNH (ADMIN)

## 1. Tổng quan

Chức năng **Product Attribute Values** cho phép đội vận hành khai báo các giá trị cụ thể (ví dụ: Đỏ, Size M, Cotton…) cho từng thuộc tính của sản phẩm. Tài liệu này mô tả toàn bộ field, nguồn dữ liệu và luồng API để đội frontend tích hợp đúng yêu cầu.

- Base URL: `https://api.example.com/api`
- Authentication: bắt buộc gửi header `Authorization: Bearer <jwt-token>`
- Module chính: `admin/product-attribute-values`

## 2. Field Mapping

| Field | Kiểu dữ liệu | Bắt buộc | Nguồn dữ liệu/AI | Ghi chú |
| --- | --- | --- | --- | --- |
| `id` | number (bigint) | API sinh | API trả về | Khóa chính, auto increment. Không hiển thị khi tạo. |
| `product_attribute_id` | number (bigint) | ✅ | Dropdown lấy từ `GET /admin/product-attributes?status=active` | Chỉ hiển thị các thuộc tính đang hoạt động. |
| `value` | string (<=255) | ✅ | Người dùng nhập | Giá trị hiển thị trên giao diện bán hàng. |
| `color_code` | string (`#RRGGBB`) | ⛔ (tuỳ thuộc vào `attribute.type === 'color'`) | Color picker nội bộ | Bỏ qua nếu thuộc tính không phải dạng màu. |
| `image` | string (URL hoặc path) | ⛔ (khuyến nghị cho `attribute.type === 'image'`) | Upload qua `POST /upload/file` → lấy `path` trả về | Có thể dùng media library sẵn có, lưu URL tuyệt đối hoặc tương đối. |
| `sort_order` | number (int) | ⛔ (default 0) | Người dùng nhập hoặc auto tăng | Quyết định thứ tự hiển thị. Nếu bỏ trống backend set `0`. |
| `status` | enum (`active`, `inactive`) | ⛔ (default `active`) | Dropdown lấy từ `GET /enums?keys=basic_status` | Front có thể preset `active`. |
| `created_user_id` | number (bigint) | ⛔ | Tự lấy từ thông tin user đang đăng nhập (`/auth/me`) | Dùng để audit. Nếu backend tự suy ra từ token thì có thể ẩn field. |
| `updated_user_id` | number (bigint) | ⛔ (khi update) | Tương tự `created_user_id` | Gửi mỗi khi cập nhật. |
| `created_at` | datetime | API sinh | API trả về | Hiển thị read-only. |
| `updated_at` | datetime | API sinh | API trả về | Hiển thị read-only. |
| `deleted_at` | datetime \| null | API sinh | API trả về | Chỉ xuất hiện khi đã soft delete. |

> Lưu ý: Schema thực tế nằm tại entity `ProductAttributeValue` (`src/shared/entities/product-attribute-value.entity.ts`). API bỏ qua mọi field không thuộc danh sách trên.

## 3. API Danh Sách & Tra Cứu

### 3.1. Lấy toàn bộ giá trị (có filter)

```
GET /admin/product-attribute-values?page=1&limit=20&filters[product_attribute_id]=3&filters[status]=active
```

- Query chuẩn hóa thông qua helper `prepareQuery`, vì vậy các filter nên dùng dạng `filters[field]=value`.
- Hỗ trợ `search` (tìm theo `value`) và `include_deleted=true` nếu cần xem bản ghi đã xóa mềm.

### 3.2. Lấy theo thuộc tính

```
GET /admin/product-attribute-values/attribute/{attributeId}
```

- Trả về toàn bộ giá trị của thuộc tính với order mặc định `sort_order ASC`, sau đó `value ASC`.
- Dùng trong màn chi tiết thuộc tính để load nhanh danh sách giá trị.

### 3.3. Lấy chi tiết từng giá trị

```
GET /admin/product-attribute-values/{id}
```

- Dùng khi mở modal chỉnh sửa.

## 4. API Tạo/Cập Nhật/Xóa

### 4.1. Tạo mới

```
POST /admin/product-attribute-values
Content-Type: application/json

{
  "product_attribute_id": 3,
  "value": "Đỏ",
  "color_code": "#FF0000",
  "image": "https://cdn.example.com/colors/red.png",
  "sort_order": 0,
  "status": "active",
  "created_user_id": 12
}
```

- Backend sẽ trả lại bản ghi đầy đủ bao gồm `id`, `created_at`, `updated_at`.
- Nếu bỏ `status` sẽ mặc định `active`. Nếu bỏ `sort_order`, backend gán `0`.

### 4.2. Cập nhật

```
PUT /admin/product-attribute-values/{id}

{
  "value": "Đỏ Ruby",
  "color_code": "#AA0000",
  "sort_order": 1,
  "status": "active",
  "updated_user_id": 12
}
```

- Chỉ gửi field thay đổi.
- Nếu cần chuyển giá trị sang thuộc tính khác, thêm `product_attribute_id` mới (hạn chế thao tác này vì ảnh hưởng biến thể).

### 4.3. Khôi phục và Xóa

- Soft delete: `DELETE /admin/product-attribute-values/{id}`
- Restore: `PUT /admin/product-attribute-values/{id}/restore`

Quy tắc:
- Không thể xóa giá trị đang được biến thể sử dụng (backend sẽ trả lỗi nếu có ràng buộc).
- Sau khi xóa cần reload danh sách để phản ánh `deleted_at`.

## 5. Luồng Tích Hợp Giao Diện

1. **Load dữ liệu nền**
   - Gọi `GET /admin/product-attributes?status=active` để đổ dropdown chọn thuộc tính.
   - Gọi `GET /enums?keys=basic_status` để dựng dropdown trạng thái.
2. **Hiển thị danh sách giá trị**
   - Với mỗi thuộc tính, gọi `GET /admin/product-attribute-values/attribute/{attributeId}`.
   - Hiển thị `value`, `color_code` (chip màu), `image` (thumbnail), `status`, `sort_order`.
3. **Tạo/Chỉnh sửa**
   - Thu thập input theo bảng field.
   - Nếu `image` có file mới: upload qua `POST /upload/file` trước, sau đó lưu `path/url` trả về vào payload.
   - Gửi request tới API tương ứng (POST/PUT). Sau khi thành công reload danh sách bằng call ở bước 2.
4. **Sắp xếp**
   - Cho phép người dùng thay đổi `sort_order`. Có thể batch update từng record bằng `PUT` hoặc tạo nút “Lưu thứ tự” gọi API tuần tự.
5. **Kiểm soát trạng thái**
   - Toggle `status` để ẩn/hiện giá trị ngoài storefront thay vì xóa.

## 6. Quy tắc nghiệp vụ & Validation

- `value` không được trùng trong cùng `product_attribute_id` (backend đã enforce bằng unique logic trong service, nhưng nên validate client-side).
- `color_code` phải đúng định dạng `#RRGGBB`.
- `image` nên là URL hợp lệ được trả về từ module upload; tránh lưu base64.
- `product_attribute_id` bắt buộc thuộc thuộc tính đang `status = active`. Nếu attribute bị khóa, không cho thêm giá trị mới trên UI.
- Khi thuộc tính có `type = 'color'` hoặc `type = 'image'`, bắt buộc hiển thị input tương ứng, các loại khác chỉ cần `value`.
- Thay đổi `status` hoặc `sort_order` cần cập nhật ngay để đồng bộ bộ lọc sản phẩm và biến thể.

## 7. Kiểm thử gợi ý

1. Thêm mới giá trị với đầy đủ field (bao gồm ảnh/mã màu) và xác nhận xuất hiện đúng thứ tự.
2. Thêm giá trị trùng tên trong cùng thuộc tính → đảm bảo backend trả lỗi, UI hiển thị message.
3. Đổi trạng thái sang `inactive` → kiểm tra giá trị không còn xuất hiện tại storefront/biến thể mới.
4. Soft delete rồi restore → xác nhận `deleted_at` được clear.
5. Tạo giá trị cho thuộc tính loại text → đảm bảo UI không bắt `color_code`/`image`.

---

> Nếu cần mở rộng (ví dụ đồng bộ với product variants), hãy tham chiếu thêm `docs/api/ecommerce/admin/product-attribute-integration-guide.md` để nắm rõ mối quan hệ giữa attribute ↔ value ↔ variant.

