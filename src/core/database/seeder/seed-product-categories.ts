import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProductCategory } from '@/shared/entities/product-category.entity';
import { User } from '@/shared/entities/user.entity';
import { BasicStatus } from '@/shared/enums/basic-status.enum';

@Injectable()
export class SeedProductCategories {
  private readonly logger = new Logger(SeedProductCategories.name);

  constructor(private readonly dataSource: DataSource) { }

  async seed(): Promise<void> {
    this.logger.log('Seeding product categories...');
    const repo = this.dataSource.getRepository(ProductCategory);
    const userRepo = this.dataSource.getRepository(User);

    const count = await repo.count();
    if (count > 0) {
      this.logger.log('Product categories already seeded, skipping...');
      return;
    }

    // Get admin user for audit fields
    const adminUser = await userRepo.findOne({ where: { username: 'admin' } as any });
    const defaultUserId = adminUser?.id ?? 1;

    const categories = [
      // Danh mục cha
      { name: 'Điện thoại', slug: 'dien-thoai', description: 'Các loại điện thoại thông minh', status: BasicStatus.Active, sort_order: 1, parent_slug: null },
      { name: 'Laptop', slug: 'laptop', description: 'Các loại laptop cho công việc và giải trí', status: BasicStatus.Active, sort_order: 2, parent_slug: null },
      { name: 'Tablet', slug: 'tablet', description: 'Các loại tablet cho công việc và giải trí', status: BasicStatus.Active, sort_order: 3, parent_slug: null },
      { name: 'Phụ kiện', slug: 'phu-kien', description: 'Phụ kiện điện tử', status: BasicStatus.Active, sort_order: 4, parent_slug: null },
      { name: 'Đồng hồ thông minh', slug: 'dong-ho-thong-minh', description: 'Đồng hồ thông minh và thiết bị đeo', status: BasicStatus.Active, sort_order: 5, parent_slug: null },

      // Danh mục con của Điện thoại
      { name: 'iPhone', slug: 'iphone', description: 'Điện thoại iPhone của Apple', status: BasicStatus.Active, sort_order: 1, parent_slug: 'dien-thoai' },
      { name: 'Samsung', slug: 'samsung', description: 'Điện thoại Samsung Galaxy', status: BasicStatus.Active, sort_order: 2, parent_slug: 'dien-thoai' },
      { name: 'Xiaomi', slug: 'xiaomi', description: 'Điện thoại Xiaomi', status: BasicStatus.Active, sort_order: 3, parent_slug: 'dien-thoai' },

      // Danh mục con của Laptop
      { name: 'MacBook', slug: 'macbook', description: 'Laptop MacBook của Apple', status: BasicStatus.Active, sort_order: 1, parent_slug: 'laptop' },
      { name: 'Dell', slug: 'dell', description: 'Laptop Dell', status: BasicStatus.Active, sort_order: 2, parent_slug: 'laptop' },
      { name: 'HP', slug: 'hp', description: 'Laptop HP', status: BasicStatus.Active, sort_order: 3, parent_slug: 'laptop' },

      // Danh mục con của Phụ kiện
      { name: 'Sạc dự phòng', slug: 'sac-du-phong', description: 'Sạc dự phòng các loại', status: BasicStatus.Active, sort_order: 1, parent_slug: 'phu-kien' },
      { name: 'Tai nghe', slug: 'tai-nghe', description: 'Tai nghe có dây và không dây', status: BasicStatus.Active, sort_order: 2, parent_slug: 'phu-kien' },
    ];

    const map = new Map<string, ProductCategory>();

    // create parents first
    for (const cat of categories.filter(c => !c.parent_slug)) {
      const entity = repo.create({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        status: cat.status,
        sort_order: cat.sort_order,
        created_user_id: defaultUserId,
        updated_user_id: defaultUserId,
      });
      const saved = await repo.save(entity);
      map.set(saved.slug, saved);
    }

    // then children
    for (const cat of categories.filter(c => !!c.parent_slug)) {
      const parent = cat.parent_slug ? map.get(cat.parent_slug) ?? null : null;
      const entity = repo.create({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        status: cat.status,
        sort_order: cat.sort_order,
        parent,
        created_user_id: defaultUserId,
        updated_user_id: defaultUserId,
      });
      const saved = await repo.save(entity);
      map.set(saved.slug, saved);
    }

    this.logger.log(`Seeded product categories: ${map.size}`);
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing product categories...');
    const repo = this.dataSource.getRepository(ProductCategory);
    await repo.clear();
  }
}


