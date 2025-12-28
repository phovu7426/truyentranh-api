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
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RbacGuard } from '@/common/guards/rbac.guard';
import { Permission } from '@/common/decorators/rbac.decorators';
import { WarehouseService } from '../services/warehouse.service';
import { CreateWarehouseDto } from '../dtos/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dtos/update-warehouse.dto';
import { CreateStockTransferDto } from '../dtos/create-stock-transfer.dto';
import { UpdateInventoryDto } from '../dtos/update-inventory.dto';
import { prepareQuery } from '@/common/base/utils/list-query.helper';
import { LogRequest } from '@/common/decorators/log-request.decorator';

@Controller('admin/warehouses')
@UseGuards(JwtAuthGuard, RbacGuard)
export class AdminWarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Get()
  @Permission('warehouse:read')
  async getList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.warehouseService.getList(filters, options);
  }

  @Get('simple')
  @Permission('warehouse:read')
  async getSimpleList(@Query(ValidationPipe) query: any) {
    const { filters, options } = prepareQuery(query);
    return this.warehouseService.getSimpleList(filters, options);
  }

  @Get(':id')
  @Permission('warehouse:read')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.warehouseService.getOne({ id } as any);
  }

  @Get(':id/inventory')
  @Permission('warehouse:read')
  async getInventory(
    @Param('id', ParseIntPipe) id: number,
    @Query('low_stock') lowStock?: string,
  ) {
    return this.warehouseService.getWarehouseInventory(id, { low_stock: lowStock === 'true' });
  }

  @LogRequest()
  @Post()
  @Permission('warehouse:create')
  async create(@Body(ValidationPipe) dto: CreateWarehouseDto) {
    return this.warehouseService.create(dto as any);
  }

  @LogRequest()
  @Put(':id')
  @Permission('warehouse:update')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateWarehouseDto,
  ) {
    return this.warehouseService.update(id, dto as any);
  }

  @LogRequest()
  @Delete(':id')
  @Permission('warehouse:delete')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.warehouseService.softDelete(id);
  }

  @LogRequest()
  @Put('inventory/update')
  @Permission('warehouse:update')
  async updateInventory(@Body(ValidationPipe) dto: UpdateInventoryDto) {
    return this.warehouseService.updateInventoryStock(
      dto.warehouse_id,
      dto.product_variant_id,
      dto.quantity,
      dto.min_stock_level,
    );
  }

  @LogRequest()
  @Post('transfers')
  @Permission('warehouse:transfer')
  async createTransfer(
    @Request() req: any,
    @Body(ValidationPipe) dto: CreateStockTransferDto,
  ) {
    return this.warehouseService.createStockTransfer(
      dto.from_warehouse_id,
      dto.to_warehouse_id,
      dto.product_variant_id,
      dto.quantity,
      req.user?.id,
      dto.notes,
    );
  }

  @Get('transfers/list')
  @Permission('warehouse:read')
  async getTransfers(
    @Query('status') status?: string,
    @Query('warehouse_id') warehouseId?: string,
  ) {
    return this.warehouseService.getStockTransfers({
      status: status as any,
      warehouse_id: warehouseId ? parseInt(warehouseId) : undefined,
    });
  }

  @LogRequest()
  @Put('transfers/:id/approve')
  @Permission('warehouse:transfer')
  async approveTransfer(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.warehouseService.approveStockTransfer(id, req.user?.id);
  }

  @LogRequest()
  @Put('transfers/:id/complete')
  @Permission('warehouse:transfer')
  async completeTransfer(@Param('id', ParseIntPipe) id: number) {
    return this.warehouseService.completeStockTransfer(id);
  }

  @LogRequest()
  @Put('transfers/:id/cancel')
  @Permission('warehouse:transfer')
  async cancelTransfer(@Param('id', ParseIntPipe) id: number) {
    return this.warehouseService.cancelStockTransfer(id);
  }
}