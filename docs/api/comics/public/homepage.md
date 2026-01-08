# Homepage API - Tích hợp cho trang chủ

API kết hợp tất cả dữ liệu cần thiết cho trang chủ vào một endpoint duy nhất.

## 📋 Tổng quan

- **Base URL**: `http://localhost:3000/api/public/homepage`
- **Authentication**: Không yêu cầu (Public endpoint)
- **Method**: `GET`
- **Response**: JSON

## 🚀 Endpoint

### GET /public/homepage

Lấy tất cả dữ liệu cần thiết cho trang chủ trong một request duy nhất.

#### Request

```bash
curl -X GET "http://localhost:3000/api/public/homepage" \
  -H "Content-Type: application/json"
```

**Không cần query parameters.**

#### Response

**Success (200):**

```json
{
  "success": true,
  "message": "Success",
  "code": "SUCCESS",
  "httpStatus": 200,
  "data": {
    "top_viewed_comics": [
        {
          "id": 1,
          "slug": "truyen-tranh-mau",
          "title": "Truyện Tranh Mẫu",
          "description": "Mô tả truyện...",
          "cover_image": "https://example.com/cover.jpg",
          "author": "Tác giả",
          "status": "published",
          "created_at": "2025-01-11T05:00:00.000Z",
          "categories": [
            {
              "id": 1,
              "name": "Hành động",
              "slug": "hanh-dong"
            }
          ],
          "stats": {
            "view_count": 10000,
            "follow_count": 500,
            "chapter_count": 10
          }
        }
      ],
    "trending_comics": [...],  // 30 comics đang hot - sort by view_count:DESC
    "popular_comics": [...],   // 30 comics phổ biến - sort by follow_count:DESC
    "newest_comics": [...],    // 30 comics mới nhất - sort by created_at:DESC
    "recent_update_comics": [
        {
          "id": 1,
          "slug": "truyen-tranh-mau",
          "title": "Truyện Tranh Mẫu",
          "description": "Mô tả truyện...",
          "cover_image": "https://example.com/cover.jpg",
          "author": "Tác giả",
          "categories": [...],
          "stats": {...},
          "last_chapter": {
            "id": 123,
            "title": "Chương 50: Cao trào",
            "chapter_index": 50,
            "chapter_label": "Chapter 50",
            "created_at": "2025-01-11T05:00:00.000Z"
          }
        }
      ],
    "comic_categories": [
        {
          "id": 1,
          "name": "Hành động",
          "slug": "hanh-dong",
          "description": "Mô tả danh mục",
          "created_at": "2025-01-11T05:00:00.000Z"
        }
      ]
    }
  },
  "meta": {},
  "timestamp": "2026-01-08T10:52:30+07:00"
}
```

## 📊 Cấu trúc dữ liệu

### 1. Comics

#### `top_viewed` (10 items)
- **Mô tả**: Top 10 truyện được xem nhiều nhất
- **Sort**: `view_count:DESC`
- **Cache**: 7 phút

#### `trending` (30 items)
- **Mô tả**: Truyện đang hot (trending)
- **Sort**: `view_count:DESC`
- **Cache**: 7 phút

#### `popular` (30 items)
- **Mô tả**: Truyện nổi bật (phổ biến)
- **Sort**: `follow_count:DESC`
- **Cache**: 20 phút

#### `newest` (30 items)
- **Mô tả**: Truyện mới nhất
- **Sort**: `created_at:DESC`
- **Cache**: 2 phút

### 2. Chapters

#### `latest` (10 items)
- **Mô tả**: 10 chương mới nhất
- **Sort**: `created_at:DESC`
- **Include**: `comic` (thông tin truyện)
- **Cache**: 2 phút

### 3. Categories

#### `comic_categories` (20 items)
- **Mô tả**: Danh sách danh mục truyện
- **Cache**: 12 giờ

## 🔧 Cache Strategy

Mỗi block được cache riêng với TTL khác nhau:

| Block | Cache Key | TTL | Lý do |
|-------|-----------|-----|-------|
| Truyện nổi bật (Popular) | `public:homepage:comics:popular` | 20 phút | Thay đổi chậm |
| Truyện hot (Trending) | `public:homepage:comics:trending` | 7 phút | Thay đổi nhanh hơn |
| Top viewed | `public:homepage:comics:top_viewed` | 7 phút | Thay đổi nhanh hơn |
| Truyện mới (Newest) | `public:homepage:comics:newest` | 2 phút | Thay đổi liên tục |
| Chapters mới nhất | `public:homepage:chapters:latest` | 2 phút | Thay đổi liên tục |
| Danh mục Comic | `public:homepage:categories:comic` | 12 giờ | Rất ít thay đổi |

## 💻 Frontend Integration

### React/Next.js Example

