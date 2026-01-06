## Kế hoạch chuyển “base” sang Prisma (giữ chức năng con migrate dần)

Mục tiêu: thêm hạ tầng Prisma (service/module, base list/crud) chạy song song với TypeORM, chưa đụng vào logic module con. Khi ready, module nào sẽ migrate dần sang base Prisma mới.

### 1) Chuẩn bị môi trường Prisma
- Thiết lập `DATABASE_URL` trong `.env` (hoặc `.env.local`) cho MySQL. Ví dụ: `mysql://user:pass@host:3306/dbname`.
- Nếu schema DB đã có: `npx prisma db pull` để sync vào `prisma/schema.prisma` (sau đó rà soát chỉnh tay nếu cần).
- Mỗi khi đổi schema: `npm run prisma:generate`.
- Quy ước BigInt: thống nhất convert khi trả JSON (helper convert BigInt → number/string) hoặc chuyển field về `Int` nếu DB thực tế là INT.

### 2) Thêm hạ tầng Prisma
- `src/core/database/prisma/prisma.service.ts`: extend `PrismaClient`, implement `OnModuleInit`, optional `enableShutdownHooks`.
- `src/core/database/prisma/prisma.module.ts`: có thể `@Global`, export `PrismaService`.
- Import `PrismaModule` vào `CoreModule` (giữ `DatabaseModule` TypeORM song song giai đoạn chuyển tiếp).

### 3) Base service riêng cho Prisma (không sửa base TypeORM hiện tại)
- Tạo mới để tránh đụng code cũ:
  - `PrismaListService<TModel, TWhere, TOrderBy>`:
    - Nhận delegate Prisma (vd `prisma.comic`).
    - Chuẩn hóa options: page/limit/sort → orderBy; hook `prepareFilters`, `afterGetList`, `afterGetOne`.
    - Cấu hình `allowedSortFields` để tránh injection/lỗi.
    - Option convert BigInt ở tầng base (trả JSON an toàn).
  - `PrismaCrudService<TModel, TWhere, TCreate, TUpdate>` kế thừa `PrismaListService`:
    - `create`, `update`, `delete` (hard), `softDelete`/`restore` nếu có `deleted_at`.
    - Hook `before/after create/update/delete`, set audit (created_user_id/updated_user_id).
- Giữ nguyên `ListService`/`CrudService` TypeORM cho các module chưa migrate.

### 4) Lộ trình thực thi (base only, chưa động chức năng con)
1. Thêm `PrismaService` + `PrismaModule` vào codebase, import vào `CoreModule`.
2. Viết `PrismaListService`/`PrismaCrudService` (đặt trong `src/common/base/prisma/`).
3. Chuẩn bị helper convert BigInt → number/string dùng chung.
4. (Tuỳ chọn) Tạo một service mẫu dùng base Prisma (vd `PublicComicsService` phiên bản Prisma) chỉ để smoke test. Controller có thể switch bằng flag env, nhưng chưa bắt buộc cho các module khác.

### 5) Lưu ý & best practices
- Sort/filters: giới hạn trường sort ở base Prisma, tránh nhận sort field tự do như TypeORM metadata.
- Soft delete: nếu vẫn dùng `deleted_at`, bổ sung trong schema và implement `softDelete/restore` ở base Prisma.
- Migrations: dùng Prisma Migrate (`prisma migrate dev`) cho dev; giữ migrations TypeORM đến khi toàn bộ module chuyển xong, sau đó mới gỡ TypeORM.
- Seed/CLI: sẽ chuyển dần sau khi base ổn định; tạm thời giữ seed TypeORM.

### 6) Checklist nhanh khi bắt đầu
- [ ] Đặt `DATABASE_URL` và `npm run prisma:generate`.
- [ ] Thêm `PrismaService`/`PrismaModule`, import vào `CoreModule`.
- [ ] Thêm base `PrismaListService`/`PrismaCrudService` + helper BigInt → number/string.
- [ ] (Tuỳ chọn) Service mẫu với base Prisma để test luồng end-to-end.

