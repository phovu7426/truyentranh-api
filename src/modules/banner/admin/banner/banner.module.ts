import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannerService } from '@/modules/banner/admin/banner/services/banner.service';
import { BannerController } from '@/modules/banner/admin/banner/controllers/banner.controller';
import { Banner } from '@/shared/entities/banner.entity';
import { BannerLocation } from '@/shared/entities/banner-location.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Banner, BannerLocation])],
    controllers: [BannerController],
    providers: [BannerService],
    exports: [BannerService],
})
export class AdminBannerModule { }