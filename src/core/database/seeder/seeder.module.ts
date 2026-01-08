import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/database/prisma/prisma.module';
import { SeedService } from '@/core/database/seeder/seed-data';
import { SeedPermissions } from '@/core/database/seeder/seed-permissions';
import { SeedRoles } from '@/core/database/seeder/seed-roles';
import { SeedUsers } from '@/core/database/seeder/seed-users';
import { SeedPostCategories } from '@/core/database/seeder/seed-post-categories';
import { SeedPostTags } from '@/core/database/seeder/seed-post-tags';
import { SeedPosts } from '@/core/database/seeder/seed-posts';
import { SeedMenus } from '@/core/database/seeder/seed-menus';
import { SeedBannerLocations } from '@/core/database/seeder/seed-banner-locations';
import { SeedBanners } from '@/core/database/seeder/seed-banners';
import { SeedContacts } from '@/core/database/seeder/seed-contacts';
import { SeedGeneralConfigs } from '@/core/database/seeder/seed-general-configs';
import { SeedEmailConfigs } from '@/core/database/seeder/seed-email-configs';
import { SeedGroups } from '@/core/database/seeder/seed-groups';
import { SeedComicCategories } from '@/core/database/seeder/seed-comic-categories';
import { SeedComics } from '@/core/database/seeder/seed-comics';
import { SeedChapters } from '@/core/database/seeder/seed-chapters';
import { SeedComicLastChapter } from '@/core/database/seeder/seed-comic-last-chapter';

@Module({
  imports: [PrismaModule],
  providers: [
    // Main seed service
    SeedService,
    // Individual seeders
    SeedPermissions,
    SeedRoles,
    SeedUsers,
    SeedPostCategories,
    SeedPostTags,
    SeedPosts,
    SeedMenus,
    SeedBannerLocations,
    SeedBanners,
    SeedContacts,
    SeedGeneralConfigs,
    SeedEmailConfigs,
    SeedGroups,
    SeedComicCategories,
    SeedComics,
    SeedChapters,
    SeedComicLastChapter,
  ],
  exports: [SeedService],
})
export class SeederModule {}

