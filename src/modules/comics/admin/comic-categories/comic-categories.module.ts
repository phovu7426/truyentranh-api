import { Module } from '@nestjs/common';
import { ComicCategoriesController } from '@/modules/comics/admin/comic-categories/controllers/comic-categories.controller';
import { ComicCategoriesService } from '@/modules/comics/admin/comic-categories/services/comic-categories.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    RbacModule,
  ],
  controllers: [ComicCategoriesController],
  providers: [ComicCategoriesService],
  exports: [ComicCategoriesService],
})
export class AdminComicCategoriesModule {}



