# Tối ưu: Cache Last Chapter vào Comics Table

## 📊 So sánh 2 phương án

### Option 1: Giữ nguyên (Query từ Chapters) ✅ Đơn giản

**Code hiện tại:**
```typescript
// 2 queries: chapters → comics
const chapters = await chaptersService.getList({ limit: 50, sort: 'created_at:DESC' });
const comics = await comicsService.getList({ id: { in: comicIds } });
```

**Pros:**
- ✅ Data normalized, không có redundancy
- ✅ Không cần maintain thêm logic
- ✅ Luôn đảm bảo data chính xác 100%

**Cons:**
- ❌ Query phức tạp (2 queries)
- ❌ Performance chậm hơn (~2x queries)
- ❌ Cache hiệu quả kém hơn

**Performance:**
- Query time: ~50-100ms (2 queries)
- Cache hit: Trung bình (data thay đổi thường xuyên)

---

### Option 2: Denormalize (Thêm fields vào Comics) ✅ Khuyến nghị

**Code sau khi tối ưu:**
```typescript
// 1 query đơn giản
const comics = await comicsService.getList({ 
  limit: 10, 
  sort: 'last_chapter_updated_at:DESC' 
});
```

**Pros:**
- ✅ **Performance tốt hơn 2-3x** (1 query thay vì 2)
- ✅ Query đơn giản, dễ maintain
- ✅ Cache hiệu quả hơn (ít thay đổi)
- ✅ Index tốt hơn (sort trên 1 field)
- ✅ Phù hợp với high-traffic homepage

**Cons:**
- ⚠️ Cần maintain data consistency
- ⚠️ Cần update comic khi có chapter mới/cập nhật/xóa

**Performance:**
- Query time: ~20-40ms (1 query)
- Cache hit: Cao hơn (data ít thay đổi hơn)

---

## 🎯 Khuyến nghị: **Option 2** (Denormalize)

**Lý do:**
1. **Homepage API là high-traffic endpoint** → Performance quan trọng
2. **Write ít, Read nhiều** → Denormalization hợp lý
3. **Logic maintain đơn giản** → Chỉ cần update trong `afterCreate/afterUpdate/afterDelete` của ChaptersService
4. **Có thể rollback** → Nếu có vấn đề, vẫn có thể query từ chapters như cũ

---

## 🚀 Implementation Plan

### Bước 1: Update Schema

```prisma
model Comic {
  // ... existing fields ...
  
  // Thêm 2 fields mới
  last_chapter_id        BigInt?   @db.UnsignedBigInt
  last_chapter_updated_at DateTime? @db.DateTime(0)
  
  // Foreign key
  lastChapter            Chapter?  @relation("LastChapter", fields: [last_chapter_id], references: [id], onDelete: SetNull)
  
  // Index cho sort performance
  @@index([last_chapter_updated_at], map: "idx_last_chapter_updated_at")
}
```

### Bước 2: Tạo Migration

```bash
npx prisma migrate dev --name add_last_chapter_fields_to_comics
```

### Bước 3: Update ChaptersService

**Logic:** Mỗi khi create/update/delete chapter → Update comic's `last_chapter_id` và `last_chapter_updated_at`

```typescript
// src/modules/comics/admin/chapters/services/chapters.service.ts

protected async afterCreate(entity: any, _createDto: ChapterBag['Create']): Promise<void> {
  // ... existing code ...
  
  // Update comic's last chapter info
  await this.updateComicLastChapter(entity.comic_id);
}

protected async afterUpdate(entity: any, updateDto: ChapterBag['Update']): Promise<void> {
  // ... existing code ...
  
  // Update nếu status thay đổi thành published
  if ((updateDto as any).status === ChapterStatus.published) {
    await this.updateComicLastChapter(entity.comic_id);
  }
}

protected async afterDelete(entity: any): Promise<void> {
  // ... existing code ...
  
  // Update lại last chapter của comic
  await this.updateComicLastChapter(entity.comic_id);
}

/**
 * Helper: Update comic's last chapter info
 */
private async updateComicLastChapter(comicId: bigint): Promise<void> {
  // Tìm chapter mới nhất (published)
  const lastChapter = await this.prisma.chapter.findFirst({
    where: {
      comic_id: comicId,
      status: { in: PUBLIC_CHAPTER_STATUSES },
      deleted_at: null,
    },
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      created_at: true,
    },
  });

  // Update comic
  await this.prisma.comic.update({
    where: { id: comicId },
    data: {
      last_chapter_id: lastChapter?.id || null,
      last_chapter_updated_at: lastChapter?.created_at || null,
    },
  });
}
```

