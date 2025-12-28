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
import { BannerLocationService } from '@/modules/banner/admin/banner-location/services/banner-location.service';
import { CreateBannerLocationDto } from '@/modules/banner/admin/banner-location/dtos/create-banner-location.dto';
import { UpdateBannerLocationDto } from '@/modules/banner/admin/banner-location/dtos/update-banner-location.dto';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('admin/banner-locations')
export class BannerLocationController {
    constructor(private readonly bannerLocationService: BannerLocationService) { }

    @LogRequest()
    @Post()
    create(@Body(ValidationPipe) createBannerLocationDto: CreateBannerLocationDto) {
        return this.bannerLocationService.create(createBannerLocationDto);
    }

    @Get()
    findAll(@Query(ValidationPipe) query: any) {
        const { filters, options } = prepareQuery(query);
        return this.bannerLocationService.getList(filters, options);
    }

    @Get('simple')
    getSimpleList(@Query(ValidationPipe) query: any) {
        const { filters, options } = prepareQuery(query);
        return this.bannerLocationService.getSimpleList(filters, options);
    }

    // Specific routes MUST come before parameterized routes
    @Get('code/:code')
    findByCode(@Param('code') code: string) {
        return this.bannerLocationService.getOne({ code: code } as any);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.bannerLocationService.getOne({ id: +id } as any);
    }

    @LogRequest()
    @Put(':id')
    update(
        @Param('id') id: string,
        @Body(ValidationPipe) updateBannerLocationDto: UpdateBannerLocationDto,
    ) {
        return this.bannerLocationService.update(+id, updateBannerLocationDto);
    }

    @LogRequest()
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.bannerLocationService.delete(+id);
    }

    @LogRequest()
    @Put(':id/status')
    changeStatus(
        @Param('id') id: string,
        @Body('status') status: BasicStatus,
    ) {
        return this.bannerLocationService.changeStatus(+id, status);
    }
}
