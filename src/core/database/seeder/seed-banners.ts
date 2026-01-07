import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';
import { BannerLinkTarget } from '@/shared/enums/types/banner-link-target.enum';

@Injectable()
export class SeedBanners {
    private readonly logger = new Logger(SeedBanners.name);

    constructor(private readonly prisma: PrismaService) { }

    async seed(): Promise<void> {
        this.logger.log('Seeding banners...');

        // Check if banners already exist
        const existingCount = await this.prisma.banner.count();
        if (existingCount > 0) {
            this.logger.log(`Banners already exist (${existingCount} records). Skipping seeding.`);
            return;
        }

        // Get admin user for audit fields
        const adminUser = await this.prisma.user.findFirst({ where: { username: 'admin' } });
        const defaultUserId = adminUser ? Number(adminUser.id) : 1;

        // Get banner locations
        const homeSliderLocation = await this.prisma.bannerLocation.findFirst({
            where: { code: 'home_slider' },
        });
        const productPageLocation = await this.prisma.bannerLocation.findFirst({
            where: { code: 'product_page_banner' },
        });
        const aboutUsLocation = await this.prisma.bannerLocation.findFirst({
            where: { code: 'about_us_banner' },
        });
        const blogLocation = await this.prisma.bannerLocation.findFirst({
            where: { code: 'blog_banner' },
        });

        if (!homeSliderLocation || !productPageLocation || !aboutUsLocation || !blogLocation) {
            this.logger.error('Required banner locations not found. Please run banner locations seeder first.');
            return;
        }

        const banners = [
            // Home slider banners
            {
                title: 'Khuyến mãi đặc biệt',
                subtitle: 'Giảm giá đến 50%',
                image: '/uploads/banners/home-slider-1.jpg',
                mobile_image: '/uploads/banners/home-slider-1-mobile.jpg',
                link: '/products?sale=true',
                link_target: BannerLinkTarget.SELF,
                description: 'Khuyến mãi đặc biệt cho các sản phẩm nổi bật',
                button_text: 'Xem ngay',
                button_color: '#ff6b6b',
                text_color: '#ffffff',
                location_id: Number(homeSliderLocation.id),
                sort_order: 1,
                status: BasicStatus.active,
            },
            {
                title: 'Sản phẩm mới',
                subtitle: 'Bộ sưu tập mới nhất',
                image: '/uploads/banners/home-slider-2.jpg',
                mobile_image: '/uploads/banners/home-slider-2-mobile.jpg',
                link: '/products?new=true',
                link_target: BannerLinkTarget.SELF,
                description: 'Khám phá bộ sưu tập sản phẩm mới nhất',
                button_text: 'Khám phá',
                button_color: '#4ecdc4',
                text_color: '#ffffff',
                location_id: Number(homeSliderLocation.id),
                sort_order: 2,
                status: BasicStatus.active,
            },
            {
                title: 'Miễn phí vận chuyển',
                subtitle: 'Cho đơn hàng từ 500k',
                image: '/uploads/banners/home-slider-3.jpg',
                mobile_image: '/uploads/banners/home-slider-3-mobile.jpg',
                link: '/products',
                link_target: BannerLinkTarget.SELF,
                description: 'Miễn phí vận chuyển cho các đơn hàng từ 500.000đ',
                button_text: 'Mua sắm',
                button_color: '#45b7d1',
                text_color: '#ffffff',
                location_id: Number(homeSliderLocation.id),
                sort_order: 3,
                status: BasicStatus.active,
            },
            // Product page banners
            {
                title: 'Flash Sale',
                subtitle: 'Giảm giá sốc',
                image: '/uploads/banners/product-page-1.jpg',
                mobile_image: '/uploads/banners/product-page-1-mobile.jpg',
                link: '/products?flash=true',
                link_target: BannerLinkTarget.SELF,
                description: 'Flash sale hàng tuần với giá cực sốc',
                button_text: 'Săn sale',
                button_color: '#e74c3c',
                text_color: '#ffffff',
                location_id: Number(productPageLocation.id),
                sort_order: 1,
                status: BasicStatus.active,
            },
            // About us banner
            {
                title: 'Về chúng tôi',
                subtitle: 'Câu chuyện thương hiệu',
                image: '/uploads/banners/about-us-1.jpg',
                mobile_image: '/uploads/banners/about-us-1-mobile.jpg',
                link: '/about',
                link_target: BannerLinkTarget.SELF,
                description: 'Tìm hiểu về câu chuyện và sứ mệnh của chúng tôi',
                button_text: 'Tìm hiểu thêm',
                button_color: '#9b59b6',
                text_color: '#ffffff',
                location_id: Number(aboutUsLocation.id),
                sort_order: 1,
                status: BasicStatus.active,
            },
            // Blog banners
            {
                title: 'Tin tức mới nhất',
                subtitle: 'Cập nhật hàng ngày',
                image: '/uploads/banners/blog-1.jpg',
                mobile_image: '/uploads/banners/blog-1-mobile.jpg',
                link: '/blog',
                link_target: BannerLinkTarget.SELF,
                description: 'Đọc các bài viết mới nhất về thời trang và xu hướng',
                button_text: 'Đọc ngay',
                button_color: '#3498db',
                text_color: '#ffffff',
                location_id: Number(blogLocation.id),
                sort_order: 1,
                status: BasicStatus.active,
            },
            {
                title: 'Hướng dẫn chọn size',
                subtitle: 'Tìm size hoàn hảo',
                image: '/uploads/banners/blog-2.jpg',
                mobile_image: '/uploads/banners/blog-2-mobile.jpg',
                link: '/blog/size-guide',
                link_target: BannerLinkTarget.SELF,
                description: 'Hướng dẫn chi tiết cách chọn size quần áo phù hợp',
                button_text: 'Xem ngay',
                button_color: '#2ecc71',
                text_color: '#ffffff',
                location_id: Number(blogLocation.id),
                sort_order: 2,
                status: BasicStatus.active,
            },
        ];

        for (const bannerData of banners) {
            await this.prisma.banner.create({
                data: {
                    ...bannerData,
                },
            });
            this.logger.log(`Created banner: ${bannerData.title} for location ${bannerData.location_id}`);
        }

        this.logger.log(`Banners seeding completed. Created ${banners.length} banners.`);
    }
}