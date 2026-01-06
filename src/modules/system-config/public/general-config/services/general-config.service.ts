import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { CacheService } from '@/common/services/cache.service';
import { toPlain } from '@/common/base/services/prisma/prisma.utils';

@Injectable()
export class PublicGeneralConfigService {
  private readonly CACHE_KEY = 'public:general-config';
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Lấy cấu hình chung (có cache)
   * Dùng cho public API
   */
  async getConfig(): Promise<any> {
    return this.cacheService.getOrSet<any>(
      this.CACHE_KEY,
      async () => {
        const config = await this.prisma.generalConfig.findFirst({
          orderBy: { id: 'asc' },
        });

        return config ? toPlain(config) : null;
      },
      this.CACHE_TTL,
    );
  }

  /**
   * Xóa cache (được gọi khi admin update config)
   */
  async clearCache(): Promise<void> {
    await this.cacheService.del(this.CACHE_KEY);
  }
}
