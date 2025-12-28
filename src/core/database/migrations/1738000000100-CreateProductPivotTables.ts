import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductPivotTables1738000000100 implements MigrationInterface {
  name = 'CreateProductPivotTables1738000000100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // product_variant_attributes
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_variant_attributes (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        product_variant_id BIGINT UNSIGNED NOT NULL,
        product_attribute_id BIGINT UNSIGNED NOT NULL,
        product_attribute_value_id BIGINT UNSIGNED NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uk_pva_variant_attribute (product_variant_id, product_attribute_id),
        INDEX idx_pva_variant_id (product_variant_id),
        INDEX idx_pva_attribute_id (product_attribute_id),
        INDEX idx_pva_value_id (product_attribute_value_id),
        CONSTRAINT fk_pva_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
        CONSTRAINT fk_pva_attribute FOREIGN KEY (product_attribute_id) REFERENCES product_attributes(id) ON DELETE CASCADE,
        CONSTRAINT fk_pva_value FOREIGN KEY (product_attribute_value_id) REFERENCES product_attribute_values(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // product_category pivot
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_category (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        product_id BIGINT UNSIGNED NOT NULL,
        product_category_id BIGINT UNSIGNED NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uk_ppc_product_category (product_id, product_category_id),
        INDEX idx_ppc_product_id (product_id),
        INDEX idx_ppc_category_id (product_category_id),
        CONSTRAINT fk_ppc_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        CONSTRAINT fk_ppc_category FOREIGN KEY (product_category_id) REFERENCES product_categories(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS product_category`);
    await queryRunner.query(`DROP TABLE IF EXISTS product_variant_attributes`);
  }
}


