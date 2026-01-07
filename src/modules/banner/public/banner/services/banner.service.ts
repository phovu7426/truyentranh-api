import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Banner, BannerLocation } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';
import { PrismaListService, PrismaListBag } from '@/common/base/services/prisma/prisma-list.service';

type PublicBannerBag = PrismaListBag & {
    Model: Banner;
    Where: Prisma.BannerWhereInput;
    Select: Prisma.BannerSelect;
    Include: Prisma.BannerInclude;
    OrderBy: Prisma.BannerOrderByWithRelationInput;
};

@Injectable()
export class PublicBannerService extends PrismaListService<PublicBannerBag> {
    constructor(
        private readonly prisma: PrismaService,
    ) {
        super(prisma.banner, ['id', 'created_at', 'sort_order'], 'id:DESC');
    }

    /**
     * Override prepareFilters để thêm filter active banners + date range
     * Lọc: status = active, start_date <= now, end_date >= now (hoặc null)
     */
    protected override async prepareFilters(
        filters?: Prisma.BannerWhereInput,
    ): Promise<Prisma.BannerWhereInput | true | undefined> {
        const now = new Date();
        const prepared: Prisma.BannerWhereInput = {
            ...(filters || {}),
            status: BasicStatus.active as any,
            start_date: {
                lte: now,
            } as any,
            end_date: {
                gte: now,
            } as any,
        };

        return prepared;
    }

    /**
     * Override prepareOptions để set default sort
     */
    protected override prepareOptions(queryOptions: any = {}) {
        const base = super.prepareOptions(queryOptions);

        const include: Prisma.BannerInclude = queryOptions?.include ?? {
            location: true,
        };

        const orderBy: Prisma.BannerOrderByWithRelationInput[] = queryOptions?.orderBy ?? [
            { sort_order: 'asc' },
            { created_at: 'desc' },
        ];

        return {
            ...base,
            include,
            orderBy,
        };
    }

    async findByLocationCode(locationCode: string): Promise<PublicBannerBag['Model'][]> {
        const location = await this.prisma.bannerLocation.findFirst({
            where: {
                code: locationCode,
                status: BasicStatus.active as any,
            },
        });

        if (!location) {
            throw new NotFoundException(`Vị trí banner với mã "${locationCode}" không tồn tại hoặc không hoạt động`);
        }

        // Tận dụng getList với filters
        const result = await this.getList(
            { location_id: location.id } as any,
            { limit: 1000, page: 1 },
        );

        return result.data;
    }

    async findActiveBanners(locationCode?: string): Promise<{
        [locationCode: string]: PublicBannerBag['Model'][];
    }> {
        const where: Prisma.BannerLocationWhereInput = {
            status: BasicStatus.active as any,
            ...(locationCode ? { code: locationCode } : {}),
        };

        const locations = await this.prisma.bannerLocation.findMany({
            where,
        });

        const result: { [locationCode: string]: PublicBannerBag['Model'][] } = {};

        // Tận dụng getList cho mỗi location
        for (const location of locations) {
            const bannerResult = await this.getList(
                { location_id: location.id } as any,
                { limit: 1000, page: 1 },
            );

            if (bannerResult.data.length > 0) {
                result[location.code] = bannerResult.data;
            }
        }

        return result;
    }

    async findBannerById(id: number): Promise<PublicBannerBag['Model']> {
        // Tận dụng getOne với relations và filters
        const banner = await this.getOne(
            { id: BigInt(id), status: BasicStatus.active as any } as any,
            {
                include: {
                    location: true,
                },
            },
        );

        if (!banner) {
            throw new NotFoundException(`Banner với ID ${id} không tồn tại hoặc không hoạt động`);
        }

        return banner;
    }
}