import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';

@Injectable()
export class SeedBannerLocations {
    private readonly logger = new Logger(SeedBannerLocations.name);

    constructor(private readonly prisma: PrismaService) { }

    async seed(): Promise<void> {
        this.logger.log('Seeding banner locations...');

        // Check if banner locations already exist
        const existingCount = await this.prisma.bannerLocation.count();
        if (existingCount > 0) {
            this.logger.log(`Banner locations already exist (${existingCount} records). Skipping seeding.`);
            return;
        }

        // Get admin user for audit fields
        const adminUser = await this.prisma.user.findFirst({ where: { username: 'admin' } });
        const defaultUserId = adminUser ? Number(adminUser.id) : 1;

        const bannerLocations = [
            {
                code: 'home_slider',
                name: 'Slider trang chủ',
                description: 'Slider hiển thị ở trang chủ',
                status: BasicStatus.active,
            },
            {
                code: 'product_page_banner',
                name: 'Banner trang sản phẩm',
                description: 'Banner hiển thị ở trang danh sách sản phẩm',
                status: BasicStatus.active,
            },
            {
                code: 'product_detail_banner',
                name: 'Banner chi tiết sản phẩm',
                description: 'Banner hiển thị ở trang chi tiết sản phẩm',
                status: BasicStatus.active,
            },
            {
                code: 'about_us_banner',
                name: 'Banner giới thiệu',
                description: 'Banner hiển thị ở trang giới thiệu',
                status: BasicStatus.active,
            },
            {
                code: 'contact_banner',
                name: 'Banner liên hệ',
                description: 'Banner hiển thị ở trang liên hệ',
                status: BasicStatus.active,
            },
            {
                code: 'blog_banner',
                name: 'Banner blog',
                description: 'Banner hiển thị ở trang blog',
                status: BasicStatus.active,
            },
            {
                code: 'checkout_banner',
                name: 'Banner thanh toán',
                description: 'Banner hiển thị ở trang thanh toán',
                status: BasicStatus.active,
            },
            {
                code: 'sidebar_banner',
                name: 'Banner sidebar',
                description: 'Banner hiển thị ở sidebar',
                status: BasicStatus.active,
            },
        ];

        for (const bannerLocationData of bannerLocations) {
            await this.prisma.bannerLocation.create({
                data: {
                    ...bannerLocationData,
                },
            });
            this.logger.log(`Created banner location: ${bannerLocationData.name} (${bannerLocationData.code})`);
        }

        this.logger.log(`Banner locations seeding completed. Created ${bannerLocations.length} banner locations.`);
    }
}