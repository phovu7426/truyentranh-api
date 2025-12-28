import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { Permission } from '@/common/decorators/rbac.decorators';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { AuthService } from '@/common/services/auth.service';
import { RoleService } from '@/modules/user-management/admin/role/services/role.service';

@Controller('admin/roles')
export class RoleController {
  constructor(
    private readonly service: RoleService,
    private readonly auth: AuthService,
  ) { }

  @Permission('role.read')
  @Get()
  async getList(@Query() query: any) {
    // Tách pagination options ra khỏi filters
    const { page, limit, sort, ...filters } = query;
    return this.service.getList(filters, { page, limit, sort });
  }

  @Permission('role.read')
  @Get('simple')
  async getSimpleList(@Query() query: any) {
    // Tách pagination options ra khỏi filters
    const { page, limit, sort, ...filters } = query;
    return this.service.getSimpleList(filters, { page, limit, sort });
  }

  @Permission('role.read')
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.getOne({ id } as any);
  }

  @LogRequest()
  @Permission('role.create')
  @Post()
  async create(@Body() dto: any) {
    // Sử dụng AuthService thay vì @Req() decorator
    const userId = this.auth.id();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.service.create(dto, userId);
  }

  @LogRequest()
  @Permission('role.update')
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any
  ) {
    // Sử dụng AuthService trong hàm
    if (!this.auth.isLogin()) {
      throw new Error('User not authenticated');
    }
    const userId = this.auth.id();
    return this.service.update(id, dto, userId!);
  }

  @LogRequest()
  @Permission('role.delete')
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @LogRequest()
  @Permission('role.update')
  @Post(':id/permissions')
  async assignPermissions(
    @Param('id', ParseIntPipe) roleId: number,
    @Body() body: { permission_ids: number[] }
  ) {
    return this.service.assignPermissions(roleId, body.permission_ids || []);
  }
}



