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
import { AdminProductVariantService } from '@/modules/ecommerce/admin/product-variant/services/product-variant.service';
import { CreateProductVariantDto } from '@/modules/ecommerce/admin/product-variant/dtos/create-product-variant.dto';
import { UpdateProductVariantDto } from '@/modules/ecommerce/admin/product-variant/dtos/update-product-variant.dto';
import { SearchVariantsDto } from '@/modules/ecommerce/admin/product-variant/dtos/search-variants.dto';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('admin/product-variants')
@UseGuards(JwtAuthGuard, RbacGuard)
export class AdminProductVariantController {
  constructor(private readonly productVariantService: AdminProductVariantService) { }

  @Get()
  @Permission('product-variant:read')
  async getList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.productVariantService.getList(filters, options);
  }

  @Get('simple')
  @Permission('product-variant:read')
  async getSimpleList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.productVariantService.getSimpleList(filters, options);
  }

  @Get('product/:productId')
  @Permission('product-variant:read')
  async getByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.productVariantService.getList(
      { product_id: productId },
      { relations: ['product'], sort: 'created_at:DESC', limit: 1000 }
    );
  }

  @Post('search')
  @Permission('product-variant:read')
  async searchVariants(@Body(ValidationPipe) searchDto: SearchVariantsDto) {
    return this.productVariantService.searchVariants(searchDto.product_id || 0, searchDto.attributes);
  }

  @Get('sku/:sku')
  @Permission('product-variant:read')
  async getBySku(@Param('sku') sku: string) {
    return this.productVariantService.getOne({ sku } as any);
  }

  @Get(':id')
  @Permission('product-variant:read')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.productVariantService.getOne({ id } as any, { relations: ['product', 'attributes'] });
  }

  @LogRequest()
  @Post()
  @Permission('product-variant:create')
  async create(@Body(ValidationPipe) dto: CreateProductVariantDto) {
    return this.productVariantService.create(dto as any);
  }

  @LogRequest()
  @Put(':id')
  @Permission('product-variant:update')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateProductVariantDto,
  ) {
    return this.productVariantService.update(id, dto as any);
  }

  @LogRequest()
  @Put(':id/restore')
  @Permission('product-variant:update')
  async restore(@Param('id', ParseIntPipe) id: number) {
    return this.productVariantService.restore(id);
  }

  @LogRequest()
  @Delete(':id')
  @Permission('product-variant:delete')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.productVariantService.softDelete(id);
  }
}