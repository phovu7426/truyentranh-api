import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Warehouse } from '@/shared/entities/warehouse.entity';
import { WarehouseInventory } from '@/shared/entities/warehouse-inventory.entity';
import { StockTransfer, StockTransferStatus } from '@/shared/entities/stock-transfer.entity';
import { ProductVariant } from '@/shared/entities/product-variant.entity';
import { User } from '@/shared/entities/user.entity';
import { Group } from '@/shared/entities/group.entity';

type WarehouseSeedData = Omit<Warehouse, 'id' | 'created_at' | 'updated_at'>;

@Injectable()
export class SeedWarehouses {
  private readonly logger = new Logger(SeedWarehouses.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed(): Promise<void> {
    this.logger.log('Seeding warehouses, inventories và chuyển kho...');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const warehouseRepo = queryRunner.manager.getRepository(Warehouse);
      const inventoryRepo = queryRunner.manager.getRepository(WarehouseInventory);
      const transferRepo = queryRunner.manager.getRepository(StockTransfer);
      const variantRepo = queryRunner.manager.getRepository(ProductVariant);
      const userRepo = queryRunner.manager.getRepository(User);
      const groupRepo = queryRunner.manager.getRepository(Group);

      // Seed warehouses
      let warehouses = await warehouseRepo.find();
      if (warehouses.length === 0) {
        const adminUser = await userRepo.findOne({ where: { username: 'admin' } as any });
        const defaultUserId = adminUser?.id ?? 1;
        const mainShop = await groupRepo.findOne({ where: { code: 'shop-001' } as any });
        const mainShopId = mainShop?.id ?? null;

        const warehouseData: WarehouseSeedData[] = [
          {
            code: 'HCM-MAIN',
            name: 'Kho tổng Hồ Chí Minh',
            address: '123 Nguyễn Văn Cừ, Quận 5, TP.HCM',
            city: 'Hồ Chí Minh',
            district: 'Quận 5',
            latitude: '10.7553410',
            longitude: '106.6639570',
            phone: '0901234567',
            manager_name: 'Nguyễn Văn A',
            priority: 100,
            is_active: true,
            group_id: mainShopId,
            created_user_id: defaultUserId,
            updated_user_id: defaultUserId,
          },
          {
            code: 'HN-HUB',
            name: 'Kho trung tâm Hà Nội',
            address: '45 Giải Phóng, Hai Bà Trưng, Hà Nội',
            city: 'Hà Nội',
            district: 'Hai Bà Trưng',
            latitude: '21.0025360',
            longitude: '105.8430950',
            phone: '0902345678',
            manager_name: 'Trần Thị B',
            priority: 80,
            is_active: true,
            group_id: mainShopId,
            created_user_id: defaultUserId,
            updated_user_id: defaultUserId,
          },
          {
            code: 'DN-DC',
            name: 'Kho phân phối Đà Nẵng',
            address: '78 Bạch Đằng, Hải Châu, Đà Nẵng',
            city: 'Đà Nẵng',
            district: 'Hải Châu',
            latitude: '16.0677890',
            longitude: '108.2207040',
            phone: '0903456789',
            manager_name: 'Lê Văn C',
            priority: 60,
            is_active: true,
            group_id: mainShopId,
            created_user_id: defaultUserId,
            updated_user_id: defaultUserId,
          },
        ];

        warehouses = await warehouseRepo.save(warehouseData);
        this.logger.log(`Đã tạo ${warehouses.length} kho hàng mẫu`);
      } else {
        this.logger.log('Warehouses đã tồn tại, bỏ qua tạo mới');
      }

      // Seed inventory
      const inventoryCount = await inventoryRepo.count();
      if (inventoryCount === 0) {
        const variants = await variantRepo.find({ take: 40, order: { id: 'ASC' } });
        if (variants.length === 0) {
          this.logger.warn('Không tìm thấy product variant, bỏ qua seed tồn kho');
        } else {
          const randomInt = (min: number, max: number) =>
            Math.floor(Math.random() * (max - min + 1)) + min;

          const inventoryRows: Partial<WarehouseInventory>[] = [];

          for (const variant of variants) {
            for (const warehouse of warehouses) {
              const quantity = randomInt(20, 150);
              const reserved = randomInt(0, Math.floor(quantity / 3));
              inventoryRows.push({
                warehouse_id: warehouse.id,
                product_variant_id: variant.id,
                quantity,
                reserved_quantity: reserved,
                min_stock_level: randomInt(5, 15),
              });
            }
          }

          await inventoryRepo.insert(inventoryRows);
          this.logger.log(`Đã tạo ${inventoryRows.length} bản ghi tồn kho cho ${warehouses.length} kho`);
        }
      } else {
        this.logger.log('Warehouse inventory đã tồn tại, bỏ qua tạo mới');
      }

      // Seed stock transfers
      const transferCount = await transferRepo.count();
      if (transferCount === 0 && warehouses.length >= 2) {
        const adminUser = await userRepo.findOne({ where: { username: 'admin' } as any });
        const managerUser = await userRepo.findOne({ where: { username: 'manager1' } as any });
        const createdBy = adminUser?.id ?? managerUser?.id ?? 1;

        const variantsForTransfer = await variantRepo.find({ take: 5, order: { id: 'ASC' } });
        if (variantsForTransfer.length === 0) {
          this.logger.warn('Không tìm thấy product variant để tạo phiếu chuyển kho');
        } else {
          const [wh1, wh2, wh3] = warehouses;
          const transfers: Partial<StockTransfer>[] = [
            {
              transfer_number: 'ST-2025-0001',
              from_warehouse_id: wh1?.id,
              to_warehouse_id: wh2?.id ?? wh1?.id,
              product_variant_id: variantsForTransfer[0].id,
              quantity: 20,
              status: StockTransferStatus.COMPLETED,
              notes: 'Chuyển bổ sung hàng bán chạy',
              created_by: createdBy,
              approved_by: createdBy,
              approved_at: new Date(),
              completed_at: new Date(),
            },
            {
              transfer_number: 'ST-2025-0002',
              from_warehouse_id: wh2?.id ?? wh1?.id,
              to_warehouse_id: wh3?.id ?? wh1?.id,
              product_variant_id: variantsForTransfer[1]?.id ?? variantsForTransfer[0].id,
              quantity: 15,
              status: StockTransferStatus.IN_TRANSIT,
              notes: 'Cân bằng tồn kho khu vực miền Trung',
              created_by: createdBy,
              approved_by: createdBy,
              approved_at: new Date(),
              completed_at: null,
            },
            {
              transfer_number: 'ST-2025-0003',
              from_warehouse_id: wh1?.id,
              to_warehouse_id: wh3?.id ?? wh2?.id ?? wh1?.id,
              product_variant_id: variantsForTransfer[2]?.id ?? variantsForTransfer[0].id,
              quantity: 10,
              status: StockTransferStatus.PENDING,
              notes: 'Chuẩn bị hàng cho chiến dịch flash sale',
              created_by: createdBy,
              approved_by: null,
              approved_at: null,
              completed_at: null,
            },
          ].filter(t => t.from_warehouse_id && t.to_warehouse_id);

          await transferRepo.insert(transfers);
          this.logger.log(`Đã tạo ${transfers.length} phiếu chuyển kho mẫu`);
        }
      } else if (transferCount > 0) {
        this.logger.log('Stock transfers đã tồn tại, bỏ qua tạo mới');
      }

      await queryRunner.commitTransaction();
      this.logger.log('Seed kho hàng hoàn tất');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

