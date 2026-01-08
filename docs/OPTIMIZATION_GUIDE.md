# Hướng dẫn tối ưu hóa API cho trang chủ

## 📋 Tổng quan

Hiện tại trang chủ đang gọi **8 API endpoints riêng biệt**:
1. `comics?status=published&limit=10&sort_by=view_count&sort_order=DESC`
2. `trending?limit=30`
3. `popular?limit=30`
4. `newest?limit=30`
5. `chapters?status=published&limit=10&sort_by=created_at&sort_order=DESC&include=comic`
6. `comic-categories?status=active&limit=20`
7. `post-categories?page=1&limit=20&status=active&sort=sort_order:ASC`
8. `me` (nếu đã đăng nhập)

## 🎯 Các giải pháp tối ưu

### Giải pháp 1: Tạo endpoint kết hợp (Recommended ⭐)

Tạo một endpoint duy nhất `/public/homepage` để trả về tất cả dữ liệu cần thiết cho trang chủ.

**Ưu điểm:**
- ✅ Giảm số lượng HTTP requests từ 8 xuống 1
- ✅ Giảm overhead (headers, authentication checks)
- ✅ Tối ưu query database (có thể batch/parallel trong service)
- ✅ Dễ cache và invalidate cache
- ✅ Giảm latency tổng thể

**Nhược điểm:**
- ❌ Frontend phải load toàn bộ dữ liệu ngay cả khi chỉ cần một phần
- ❌ Phải refactor frontend để sử dụng endpoint mới

**Khi nào nên dùng:**
- Khi trang chủ luôn cần tất cả dữ liệu này
- Khi muốn tối ưu performance tối đa

### Giải pháp 2: Gọi song song (Parallel Requests)

Giữ nguyên 8 endpoints nhưng gọi song song bằng `Promise.all()`.

**Ưu điểm:**
- ✅ Dễ implement, không cần thay đổi backend
- ✅ Vẫn giảm được thời gian chờ (từ sequential sang parallel)
- ✅ Frontend có thể xử lý từng phần dữ liệu khi load xong

**Nhược điểm:**
- ❌ Vẫn có 8 HTTP requests
- ❌ Overhead nhiều hơn endpoint kết hợp

**Khi nào nên dùng:**
- Khi muốn tối ưu nhanh mà không cần thay đổi backend
- Khi có khả năng lazy load một số phần dữ liệu

### Giải pháp 3: Lazy Loading

Chỉ load dữ liệu cần thiết cho phần hiển thị đầu tiên, load các phần còn lại sau.

**Ưu điểm:**
- ✅ Time to Interactive (TTI) nhanh hơn
- ✅ Better user experience (hiển thị nội dung sớm hơn)
- ✅ Tiết kiệm bandwidth cho mobile users

**Nhược điểm:**
- ❌ Có thể có nhiều loading states
- ❌ Cần design UI phù hợp

**Khi nào nên dùng:**
- Khi trang chủ dài và có nhiều sections
- Khi muốn tối ưu cho mobile/3G

### Giải pháp 4: Caching + Conditional Requests

Implement caching ở cả backend và frontend với ETag/Last-Modified.

**Ưu điểm:**
- ✅ Giảm tải cho server
- ✅ Faster cho repeat visitors
- ✅ Tiết kiệm bandwidth

**Nhược điểm:**
- ❌ Cần implement invalidation strategy
- ❌ Phức tạp hơn một chút

**Khi nào nên dùng:**
- Khi có nhiều repeat visitors
- Khi dữ liệu không thay đổi thường xuyên

### Giải pháp 5: Kết hợp (Hybrid Approach) ⭐⭐⭐

Kết hợp nhiều giải pháp:
- Endpoint kết hợp cho dữ liệu critical
- Caching cho static data (categories)
- Lazy loading cho các sections phía dưới

## 🚀 Implementation

### Implementation 1: Homepage Combined Endpoint ✅ Đã implement

Đã tạo endpoint kết hợp tại `src/modules/comics/public/homepage/`

**API Endpoint mới:**
```
GET /api/public/homepage
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": {
    "top_viewed_comics": [...],      // 10 comics xem nhiều nhất - sort by view_count:DESC
    "trending_comics": [...],        // 30 comics trending (hot) - sort by view_count:DESC
    "popular_comics": [...],         // 30 comics phổ biến (nổi bật) - sort by follow_count:DESC
    "newest_comics": [...],          // 30 comics mới nhất - sort by created_at:DESC
    "recent_update_comics": [...],   // 10 comics có chapter mới cập nhật - sort by last_chapter_updated_at:DESC
    "comic_categories": [...]        // 20 comic categories
  },
  "meta": {},
  "timestamp": "2026-01-08T10:52:30+07:00"
}
```

