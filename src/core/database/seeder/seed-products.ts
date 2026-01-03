import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Product } from '@/shared/entities/product.entity';
import { ProductVariant } from '@/shared/entities/product-variant.entity';
import { ProductCategory } from '@/shared/entities/product-category.entity';
import { ProductProductCategory } from '@/shared/entities/product-product-category.entity';
import { ProductAttribute } from '@/shared/entities/product-attribute.entity';
import { ProductAttributeValue } from '@/shared/entities/product-attribute-value.entity';
import { ProductVariantAttribute } from '@/shared/entities/product-variant-attribute.entity';
import { User } from '@/shared/entities/user.entity';
import { Group } from '@/shared/entities/group.entity';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { ProductStatus } from '@/shared/enums/product-status.enum';

@Injectable()
export class SeedProducts {
  private readonly logger = new Logger(SeedProducts.name);

  constructor(private readonly dataSource: DataSource) { }

  async seed(): Promise<void> {
    this.logger.log('Seeding products + variants...');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const productRepo = queryRunner.manager.getRepository(Product);
      const variantRepo = queryRunner.manager.getRepository(ProductVariant);
      const categoryRepo = queryRunner.manager.getRepository(ProductCategory);
      const pivotRepo = queryRunner.manager.getRepository(ProductProductCategory);
      const attrRepo = queryRunner.manager.getRepository(ProductAttribute);
      const valueRepo = queryRunner.manager.getRepository(ProductAttributeValue);
      const pvaRepo = queryRunner.manager.getRepository(ProductVariantAttribute);
      const userRepo = queryRunner.manager.getRepository(User);
      const groupRepo = queryRunner.manager.getRepository(Group);

      const existing = await productRepo.count();
      if (existing > 0) {
        this.logger.log('Products already seeded, skipping...');
        await queryRunner.commitTransaction();
        return;
      }

      // Get admin user for audit fields
      const adminUser = await userRepo.findOne({ where: { username: 'admin' } as any });
      const defaultUserId = adminUser?.id ?? 1;

      // Gắn toàn bộ product demo vào shop chính (nếu tồn tại)
      const mainShop = await groupRepo.findOne({ where: { code: 'shop-001' } as any });
      const mainShopId = mainShop?.id ?? null;

      // prerequisites: categories, attributes, values
      const categories = await categoryRepo.find();
      if (categories.length === 0) {
        this.logger.warn('No categories found, seeding aborted for products.');
        await queryRunner.rollbackTransaction();
        return;
      }

      const colorAttr = await attrRepo.findOne({ where: { slug: 'mau-sac' } });
      const storageAttr = await attrRepo.findOne({ where: { slug: 'storage' } });
      if (!colorAttr || !storageAttr) {
        this.logger.warn('Attributes not found, seeding aborted for products.');
        await queryRunner.rollbackTransaction();
        return;
      }

      const colorValues = await valueRepo.find({ where: { product_attribute_id: colorAttr.id } });
      const storageValues = await valueRepo.find({ where: { product_attribute_id: storageAttr.id } });

      if (colorValues.length === 0 || storageValues.length === 0) {
        this.logger.warn('Attribute values not found, seeding aborted for products.');
        await queryRunner.rollbackTransaction();
        return;
      }

      // Get category slugs for easier reference
      const categoryMap = new Map<string, number>();
      categories.forEach(cat => categoryMap.set(cat.slug, cat.id));

      // Product data
      const products = [
        // iPhone products
        { name: 'iPhone 15 Pro', slug: 'iphone-15-pro', sku: 'IPHONE15PRO', category: 'iphone', price: 25000000, featured: true, description: 'iPhone 15 Pro với chip A17 Pro' },
        { name: 'iPhone 15', slug: 'iphone-15', sku: 'IPHONE15', category: 'iphone', price: 20000000, featured: true, description: 'iPhone 15 với Dynamic Island' },
        { name: 'iPhone 14', slug: 'iphone-14', sku: 'IPHONE14', category: 'iphone', price: 17000000, featured: false, description: 'iPhone 14 với chip A16' },
        { name: 'iPhone 13', slug: 'iphone-13', sku: 'IPHONE13', category: 'iphone', price: 14000000, featured: false, description: 'iPhone 13 với chip A15' },

        // Samsung products
        { name: 'Samsung Galaxy S24 Ultra', slug: 'samsung-galaxy-s24-ultra', sku: 'SAMSUNGS24U', category: 'samsung', price: 28000000, featured: true, description: 'Galaxy S24 Ultra với S Pen' },
        { name: 'Samsung Galaxy S24', slug: 'samsung-galaxy-s24', sku: 'SAMSUNGS24', category: 'samsung', price: 22000000, featured: true, description: 'Galaxy S24 với AI' },
        { name: 'Samsung Galaxy A54', slug: 'samsung-galaxy-a54', sku: 'SAMSUNGA54', category: 'samsung', price: 12000000, featured: false, description: 'Galaxy A54 tầm trung' },

        // Xiaomi products
        { name: 'Xiaomi 14 Pro', slug: 'xiaomi-14-pro', sku: 'XIAOMI14PRO', category: 'xiaomi', price: 18000000, featured: true, description: 'Xiaomi 14 Pro với camera Leica' },
        { name: 'Xiaomi 13', slug: 'xiaomi-13', sku: 'XIAOMI13', category: 'xiaomi', price: 14000000, featured: false, description: 'Xiaomi 13 với Snapdragon 8 Gen 2' },

        // MacBook products
        { name: 'MacBook Pro 14"', slug: 'macbook-pro-14', sku: 'MBP14', category: 'macbook', price: 45000000, featured: true, description: 'MacBook Pro 14 inch với chip M3' },
        { name: 'MacBook Air 13"', slug: 'macbook-air-13', sku: 'MBA13', category: 'macbook', price: 30000000, featured: true, description: 'MacBook Air 13 inch với chip M2' },
        { name: 'MacBook Air 15"', slug: 'macbook-air-15', sku: 'MBA15', category: 'macbook', price: 35000000, featured: false, description: 'MacBook Air 15 inch với chip M2' },

        // Dell products
        { name: 'Dell XPS 15', slug: 'dell-xps-15', sku: 'DELLXPS15', category: 'dell', price: 40000000, featured: true, description: 'Dell XPS 15 với Intel Core i9' },
        { name: 'Dell Inspiron 14', slug: 'dell-inspiron-14', sku: 'DELLIN14', category: 'dell', price: 20000000, featured: false, description: 'Dell Inspiron 14 cho công việc' },

        // HP products
        { name: 'HP Spectre x360', slug: 'hp-spectre-x360', sku: 'HPSPECTRE', category: 'hp', price: 35000000, featured: true, description: 'HP Spectre x360 2-in-1' },
        { name: 'HP Pavilion 15', slug: 'hp-pavilion-15', sku: 'HPPAV15', category: 'hp', price: 18000000, featured: false, description: 'HP Pavilion 15 cho giải trí' },

        // Tablet products
        { name: 'iPad Pro 12.9"', slug: 'ipad-pro-12-9', sku: 'IPADPRO129', category: 'tablet', price: 25000000, featured: true, description: 'iPad Pro 12.9 inch với chip M2' },
        { name: 'iPad Air', slug: 'ipad-air', sku: 'IPADAIR', category: 'tablet', price: 18000000, featured: true, description: 'iPad Air với chip M1' },
        { name: 'Samsung Galaxy Tab S9', slug: 'samsung-galaxy-tab-s9', sku: 'TABS9', category: 'tablet', price: 15000000, featured: false, description: 'Galaxy Tab S9 với S Pen' },

        // Smartwatch products
        { name: 'Apple Watch Series 9', slug: 'apple-watch-s9', sku: 'AWS9', category: 'dong-ho-thong-minh', price: 12000000, featured: true, description: 'Apple Watch Series 9' },
        { name: 'Samsung Galaxy Watch 6', slug: 'samsung-galaxy-watch-6', sku: 'SGW6', category: 'dong-ho-thong-minh', price: 8000000, featured: true, description: 'Samsung Galaxy Watch 6' },
        { name: 'Xiaomi Watch S3', slug: 'xiaomi-watch-s3', sku: 'XWS3', category: 'dong-ho-thong-minh', price: 3000000, featured: false, description: 'Xiaomi Watch S3' },

        // Power bank products
        { name: 'Anker PowerCore 20000', slug: 'anker-powercore-20000', sku: 'ANKER20000', category: 'sac-du-phong', price: 1500000, featured: false, description: 'Anker PowerCore 20000mAh' },
        { name: 'Xiaomi Power Bank 20000', slug: 'xiaomi-power-bank-20000', sku: 'XMPB20000', category: 'sac-du-phong', price: 800000, featured: false, description: 'Xiaomi Power Bank 20000mAh' },
        { name: 'Aukey Power Bank 10000', slug: 'aukey-power-bank-10000', sku: 'AUPB10000', category: 'sac-du-phong', price: 600000, featured: false, description: 'Aukey Power Bank 10000mAh' },

        // Headphone products
        { name: 'AirPods Pro 2', slug: 'airpods-pro-2', sku: 'APP2', category: 'tai-nghe', price: 6000000, featured: true, description: 'AirPods Pro thế hệ 2' },
        { name: 'Sony WH-1000XM5', slug: 'sony-wh-1000xm5', sku: 'SONYXM5', category: 'tai-nghe', price: 8000000, featured: true, description: 'Sony WH-1000XM5 chống ồn' },
        { name: 'Samsung Galaxy Buds 2 Pro', slug: 'samsung-galaxy-buds-2-pro', sku: 'SGBP2', category: 'tai-nghe', price: 4000000, featured: false, description: 'Samsung Galaxy Buds 2 Pro' },
        { name: 'JBL Tune 750BTNC', slug: 'jbl-tune-750btnc', sku: 'JBL750', category: 'tai-nghe', price: 2000000, featured: false, description: 'JBL Tune 750BTNC' },
        { name: 'Xiaomi Redmi Buds 4', slug: 'xiaomi-redmi-buds-4', sku: 'XMRB4', category: 'tai-nghe', price: 1000000, featured: false, description: 'Xiaomi Redmi Buds 4' },
      ];

      const createdProducts = [];

      // Create products
      for (const productData of products) {
        const categoryId = categoryMap.get(productData.category);
        if (!categoryId) {
          this.logger.warn(`Category ${productData.category} not found for product ${productData.name}`);
          continue;
        }

          const product = await productRepo.save({
          name: productData.name,
          slug: productData.slug,
          sku: productData.sku,
          description: productData.description,
          short_description: productData.name,
          min_stock_level: 0,
          status: ProductStatus.ACTIVE,
          is_featured: productData.featured,
          is_variable: true,
          is_digital: false,
          group_id: mainShopId,
          created_user_id: defaultUserId,
          updated_user_id: defaultUserId,
        });

        // Link to category
        await pivotRepo.save(pivotRepo.create({
          product_id: product.id,
          product_category_id: categoryId,
        }));

        createdProducts.push({ product, categoryId, basePrice: productData.price });
      }

      // Create variants for each product
      for (const { product, categoryId, basePrice } of createdProducts) {
        // Create 2-4 variants per product
        const variantCount = Math.floor(Math.random() * 3) + 2; // 2-4 variants

        // Track used combinations to avoid duplicates
        const usedCombinations = new Set<string>();

        for (let i = 0; i < variantCount; i++) {
          let randomColor, randomStorage;
          let combinationKey;

          // Find unique combination
          do {
            randomColor = colorValues[Math.floor(Math.random() * colorValues.length)];
            randomStorage = storageValues[Math.floor(Math.random() * storageValues.length)];
            combinationKey = `${randomColor.value}-${randomStorage.value}`;
          } while (usedCombinations.has(combinationKey));

          usedCombinations.add(combinationKey);

          const priceVariation = Math.floor(Math.random() * 5000000) - 2500000; // -2.5M to +2.5M
          const finalPrice = Math.max(basePrice + priceVariation, basePrice * 0.7); // Don't go below 70% of base price
          const hasDiscount = Math.random() > 0.6; // 40% chance of having a discount
          const salePrice = hasDiscount ? Math.floor(finalPrice * 0.9) : null; // 10% discount if applicable

          const variant = await variantRepo.save(variantRepo.create({
            product_id: product.id,
            sku: `${product.sku}-${randomColor.value}-${randomStorage.value}-${i + 1}`,
            name: `${product.name} - ${randomColor.value} - ${randomStorage.value}`,
            price: finalPrice.toString(),
            sale_price: salePrice?.toString(),
            cost_price: null,
            stock_quantity: Math.floor(Math.random() * 100) + 10, // 10-109 items
            weight: '0.2',
            status: BasicStatus.Active,
            created_user_id: defaultUserId,
            updated_user_id: defaultUserId,
          }));

          // Link variant attributes
          await pvaRepo.insert([
            {
              product_variant_id: variant.id,
              product_attribute_id: colorAttr.id,
              product_attribute_value_id: randomColor.id,
            },
            {
              product_variant_id: variant.id,
              product_attribute_id: storageAttr.id,
              product_attribute_value_id: randomStorage.id,
            },
          ]);
        }
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Seeded ${createdProducts.length} products with variants`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing products + variants...');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.getRepository(ProductVariantAttribute).clear();
      await queryRunner.manager.getRepository(ProductProductCategory).clear();
      await queryRunner.manager.getRepository(ProductVariant).clear();
      await queryRunner.manager.getRepository(Product).clear();
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}


