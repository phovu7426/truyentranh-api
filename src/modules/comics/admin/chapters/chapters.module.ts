import { Module } from '@nestjs/common';
import { ChaptersController } from '@/modules/comics/admin/chapters/controllers/chapters.controller';
import { ChaptersService } from '@/modules/comics/admin/chapters/services/chapters.service';
import { RbacModule } from '@/modules/rbac/rbac.module';
import { FileUploadModule } from '@/modules/file-upload/file-upload.module';
import { ComicNotificationService } from '@/modules/comics/core/services/comic-notification.service';

@Module({
  imports: [
    RbacModule,
    FileUploadModule,
  ],
  controllers: [ChaptersController],
  providers: [ChaptersService, ComicNotificationService],
  exports: [ChaptersService, ComicNotificationService],
})
export class AdminChaptersModule {}

