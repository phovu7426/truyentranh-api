import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RbacGuard } from '@/common/guards/rbac.guard';
import { Permission } from '@/common/decorators/rbac.decorators';
import { PaymentMethodService } from '@/modules/payment-method/admin/services/payment-method.service';
import { BasicStatus } from '@/shared/enums/basic-status.enum';

@Controller('public/payment-methods')
@UseGuards(JwtAuthGuard, RbacGuard)
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) { }

  @Get()
  @Permission('public')
  async getList() {
    return this.paymentMethodService.getList({ status: BasicStatus.Active });
  }

  @Get(':id')
  @Permission('public')
  async getOne(@Param('id') id: string) {
    return this.paymentMethodService.getOne({ id: +id, status: BasicStatus.Active });
  }
}