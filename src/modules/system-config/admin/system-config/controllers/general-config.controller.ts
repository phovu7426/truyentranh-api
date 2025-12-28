import {
  Controller,
  Get,
  Put,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { GeneralConfigService } from '../services/general-config.service';
import { UpdateGeneralConfigDto } from '../dtos/update-general-config.dto';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { AuthService } from '@/common/services/auth.service';

@Controller('admin/system-config/general')
export class GeneralConfigController {
  constructor(
    private readonly generalConfigService: GeneralConfigService,
    private readonly auth: AuthService,
  ) {}

  /**
   * Lấy cấu hình chung
   */
  @Get()
  getConfig() {
    return this.generalConfigService.getConfig();
  }

  /**
   * Cập nhật cấu hình chung
   */
  @LogRequest()
  @Put()
  updateConfig(@Body(ValidationPipe) dto: UpdateGeneralConfigDto) {
    const userId = this.auth.id() || undefined;
    return this.generalConfigService.updateConfig(dto, userId);
  }
}
