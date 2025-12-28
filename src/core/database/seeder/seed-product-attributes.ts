import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProductAttribute } from '@/shared/entities/product-attribute.entity';
import { ProductAttributeValue } from '@/shared/entities/product-attribute-value.entity';
import { User } from '@/shared/entities/user.entity';
import { BasicStatus } from '@/shared/enums/basic-status.enum';

@Injectable()
export class SeedProductAttributes {
  private readonly logger = new Logger(SeedProductAttributes.name);

  constructor(private readonly dataSource: DataSource) { }

  async seed(): Promise<void> {
    this.logger.log('Seeding product attributes + values...');
    const attrRepo = this.dataSource.getRepository(ProductAttribute);
    const valRepo = this.dataSource.getRepository(ProductAttributeValue);
    const userRepo = this.dataSource.getRepository(User);

    const existing = await attrRepo.count();
    if (existing > 0) {
      this.logger.log('Product attributes already seeded, skipping...');
      return;
    }

    // Get admin user for audit fields
    const adminUser = await userRepo.findOne({ where: { username: 'admin' } as any });
    const defaultUserId = adminUser?.id ?? 1;

    // Attributes: Color, Storage
    const color = await attrRepo.save(attrRepo.create({
      name: 'Màu sắc',
      slug: 'mau-sac',
      type: 'color',
      is_required: true,
      is_variation: true,
      is_filterable: true,
      sort_order: 1,
      status: BasicStatus.Active,
      created_user_id: defaultUserId,
      updated_user_id: defaultUserId,
    }));

    const storage = await attrRepo.save(attrRepo.create({
      name: 'Storage',
      slug: 'storage',
      type: 'select',
      is_required: true,
      is_variation: true,
      is_filterable: true,
      sort_order: 2,
      status: BasicStatus.Active,
      created_user_id: defaultUserId,
      updated_user_id: defaultUserId,
    }));

    // Values
    const colorValues = [
      { value: 'Đỏ', color_code: '#FF0000' },
      { value: 'Xanh', color_code: '#0000FF' },
      { value: 'Đen', color_code: '#000000' },
      { value: 'Trắng', color_code: '#FFFFFF' },
      { value: 'Xám', color_code: '#808080' },
      { value: 'Vàng', color_code: '#FFFF00' },
      { value: 'Xanh lá', color_code: '#00FF00' },
      { value: 'Tím', color_code: '#800080' },
    ];
    for (const v of colorValues) {
      await valRepo.save(valRepo.create({
        product_attribute_id: color.id,
        value: v.value,
        color_code: v.color_code,
        sort_order: 0,
        status: BasicStatus.Active,
        created_user_id: defaultUserId,
        updated_user_id: defaultUserId,
      }));
    }

    const storageValues = [
      { value: '64GB' },
      { value: '128GB' },
      { value: '256GB' },
      { value: '512GB' },
      { value: '1TB' },
    ];
    for (const v of storageValues) {
      await valRepo.save(valRepo.create({
        product_attribute_id: storage.id,
        value: v.value,
        sort_order: 0,
        status: BasicStatus.Active,
        created_user_id: defaultUserId,
        updated_user_id: defaultUserId,
      }));
    }

    this.logger.log('Seeded product attributes and values');
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing product attributes + values...');
    await this.dataSource.getRepository(ProductAttributeValue).clear();
    await this.dataSource.getRepository(ProductAttribute).clear();
  }
}


