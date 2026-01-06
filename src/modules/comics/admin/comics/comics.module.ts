import { Module } from '@nestjs/common';
import { ComicsController } from '@/modules/comics/admin/comics/controllers/comics.controller';
import { ComicsService } from '@/modules/comics/admin/comics/services/comics.service';
import { RbacModule } from '@/modules/rbac/rbac.module';
import { FileUploadModule } from '@/modules/file-upload/file-upload.module';

@Module({
  imports: [
    RbacModule,
    FileUploadModule,
  ],
  controllers: [ComicsController],
  providers: [ComicsService],
  exports: [ComicsService],
})
export class AdminComicsModule {}

