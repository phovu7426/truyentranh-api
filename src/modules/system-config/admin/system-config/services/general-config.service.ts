import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { UpdateGeneralConfigDto } from '../dtos/update-general-config.dto';
import { CacheService } from '@/common/services/cache.service';
import { toPlain } from '@/common/base/services/prisma/prisma.utils';

@Injectable()
export class GeneralConfigService {
  private readonly CACHE_KEY = 'public:general-config';

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async getConfig(): Promise<any> {
    const config = await this.prisma.generalConfig.findFirst({
      orderBy: { id: 'asc' },
    });

    return config ? toPlain(config) : null;
  }

  /**
   * Cập nhật cấu hình chung
   * Nếu chưa có thì tạo mới, nếu có thì update
   */
  async updateConfig(dto: UpdateGeneralConfigDto, updatedBy?: number): Promise<any> {
    const existing = await this.prisma.generalConfig.findFirst({
      orderBy: { id: 'asc' },
    });

    let result: any;

    if (!existing) {
      // Tạo mới từ DTO (không tạo mặc định cứng)
      const created = await this.prisma.generalConfig.create({
        data: {
          site_name: dto.site_name || 'My Website',
          site_description: dto.site_description,
          site_logo: dto.site_logo,
          site_favicon: dto.site_favicon,
          site_email: dto.site_email,
          site_phone: dto.site_phone,
          site_address: dto.site_address,
          site_copyright: dto.site_copyright,
          timezone: dto.timezone || 'Asia/Ho_Chi_Minh',
          locale: dto.locale || 'vi',
          currency: dto.currency || 'VND',
          ...(dto.contact_channels !== undefined && {
            contact_channels: (dto.contact_channels as unknown) as Prisma.InputJsonValue,
          }),
          meta_title: dto.meta_title,
          meta_keywords: dto.meta_keywords,
          og_title: dto.og_title,
          og_description: dto.og_description,
          og_image: dto.og_image,
          canonical_url: dto.canonical_url,
          google_analytics_id: dto.google_analytics_id,
          google_search_console: dto.google_search_console,
          facebook_pixel_id: dto.facebook_pixel_id,
          twitter_site: dto.twitter_site,
          created_user_id: updatedBy ? BigInt(updatedBy) : null,
          updated_user_id: updatedBy ? BigInt(updatedBy) : null,
        },
      });
      result = created;
    } else {
      // Update record hiện có
      const updateData: any = {
        site_name: dto.site_name,
        site_description: dto.site_description,
        site_logo: dto.site_logo,
        site_favicon: dto.site_favicon,
        site_email: dto.site_email,
        site_phone: dto.site_phone,
        site_address: dto.site_address,
        site_copyright: dto.site_copyright,
        timezone: dto.timezone,
        locale: dto.locale,
        currency: dto.currency,
        meta_title: dto.meta_title,
        meta_keywords: dto.meta_keywords,
        og_title: dto.og_title,
        og_description: dto.og_description,
        og_image: dto.og_image,
        canonical_url: dto.canonical_url,
        google_analytics_id: dto.google_analytics_id,
        google_search_console: dto.google_search_console,
        facebook_pixel_id: dto.facebook_pixel_id,
        twitter_site: dto.twitter_site,
        updated_user_id: updatedBy ? BigInt(updatedBy) : existing.updated_user_id,
      };

      if (dto.contact_channels !== undefined) {
        (updateData as any).contact_channels = dto.contact_channels as unknown as Prisma.InputJsonValue;
      }

      result = await this.prisma.generalConfig.update({
        where: { id: existing.id },
        data: updateData,
      });
    }

    if (!result) {
      throw new Error('Failed to create or update general config');
    }

    // Invalidate cache sau khi update
    if (this.cacheService && typeof this.cacheService.del === 'function') {
      await this.cacheService.del(this.CACHE_KEY);
    }

    return toPlain(result);
  }
}
