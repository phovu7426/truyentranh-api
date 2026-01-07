import { Injectable, ConflictException } from '@nestjs/common';
import { Prisma, BannerLocation } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';
import { PrismaCrudService, PrismaCrudBag } from '@/common/base/services/prisma/prisma-crud.service';

type BannerLocationBag = PrismaCrudBag & {
    Model: BannerLocation;
    Where: Prisma.BannerLocationWhereInput;
    Select: Prisma.BannerLocationSelect;
    Include: Prisma.BannerLocationInclude;
    OrderBy: Prisma.BannerLocationOrderByWithRelationInput;
    Create: Prisma.BannerLocationCreateInput;
    Update: Prisma.BannerLocationUpdateInput;
};

@Injectable()
export class BannerLocationService extends PrismaCrudService<BannerLocationBag> {
    constructor(
        private readonly prisma: PrismaService,
    ) {
        super(prisma.bannerLocation, ['id', 'created_at'], 'created_at:DESC');
    }

    /**
     * Hook: Validate code unique trước khi tạo
     */
    protected override async beforeCreate(createDto: BannerLocationBag['Create']): Promise<BannerLocationBag['Create']> {
        const payload = { ...createDto };

        if (payload.code) {
            const existingLocation = await this.prisma.bannerLocation.findFirst({
                where: { code: payload.code },
            });

            if (existingLocation) {
                throw new ConflictException(`Mã vị trí banner "${payload.code}" đã tồn tại`);
            }
        }

        return payload;
    }

    /**
     * Hook: Validate code unique trước khi cập nhật
     */
    protected override async beforeUpdate(
        where: Prisma.BannerLocationWhereInput,
        updateDto: BannerLocationBag['Update'],
    ): Promise<BannerLocationBag['Update']> {
        const payload = { ...updateDto };
        const id = (where as any).id ? BigInt((where as any).id) : null;
        const current = id
            ? await this.prisma.bannerLocation.findFirst({ where: { id } })
            : null;

        if (payload.code && payload.code !== current?.code) {
            const existingLocation = await this.prisma.bannerLocation.findFirst({
                where: { code: payload.code },
            });

            if (existingLocation) {
                throw new ConflictException(`Mã vị trí banner "${payload.code}" đã tồn tại`);
            }
        }

        return payload;
    }

    /**
     * Override prepareOptions để thêm sort mặc định
     */
    protected override prepareOptions(queryOptions: any = {}) {
        const base = super.prepareOptions(queryOptions);

        const orderBy: Prisma.BannerLocationOrderByWithRelationInput[] = queryOptions?.orderBy ?? [
            { created_at: 'desc' },
        ];

        return {
            ...base,
            orderBy,
        };
    }

    /**
     * Thay đổi trạng thái banner location
     */
    async changeStatus(id: number, status: BasicStatus) {
        return this.update({ id: BigInt(id) } as any, { status: status as any } as any);
    }

  /**
   * Simple list tương tự getList nhưng limit mặc định lớn hơn
   */
  async getSimpleList(filters?: Prisma.BannerLocationWhereInput, options?: any) {
    const simpleOptions = {
      ...options,
      limit: options?.limit ?? 50,
      maxLimit: options?.maxLimit ?? 1000,
    };
    return this.getList(filters, simpleOptions);
  }
}
