import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RbacGuard } from '@/common/guards/rbac.guard';
import { Permission } from '@/common/decorators/rbac.decorators';
import { AdminCouponService } from '../services/coupon.service';
import { CreateCouponDto } from '../dtos/create-coupon.dto';
import { UpdateCouponDto } from '../dtos/update-coupon.dto';
import { GetCouponsDto } from '../dtos/get-coupons.dto';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('admin/coupons')
@UseGuards(JwtAuthGuard, RbacGuard)
export class AdminCouponController {
  constructor(private readonly couponService: AdminCouponService) {}

  @Get()
  @Permission('coupon:read')
  async getList(@Query(ValidationPipe) query: GetCouponsDto) {
    const { filters, options } = prepareQuery(query);
    return this.couponService.getList(filters, options);
  }

  @Get('simple')
  @Permission('coupon:read')
  async getSimpleList(@Query(ValidationPipe) query: GetCouponsDto) {
    const { filters, options } = prepareQuery(query);
    return this.couponService.getSimpleList(filters, options);
  }

  @Get(':id')
  @Permission('coupon:read')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.couponService.getOne({ id } as any);
  }

  @Get(':id/stats')
  @Permission('coupon:read')
  async getStats(@Param('id', ParseIntPipe) id: number) {
    return this.couponService.getCouponStats(id);
  }

  @LogRequest()
  @Post()
  @Permission('coupon:create')
  async create(@Body(ValidationPipe) dto: CreateCouponDto) {
    return this.couponService.create(dto as any);
  }

  @LogRequest()
  @Put(':id')
  @Permission('coupon:update')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateCouponDto,
  ) {
    return this.couponService.update(id, dto as any);
  }

  @LogRequest()
  @Delete(':id')
  @Permission('coupon:delete')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.couponService.softDelete(id);
  }
}