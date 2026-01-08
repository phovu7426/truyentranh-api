import { Module } from '@nestjs/common';

// Import admin modules
import { AdminComicsModule } from '@/modules/comics/admin/comics/comics.module';
import { AdminComicCategoriesModule } from '@/modules/comics/admin/comic-categories/comic-categories.module';
import { AdminChaptersModule } from '@/modules/comics/admin/chapters/chapters.module';
import { ModerationModule } from '@/modules/comics/admin/moderation/moderation.module';
import { AnalyticsModule } from '@/modules/comics/admin/analytics/analytics.module';
import { AdminCommentsModule } from '@/modules/comics/admin/comments/comments.module';
import { AdminReviewsModule } from '@/modules/comics/admin/reviews/reviews.module';

// Import public modules
import { PublicComicsModule } from '@/modules/comics/public/comics/comics.module';
import { PublicChaptersModule } from '@/modules/comics/public/chapters/chapters.module';
import { PublicCommentsModule } from '@/modules/comics/public/comments/comments.module';
import { PublicReviewsModule } from '@/modules/comics/public/reviews/reviews.module';
import { PublicComicCategoriesModule } from '@/modules/comics/public/comic-categories/comic-categories.module';
import { StatsModule } from '@/modules/comics/public/stats/stats.module';
import { HomepageModule } from '@/modules/comics/public/homepage/homepage.module';

// Import user modules
import { UserReadingHistoryModule } from '@/modules/comics/user/reading-history/reading-history.module';
import { UserBookmarksModule } from '@/modules/comics/user/bookmarks/bookmarks.module';
import { UserFollowsModule } from '@/modules/comics/user/follows/follows.module';
import { UserReviewsModule } from '@/modules/comics/user/reviews/reviews.module';
import { UserCommentsModule } from '@/modules/comics/user/comments/comments.module';
import { DashboardModule } from '@/modules/comics/user/dashboard/dashboard.module';
import { ComicNotificationService } from '@/modules/comics/core/services/comic-notification.service';

@Module({
  imports: [
    // Admin modules
    AdminComicsModule,
    AdminComicCategoriesModule,
    AdminChaptersModule,
    ModerationModule,
    AnalyticsModule,
    AdminCommentsModule,
    AdminReviewsModule,
    // Public modules
    PublicComicsModule,
    PublicChaptersModule,
    PublicCommentsModule,
    PublicReviewsModule,
    PublicComicCategoriesModule,
    StatsModule,
    HomepageModule,
    // User modules
    UserReadingHistoryModule,
    UserBookmarksModule,
    UserFollowsModule,
    UserReviewsModule,
    UserCommentsModule,
    DashboardModule,
  ],
  providers: [
    ComicNotificationService,
  ],
  exports: [
    ComicNotificationService,
  ],
})
export class ComicsModule {}

