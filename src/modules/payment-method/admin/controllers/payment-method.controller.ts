import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RbacGuard } from '@/common/guards/rbac.guard';
import { Permission } from '@/common/decorators/rbac.decorators';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { PaymentMethodService } from '@/modules/payment-method/admin/services/payment-method.service';
import { CreatePaymentMethodDto } from '@/modules/payment-method/admin/dtos/create-payment-method.dto';
import { UpdatePaymentMethodDto } from '@/modules/payment-method/admin/dtos/update-payment-method.dto';
import { GetPaymentMethodsDto } from '@/modules/payment-method/admin/dtos/get-payment-methods.dto';
import { prepareQuery } from '@/common/base/utils/list-query.helper';

@Controller('admin/payment-methods')
@UseGuards(JwtAuthGuard, RbacGuard)
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) { }

  @LogRequest()
  @Post()
  @Permission('payment_method.manage')
  async create(@Body() dto: CreatePaymentMethodDto) {
    return this.paymentMethodService.create(dto);
  }

  @Get()
  @Permission('payment_method.manage')
  async getList(@Query() query: GetPaymentMethodsDto) {
    const { filters, options } = prepareQuery(query);
    return this.paymentMethodService.getList(filters, options);
  }

  @Get('simple')
  @Permission('payment_method.manage')
  async getSimpleList(@Query() query: GetPaymentMethodsDto) {
    const { filters, options } = prepareQuery(query);
    return this.paymentMethodService.getSimpleList(filters, options);
  }

  @Get(':id')
  @Permission('payment_method.manage')
  async getOne(@Param('id') id: string) {
    return this.paymentMethodService.getOne({ id: +id });
  }

  @LogRequest()
  @Put(':id')
  @Permission('payment_method.manage')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentMethodDto,
  ) {
    return this.paymentMethodService.update(+id, dto);
  }

  @LogRequest()
  @Delete(':id')
  @Permission('payment_method.manage')
  async delete(@Param('id') id: string) {
    return this.paymentMethodService.delete(+id);
  }

  @LogRequest()
  @Put(':id/restore')
  @Permission('payment_method.manage')
  async restore(@Param('id') id: string) {
    return this.paymentMethodService.restore(+id);
  }
}