### Bước 4: Tạo script backfill data (một lần)

```typescript
// scripts/backfill-comic-last-chapter.ts

async function backfillComicLastChapter() {
  const comics = await prisma.comic.findMany({
    where: { deleted_at: null },
    select: { id: true },
  });

  for (const comic of comics) {
    const lastChapter = await prisma.chapter.findFirst({
      where: {
        comic_id: comic.id,
        status: { in: ['published'] },
        deleted_at: null,
      },
      orderBy: { created_at: 'desc' },
      select: { id: true, created_at: true },
    });

    await prisma.comic.update({
      where: { id: comic.id },
      data: {
        last_chapter_id: lastChapter?.id || null,
        last_chapter_updated_at: lastChapter?.created_at || null,
      },
    });
  }
}
```

### Bước 5: Update HomepageService (đơn giản hơn)

```typescript
// src/modules/comics/public/homepage/services/homepage.service.ts

// Recent update comics - cache 2 phút
this.cacheService.getOrSet(
  this.CACHE_KEYS.LATEST_CHAPTERS,
  async () => {
    // ✅ Chỉ cần 1 query đơn giản!
    const result = await this.comicsService.getList(undefined, {
      limit: 10,
      sort: 'last_chapter_updated_at:DESC', // Sort trực tiếp trên comics table
    });
    return result.data || [];
  },
  this.CACHE_TTL.LATEST_CHAPTERS,
),
```

### Bước 6: Update ComicsService prepareOptions

Thêm support sort `last_chapter_updated_at`:

```typescript
protected override prepareOptions(queryOptions: any = {}) {
  // ... existing code ...
  
  const [sortFieldRaw, sortField] = String(base.sort || '').split(':');
  const sortDirection = (sortField || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

  const orderBy = 
    allowStatsSort.includes(sortFieldRaw)
      ? { stats: { [sortFieldRaw]: sortDirection } }
    : sortFieldRaw === 'last_chapter_updated_at'
      ? { last_chapter_updated_at: sortDirection }
      : base.orderBy;

  // ... rest of code ...
}
```

---

## 📈 Expected Results

### Before (Option 1)
```
GET /api/public/homepage
- Query 1: SELECT * FROM chapters ORDER BY created_at DESC LIMIT 50 (30ms)
- Query 2: SELECT * FROM comics WHERE id IN (...) (25ms)
- Total: ~55ms
```

### After (Option 2)
```
GET /api/public/homepage
- Query 1: SELECT * FROM comics ORDER BY last_chapter_updated_at DESC LIMIT 10 (20ms)
- Total: ~20ms (✅ 2.75x faster)
```

---

## 🔄 Rollback Plan (nếu cần)

Nếu gặp vấn đề, có thể rollback bằng cách:
1. Revert homepage service về code cũ (query từ chapters)
2. Fields mới vẫn ở trong DB nhưng không dùng (không ảnh hưởng)
3. Migration rollback nếu cần: `npx prisma migrate rollback`

---

## ⚠️ Lưu ý

1. **Data Consistency**: Cần đảm bảo luôn update comic khi có thay đổi chapter
2. **Soft Delete**: Khi delete chapter, cần tìm chapter mới nhất để update
3. **Status Change**: Khi chapter đổi status → published, cần update comic
4. **Concurrent Updates**: Prisma transaction đảm bảo atomicity

---

## ✅ Checklist Implementation

- [ ] Update Prisma schema
- [ ] Tạo migration
- [ ] Update ChaptersService (afterCreate, afterUpdate, afterDelete)
- [ ] Tạo helper method `updateComicLastChapter`
- [ ] Tạo script backfill data (một lần)
- [ ] Update ComicsService (support sort `last_chapter_updated_at`)
- [ ] Update HomepageService (đơn giản hóa query)
- [ ] Test create/update/delete chapter → verify comic updated
- [ ] Test homepage API → verify performance
- [ ] Monitor production → verify data consistency

---

**Kết luận:** Option 2 (Denormalize) là lựa chọn tối ưu cho performance và scalability, với trade-off nhỏ là cần maintain data consistency (đã có solution rõ ràng).