```typescript
// hooks/useHomepage.ts
import { useState, useEffect } from 'react';

interface HomepageData {
  comics: {
    top_viewed: any[];
    trending: any[];
    popular: any[];
    newest: any[];
  };
  chapters: {
    latest: any[];
  };
  categories: {
    comic_categories: any[];
  };
}

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
        
        const result = await response.json();
        setData(result.data);
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
```

### Vue.js Example

```typescript
// composables/useHomepage.ts
import { ref, onMounted } from 'vue';

export function useHomepage() {
  const data = ref(null);
  const loading = ref(true);
  const error = ref(null);

  const fetchHomepage = async () => {
    try {
      loading.value = true;
      const response = await fetch('/api/public/homepage');
      
      if (!response.ok) {
        throw new Error('Failed to fetch homepage data');
      }
      
      const result = await response.json();
      data.value = result.data;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    fetchHomepage();
  });

  return { data, loading, error, refetch: fetchHomepage };
}
```

### Vanilla JavaScript Example

```javascript
// fetchHomepage.js
async function fetchHomepage() {
  try {
    const response = await fetch('/api/public/homepage');
    
    if (!response.ok) {
      throw new Error('Failed to fetch homepage data');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching homepage:', error);
    throw error;
  }
}

// Usage
fetchHomepage().then(data => {
  // Render comics.top_viewed
  // Render comics.trending
  // Render comics.popular
  // Render comics.newest
  // Render chapters.latest
  // Render categories.comic_categories
});
```

## 📱 Component Example

### React Component

```tsx
// components/HomePage.tsx
import { useHomepage } from '@/hooks/useHomepage';

export function HomePage() {
  const { data, loading, error } = useHomepage();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return (
    <div>
      {/* Hero Section - Top Viewed */}
      <section>
        <h2>Top Viewed</h2>
        <div className="comics-grid">
          {data.comics.top_viewed.map(comic => (
            <ComicCard key={comic.id} comic={comic} />
          ))}
        </div>
      </section>

      {/* Trending Section */}
      <section>
        <h2>Trending</h2>
        <div className="comics-grid">
          {data.comics.trending.map(comic => (
            <ComicCard key={comic.id} comic={comic} />
          ))}
        </div>
      </section>

      {/* Popular Section */}
      <section>
        <h2>Popular</h2>
        <div className="comics-grid">
          {data.comics.popular.map(comic => (
            <ComicCard key={comic.id} comic={comic} />
          ))}
        </div>
      </section>

      {/* Newest Section */}
      <section>
        <h2>Newest</h2>
        <div className="comics-grid">
          {data.comics.newest.map(comic => (
            <ComicCard key={comic.id} comic={comic} />
          ))}
        </div>
      </section>

      {/* Latest Chapters */}
      <section>
        <h2>Latest Chapters</h2>
        <div className="chapters-list">
          {data.chapters.latest.map(chapter => (
            <ChapterCard key={chapter.id} chapter={chapter} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2>Categories</h2>
        <div className="categories-list">
          {data.categories.comic_categories.map(category => (
            <CategoryLink key={category.id} category={category} />
          ))}
        </div>
      </section>
    </div>
  );
}
```

## ⚡ Performance Tips

1. **Sử dụng Cache**: API đã được cache, không cần implement thêm cache ở frontend
2. **Lazy Loading**: Có thể lazy load các sections phía dưới để tối ưu initial load
3. **Error Handling**: Luôn xử lý lỗi khi gọi API
4. **Loading States**: Hiển thị skeleton/loading khi đang fetch data

## 🔄 Refresh Data

Nếu cần refresh data (bỏ qua cache):

```typescript
// Thêm timestamp để force refresh (không khuyến khích)
const response = await fetch(`/api/public/homepage?_t=${Date.now()}`);
```

**Lưu ý**: API đã có cache tự động, không nên force refresh thường xuyên vì sẽ giảm hiệu suất.

## 📝 Lưu ý

- API `/users/me` cần gọi riêng nếu cần thông tin user
- Tất cả dữ liệu trả về đều là public (đã được filter status)
- Cache tự động invalidate sau TTL tương ứng
- Không cần query parameters

## 🐛 Error Handling

```typescript
try {
  const response = await fetch('/api/public/homepage');
  
  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error.message);
    // Handle error appropriately
    return;
  }
  
  const result = await response.json();
  // Use result.data
} catch (error) {
  console.error('Network error:', error);
  // Handle network error
}
```

## 📚 Related APIs

- [Comics API](./comics.md) - Chi tiết API truyện
- [Chapters API](./chapters.md) - Chi tiết API chương
- [Categories API](../comic-categories.md) - Chi tiết API danh mục
- [User API](../../user-management/user/user.md) - API thông tin user

