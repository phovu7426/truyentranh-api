import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Banner } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { PrismaCrudService, PrismaCrudBag } from '@/common/base/services/prisma/prisma-crud.service';

type AdminBannerBag = PrismaCrudBag & {
    Model: Banner;
    Where: Prisma.BannerWhereInput;
    Select: Prisma.BannerSelect;
    Include: Prisma.BannerInclude;
    OrderBy: Prisma.BannerOrderByWithRelationInput;
    Create: Prisma.BannerCreateInput;
    Update: Prisma.BannerUpdateInput;
};

@Injectable()
export class BannerService extends PrismaCrudService<AdminBannerBag> {
    constructor(
        private readonly prisma: PrismaService,
    ) {
        super(prisma.banner, ['id', 'created_at', 'sort_order'], 'id:DESC');
    }

    /**
     * Hook: Validate location_id trước khi tạo banner
     */
    protected override async beforeCreate(createDto: AdminBannerBag['Create']): Promise<AdminBannerBag['Create']> {
        const payload = { ...createDto };

        if (payload.location_id) {
            const location = await this.prisma.bannerLocation.findFirst({
                where: { id: BigInt(payload.location_id) },
            });

            if (!location) {
                throw new NotFoundException(`Vị trí banner với ID ${payload.location_id} không tồn tại`);
            }
        }

        return payload;
    }

    /**
     * Hook: Validate location_id trước khi cập nhật banner
     */
    protected override async beforeUpdate(where: Prisma.BannerWhereInput, updateDto: AdminBannerBag['Update']): Promise<AdminBannerBag['Update']> {
        const payload = { ...updateDto };
        const id = (where as any).id ? BigInt((where as any).id) : null;
        const current = id
            ? await this.prisma.banner.findFirst({ where: { id } })
            : null;

        if (payload.location_id && (!current || payload.location_id !== Number(current.location_id))) {
            const location = await this.prisma.bannerLocation.findFirst({
                where: { id: BigInt(payload.location_id) },
            });

            if (!location) {
                throw new NotFoundException(`Vị trí banner với ID ${payload.location_id} không tồn tại`);
            }
        }

        return payload;
    }

    /**
     * Override prepareFilters: Nếu filter theo status Active, thêm date range filter
     * Admin xem tất cả banners, nhưng khi lọc Active thì cần check date range
     */
    protected override async prepareFilters(
        filters?: Prisma.BannerWhereInput,
    ): Promise<Prisma.BannerWhereInput | true | undefined> {
        const prepared: Prisma.BannerWhereInput = { ...(filters || {}) };

        if ((prepared as any).status === BasicStatus.Active) {
            const now = new Date();
            prepared.start_date = {
                lte: now,
            } as any;
            prepared.end_date = {
                gte: now,
            } as any;
        }

        return prepared;
    }

    /**
     * Override prepareOptions để thêm relations và sort mặc định
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

    /**
     * Lấy banner theo location code
     */
    async findByLocationCode(locationCode: string): Promise<AdminBannerBag['Model'][]> {
        const location = await this.prisma.bannerLocation.findFirst({
            where: { code: locationCode, status: BasicStatus.Active as any },
        });

        if (!location) {
            throw new NotFoundException(`Vị trí banner với mã "${locationCode}" không tồn tại hoặc không hoạt động`);
        }

        // Tận dụng getList với filters (date range sẽ được filter ở DB level)
        const result = await this.getList(
            { location_id: location.id, status: BasicStatus.Active as any } as any,
            { limit: 1000, page: 1 },
        );

        return result.data;
    }

    /**
     * Thay đổi trạng thái banner
     */
    async changeStatus(id: number, status: BasicStatus) {
        return this.update({ id: BigInt(id) } as any, { status: status as any } as any);
    }

    /**
     * Cập nhật thứ tự sắp xếp banner
     */
    async updateSortOrder(id: number, sortOrder: number) {
        return this.update({ id: BigInt(id) } as any, { sort_order: sortOrder } as any);
    }

    /**
     * Simple list tương tự getList nhưng limit mặc định lớn hơn
     */
    async getSimpleList(filters?: Prisma.BannerWhereInput, options?: any) {
        const simpleOptions = {
            ...options,
            limit: options?.limit ?? 50,
            maxLimit: options?.maxLimit ?? 1000,
        };
        return this.getList(filters, simpleOptions);
    }
}
