import { Controller, Put, Body, Param, ParseIntPipe } from '@nestjs/common';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { RbacService } from '@/modules/rbac/services/rbac.service';

@Controller('admin/users')
export class RbacController {
  constructor(private readonly service: RbacService) {}

  /**
   * Sync roles cho user (thay thế toàn bộ roles hiện tại)
   */
  @LogRequest()
  @Put(':id/roles')
  async syncRoles(
    @Param('id', ParseIntPipe) userId: number,
    @Body() body: { role_ids: number[] }
  ) {
    return this.service.syncRoles(userId, body.role_ids || []);
  }
}