**Tính năng:**
- ✅ Kết hợp 6 API calls thành 1 endpoint
- ✅ Fetch dữ liệu song song (Promise.all)
- ✅ **Cache riêng cho từng block với TTL khác nhau** ⭐
- ✅ Không gọi API `/users/me` (gọi riêng nếu cần)
- ✅ Sử dụng `getList` với điều kiện sort thay vì methods riêng
- ✅ Không có post categories (chỉ comic categories)

**Cache Strategy (Cache theo từng block):**

| Block | Cache Key | TTL | Sort Condition | Lý do |
|-------|-----------|-----|----------------|-------|
| Truyện nổi bật (Popular) | `public:homepage:comics:popular` | 20 phút (1200s) | `follow_count:DESC` | Thay đổi chậm |
| Truyện hot (Trending) | `public:homepage:comics:trending` | 7 phút (420s) | `view_count:DESC` | Thay đổi nhanh hơn |
| Top viewed | `public:homepage:comics:top_viewed` | 7 phút (420s) | `view_count:DESC` | Thay đổi nhanh hơn |
| Truyện mới (Newest) | `public:homepage:comics:newest` | 2 phút (120s) | `created_at:DESC` | Thay đổi liên tục |
| Chapters mới nhất | `public:homepage:chapters:latest` | 2 phút (120s) | `created_at:DESC` | Thay đổi liên tục |
| Danh mục Comic | `public:homepage:categories:comic` | 12 giờ (43200s) | - | Rất ít thay đổi |

**Lợi ích cache theo block:**
- ✅ Mỗi block có thể clear cache độc lập
- ✅ TTL phù hợp với tần suất thay đổi của dữ liệu
- ✅ Giảm load database không cần thiết
- ✅ Response time nhanh hơn khi cache hit

**TypeScript Interface (cho FE):**
```typescript
// types/homepage.ts
interface Comic {
  id: number;
  slug: string;
  title: string;
  description: string;
  cover_image: string;
  author: string;
  status: string;
  created_at: string;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  stats: {
    view_count: number;
    follow_count: number;
    chapter_count: number;
  };
  last_chapter?: {
    id: number;
    title: string;
    chapter_index: number;
    chapter_label: string;
    created_at: string;
  };
}

interface ComicCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  created_at: string;
}

interface HomepageData {
  top_viewed_comics: Comic[];         // 10 comics xem nhiều nhất
  trending_comics: Comic[];           // 30 comics trending (hot)
  popular_comics: Comic[];            // 30 comics phổ biến (nổi bật)
  newest_comics: Comic[];             // 30 comics mới nhất
  recent_update_comics: Comic[];      // 10 comics có chapter mới cập nhật
  comic_categories: ComicCategory[];  // 20 comic categories
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  code: string;
  httpStatus: number;
  data: T;
  meta: object;
  timestamp: string;
}
```

**Ví dụ sử dụng:**
```typescript
// hooks/useHomepage.ts (React/Next.js)
import { useState, useEffect } from 'react';

export function useHomepage() {
  const [data, setData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchHomepage() {
      try {
        setLoading(true);
        const response = await fetch('/api/public/homepage');
        
        if (!response.ok) {
          throw new Error('Failed to fetch homepage data');
        }
        
        const result: ApiResponse<HomepageData> = await response.json();
        
        if (result.success && result.data) {
          setData(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch data');
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchHomepage();
  }, []);

  return { data, loading, error };
}

// Sử dụng trong component
function HomePage() {
  const { data, loading, error } = useHomepage();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return (
    <div>
      <TopViewedComics comics={data.top_viewed_comics} />
      <TrendingComics comics={data.trending_comics} />
      <PopularComics comics={data.popular_comics} />
      <NewestComics comics={data.newest_comics} />
      <RecentUpdateComics comics={data.recent_update_comics} />
      <ComicCategories categories={data.comic_categories} />
    </div>
  );
}
```

```javascript
// Vue.js Example
// composables/useHomepage.ts
import { ref, onMounted } from 'vue';

export function useHomepage() {
  const data = ref(null);
  const loading = ref(true);
  const error = ref(null);

  onMounted(async () => {
    try {
      loading.value = true;
      const response = await fetch('/api/public/homepage');
      
      if (!response.ok) {
        throw new Error('Failed to fetch homepage data');
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        data.value = result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  });

  return { data, loading, error };
}
```

