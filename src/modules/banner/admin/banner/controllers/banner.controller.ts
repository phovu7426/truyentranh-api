import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    Query,
    ValidationPipe,
} from '@nestjs/common';
import { BannerService } from '@/modules/banner/admin/banner/services/banner.service';
import { CreateBannerDto } from '@/modules/banner/admin/banner/dtos/create-banner.dto';
import { UpdateBannerDto } from '@/modules/banner/admin/banner/dtos/update-banner.dto';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('admin/banners')
export class BannerController {
    constructor(private readonly bannerService: BannerService) { }

    @LogRequest()
    @Post()
    create(@Body(ValidationPipe) createBannerDto: CreateBannerDto) {
        return this.bannerService.create(createBannerDto);
    }

    @Get()
    findAll(@Query(ValidationPipe) query: any) {
        const { filters, options } = prepareQuery(query);
        return this.bannerService.getList(filters, options);
    }

    @Get('simple')
    getSimpleList(@Query(ValidationPipe) query: any) {
        const { filters, options } = prepareQuery(query);
        return this.bannerService.getSimpleList(filters, options);
    }

    // Specific routes MUST come before parameterized routes
    @Get('location/:locationCode')
    findByLocationCode(@Param('locationCode') locationCode: string) {
        return this.bannerService.findByLocationCode(locationCode);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.bannerService.getOne({ id: +id } as any);
    }

    @LogRequest()
    @Put(':id')
    update(
        @Param('id') id: string,
        @Body(ValidationPipe) updateBannerDto: UpdateBannerDto,
    ) {
        return this.bannerService.update(+id, updateBannerDto);
    }

    @LogRequest()
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.bannerService.delete(+id);
    }

    @LogRequest()
    @Put(':id/status')
    changeStatus(
        @Param('id') id: string,
        @Body('status') status: BasicStatus,
    ) {
        return this.bannerService.changeStatus(+id, status);
    }

    @LogRequest()
    @Put(':id/sort-order')
    updateSortOrder(
        @Param('id') id: string,
        @Body('sort_order') sortOrder: number,
    ) {
        return this.bannerService.updateSortOrder(+id, sortOrder);
    }
}
