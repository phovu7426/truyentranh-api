import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethod } from '@/shared/entities/payment-method.entity';
import { PaymentMethodService } from '@/modules/payment-method/admin/services/payment-method.service';
import { PaymentMethodController as AdminPaymentMethodController } from '@/modules/payment-method/admin/controllers/payment-method.controller';
import { PaymentMethodController as PublicPaymentMethodController } from '@/modules/payment-method/public/controllers/payment-method.controller';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentMethod]),
    RbacModule,
  ],
  controllers: [AdminPaymentMethodController, PublicPaymentMethodController],
  providers: [PaymentMethodService],
  exports: [PaymentMethodService],
})
export class PaymentMethodModule { }