**Clear cache (khi cần):**
```typescript
// Backend - Clear cache toàn bộ
await homepageService.clearAllCache();

// Backend - Clear cache theo block cụ thể
await homepageService.clearCacheBlock('NEWEST'); // Clear newest comics
await homepageService.clearCacheBlock('POPULAR'); // Clear popular comics

// Backend - Clear cache theo nhóm
await homepageService.clearComicsCache(); // Clear tất cả comics
await homepageService.clearChaptersCache(); // Clear chapters
await homepageService.clearCategoriesCache(); // Clear comic categories
```

**Khi nào nên clear cache:**
- **Clear NEWEST cache**: Khi có comic mới được publish
- **Clear LATEST_CHAPTERS cache**: Khi có chapter mới được publish (clear cache cho `recent_update_comics`)
- **Clear TOP_VIEWED/TRENDING cache**: Khi có update view_count đáng kể
- **Clear POPULAR cache**: Khi có update follow_count đáng kể
- **Clear COMIC_CATEGORIES cache**: Khi admin thêm/sửa/xóa comic category (rất hiếm, cache 12 giờ)

**Lưu ý:**
- Response structure là **flat** (không nested), tất cả fields ở cùng cấp
- `recent_update_comics` là danh sách **comics** có chapter mới cập nhật (không phải chapters)
- `comic_categories` không có field `status`, chỉ lấy tất cả categories

### Implementation 2: Parallel Requests (Frontend)

```javascript
// Frontend example
async function loadHomepageData() {
  const [comics, trending, popular, newest, chapters, comicCategories, postCategories, user] = await Promise.all([
    fetch('/api/public/comics?status=published&limit=10&sort_by=view_count&sort_order=DESC'),
    fetch('/api/public/comics/trending?limit=30'),
    fetch('/api/public/comics/popular?limit=30'),
    fetch('/api/public/comics/newest?limit=30'),
    fetch('/api/public/chapters?status=published&limit=10&sort_by=created_at&sort_order=DESC&include=comic'),
    fetch('/api/public/comic-categories?status=active&limit=20'),
    fetch('/api/public/post-categories?page=1&limit=20&status=active&sort=sort_order:ASC'),
    fetch('/api/users/me').catch(() => null) // Optional, don't fail if not logged in
  ]);
  
  // Process responses...
}
```

### Implementation 3: Caching với Redis

```typescript
// Sử dụng CacheService đã có sẵn
@Injectable()
export class HomepageService {
  private readonly CACHE_KEY = 'public:homepage';
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    // ... other services
  ) {}

  async getHomepageData(userId?: number) {
    return this.cacheService.getOrSet(
      this.CACHE_KEY,
      async () => {
        // Fetch all data in parallel
        const [comics, chapters, categories, user] = await Promise.all([
          this.fetchComics(),
          this.fetchChapters(),
          this.fetchCategories(),
          userId ? this.fetchUser(userId) : Promise.resolve(null)
        ]);
        
        return { comics, chapters, categories, user };
      },
      this.CACHE_TTL
    );
  }
}
```

## 📊 So sánh Performance

### Before (Sequential)
- Total requests: 8
- Estimated time: 8 × 200ms = **1.6s** (giả định mỗi request 200ms)

### After - Parallel Requests
- Total requests: 8
- Estimated time: **~200ms** (parallel)

### After - Combined Endpoint
- Total requests: 1
- Estimated time: **~300-400ms** (bao gồm xử lý phức tạp hơn)

### After - Combined + Cached
- Total requests: 1
- Estimated time: **~50-100ms** (nếu cache hit)

## 🔧 Best Practices

1. **Critical vs Non-critical data**
   - Load critical data (hero section) ngay lập tức
   - Lazy load các sections phía dưới

2. **Error Handling**
   - Nếu một API fail, không block các API khác
   - Show partial data + error message

3. **Progressive Enhancement**
   - Show skeleton/loading states
   - Render content khi data ready

4. **Cache Strategy**
   - Cache static data (categories) lâu hơn (1-24h)
   - Cache dynamic data (comics, chapters) ngắn hơn (5-15 phút)
   - Invalidate cache khi có update

5. **Monitoring**
   - Track API response times
   - Monitor cache hit rates
   - Track error rates

## 🎯 Recommendation

**Cho project này, tôi recommend:**

1. **Ngắn hạn**: Implement parallel requests ở frontend (giải pháp 2)
   - Nhanh, dễ implement
   - Cải thiện ngay lập tức

2. **Dài hạn**: Implement combined endpoint + caching (giải pháp 1 + 4)
   - Tối ưu tốt nhất
   - Dễ maintain và scale

3. **Optional**: Thêm lazy loading cho các sections không critical

