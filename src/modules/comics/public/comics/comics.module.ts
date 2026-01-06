import { Module } from '@nestjs/common';
import { PublicComicsController } from '@/modules/comics/public/comics/controllers/comics.controller';
import { PublicComicsService } from '@/modules/comics/public/comics/services/comics.service';

@Module({
  imports: [],
  controllers: [PublicComicsController],
  providers: [PublicComicsService],
  exports: [PublicComicsService],
})
export class PublicComicsModule {}

