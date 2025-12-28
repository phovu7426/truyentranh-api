import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { PaymentMethod } from '@/shared/entities/payment-method.entity';
import { CrudService } from '@/common/base/services/crud.service';

@Injectable()
export class PaymentMethodService extends CrudService<PaymentMethod> {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
  ) {
    super(paymentMethodRepository);
  }

  async create(data: DeepPartial<PaymentMethod>, createdBy?: number) {
    // Remove legacy fields that are not in the database schema
    const { is_active, display_order, icon, ...validData } = data as any;

    // Set default status if not provided
    if (!validData.status) {
      validData.status = 'active';
    }

    return super.create(validData, createdBy);
  }

  async update(id: number, data: DeepPartial<PaymentMethod>, updatedBy?: number) {
    // Remove legacy fields that are not in the database schema
    const { is_active, display_order, icon, ...validData } = data as any;
    return super.update(id, validData, updatedBy);
  }
}