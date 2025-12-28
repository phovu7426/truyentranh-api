import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from '@/shared/entities/product.entity';
import { ProductCategory } from '@/shared/entities/product-category.entity';
import { CrudService } from '@/common/base/services/crud.service';

@Injectable()
export class AdminProductService extends CrudService<Product> {
  constructor(
    @InjectRepository(Product)
    protected readonly productRepository: Repository<Product>,
    @InjectRepository(ProductCategory)
    private readonly productCategoryRepository: Repository<ProductCategory>,
  ) {
    super(productRepository);
  }

  // Biến tạm để lưu trữ category_ids khi tạo sản phẩm
  private tempCategoryIds: string[] = [];

  /**
   * Hook trước khi tạo
   */
  protected async beforeCreate(entity: Product, createDto: any): Promise<boolean> {
    await this.ensureSlug(createDto);

    // Xử lý category_ids nếu có
    if (createDto.category_ids && Array.isArray(createDto.category_ids) && createDto.category_ids.length > 0) {
      // Lưu category_ids vào biến tạm để xử lý sau khi tạo entity
      this.tempCategoryIds = createDto.category_ids;
      // Xóa category_ids khỏi createDto vì không phải là trường của Product
      delete createDto.category_ids;
    }

    return true;
  }

  /**
   * Hook trước khi update
   */
  protected async beforeUpdate(entity: Product, updateDto: any): Promise<boolean> {
    await this.ensureSlug(updateDto, entity.id, entity.slug);

    // Xử lý category_ids nếu có
    if (updateDto.category_ids && Array.isArray(updateDto.category_ids) && updateDto.category_ids.length > 0) {
      // Load product với categories hiện tại
      const productWithCategories = await this.productRepository.findOne({
        where: { id: entity.id },
        relations: ['categories'],
      });
      
      if (productWithCategories) {
        // Tìm các categories mới
        const categoryIds = updateDto.category_ids.map((id: string) => parseInt(id, 10));
        const categories = await this.productCategoryRepository.find({
          where: { id: In(categoryIds) },
        });
        
        // Gán categories mới
        productWithCategories.categories = categories;
        await this.productRepository.save(productWithCategories);
      }
      
      // Xóa category_ids khỏi updateDto vì không phải là trường của Product
      delete updateDto.category_ids;
    }

    return true;
  }

  /**
   * Hook sau khi tạo entity
   */
  protected async afterCreate(entity: Product, createDto: any): Promise<void> {
    // Xử lý category_ids nếu có (đã được lưu trong biến tạm)
    if (this.tempCategoryIds && this.tempCategoryIds.length > 0) {
      // Tìm các categories
      const categoryIds = this.tempCategoryIds.map((id: string) => parseInt(id, 10));
      const categories = await this.productCategoryRepository.find({
        where: { id: In(categoryIds) },
      });
      
      // Load product với categories
      const productWithCategories = await this.productRepository.findOne({
        where: { id: entity.id },
        relations: ['categories'],
      });
      
      if (productWithCategories) {
        // Gán categories
        productWithCategories.categories = categories;
        await this.productRepository.save(productWithCategories);
      }

      // Xóa tạm category_ids
      this.tempCategoryIds = [];
    }
  }

  protected async afterGetOne(
    product: Product,
    where?: any,
    options?: any
  ): Promise<Product> {
    if (product && product.categories && product.categories.length > 0) {
      product.category_ids = product.categories.map(c => c.id);
    }
    return product;
  }

}