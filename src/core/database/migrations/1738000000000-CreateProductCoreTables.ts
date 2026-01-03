import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductCoreTables1738000000000 implements MigrationInterface {
  name = 'CreateProductCoreTables1738000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // product_categories
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_categories (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT NULL,
        parent_id BIGINT UNSIGNED NULL,
        image VARCHAR(500) NULL,
        icon VARCHAR(100) NULL,
        status ENUM('active','inactive') NOT NULL DEFAULT 'active',
        sort_order INT NOT NULL DEFAULT 0,
        meta_title VARCHAR(255) NULL,
        meta_description TEXT NULL,
        canonical_url VARCHAR(500) NULL,
        og_image VARCHAR(500) NULL,
        created_user_id BIGINT UNSIGNED NULL,
        updated_user_id BIGINT UNSIGNED NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL,
        PRIMARY KEY (id),
        INDEX idx_product_categories_name (name),
        INDEX idx_product_categories_parent_id (parent_id),
        INDEX idx_product_categories_status (status),
        INDEX idx_product_categories_sort_order (sort_order),
        INDEX idx_product_categories_status_sort (status, sort_order),
        INDEX idx_product_categories_parent_status (parent_id, status),
        INDEX idx_product_categories_deleted_at (deleted_at),
        CONSTRAINT fk_pc_parent FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // products
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS products (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        sku VARCHAR(100) NOT NULL UNIQUE,
        description LONGTEXT NULL,
        short_description TEXT NULL,
        min_stock_level INT NOT NULL DEFAULT 0,
        image VARCHAR(500) NULL,
        gallery JSON NULL,
        status ENUM('active','inactive','draft') NOT NULL DEFAULT 'active',
        is_featured BOOLEAN NOT NULL DEFAULT FALSE,
        is_variable BOOLEAN NOT NULL DEFAULT TRUE,
        is_digital BOOLEAN NOT NULL DEFAULT FALSE,
        download_limit INT NULL,
        meta_title VARCHAR(255) NULL,
        meta_description TEXT NULL,
        canonical_url VARCHAR(500) NULL,
        og_title VARCHAR(255) NULL,
        og_description TEXT NULL,
        og_image VARCHAR(500) NULL,
        group_id BIGINT UNSIGNED NULL,
        created_user_id BIGINT UNSIGNED NULL,
        updated_user_id BIGINT UNSIGNED NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL,
        PRIMARY KEY (id),
        INDEX idx_products_name (name),
        INDEX idx_products_status (status),
        INDEX idx_products_is_featured (is_featured),
        INDEX idx_products_is_variable (is_variable),
        INDEX idx_products_is_digital (is_digital),
        INDEX idx_products_status_featured (status, is_featured),
        INDEX idx_products_status_created (status, created_at),
        INDEX idx_products_deleted_at (deleted_at),
        INDEX idx_products_group_id (group_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // product_attributes
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_attributes (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        type ENUM('text','select','multiselect','color','image') NOT NULL DEFAULT 'text',
        is_required BOOLEAN NOT NULL DEFAULT FALSE,
        is_variation BOOLEAN NOT NULL DEFAULT FALSE,
        is_filterable BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order INT NOT NULL DEFAULT 0,
        status ENUM('active','inactive') NOT NULL DEFAULT 'active',
        created_user_id BIGINT UNSIGNED NULL,
        updated_user_id BIGINT UNSIGNED NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL,
        PRIMARY KEY (id),
        INDEX idx_product_attributes_name (name),
        INDEX idx_product_attributes_type (type),
        INDEX idx_product_attributes_required (is_required),
        INDEX idx_product_attributes_variation (is_variation),
        INDEX idx_product_attributes_filterable (is_filterable),
        INDEX idx_product_attributes_status (status),
        INDEX idx_product_attributes_sort_order (sort_order),
        INDEX idx_product_attributes_status_sort (status, sort_order),
        INDEX idx_product_attributes_variation_status (is_variation, status),
        INDEX idx_product_attributes_deleted_at (deleted_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // product_attribute_values
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_attribute_values (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        product_attribute_id BIGINT UNSIGNED NOT NULL,
        value VARCHAR(255) NOT NULL,
        color_code VARCHAR(7) NULL,
        image VARCHAR(500) NULL,
        sort_order INT NOT NULL DEFAULT 0,
        status ENUM('active','inactive') NOT NULL DEFAULT 'active',
        created_user_id BIGINT UNSIGNED NULL,
        updated_user_id BIGINT UNSIGNED NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL,
        PRIMARY KEY (id),
        INDEX idx_pav_attribute_id (product_attribute_id),
        INDEX idx_pav_value (value),
        INDEX idx_pav_color_code (color_code),
        INDEX idx_pav_status (status),
        INDEX idx_pav_sort_order (sort_order),
        INDEX idx_pav_attr_status (product_attribute_id, status),
        INDEX idx_pav_attr_sort (product_attribute_id, sort_order),
        INDEX idx_pav_deleted_at (deleted_at),
        CONSTRAINT fk_pav_attribute FOREIGN KEY (product_attribute_id) REFERENCES product_attributes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // product_variants
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        product_id BIGINT UNSIGNED NOT NULL,
        sku VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(15,2) NOT NULL,
        sale_price DECIMAL(15,2) NULL,
        cost_price DECIMAL(15,2) NULL,
        stock_quantity INT NOT NULL DEFAULT 0,
        weight DECIMAL(8,2) NULL,
        image VARCHAR(500) NULL,
        status ENUM('active','inactive') NOT NULL DEFAULT 'active',
        created_user_id BIGINT UNSIGNED NULL,
        updated_user_id BIGINT UNSIGNED NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL,
        PRIMARY KEY (id),
        INDEX idx_product_variants_product_id (product_id),
        INDEX idx_product_variants_name (name),
        INDEX idx_product_variants_price (price),
        INDEX idx_product_variants_sale_price (sale_price),
        INDEX idx_product_variants_stock (stock_quantity),
        INDEX idx_product_variants_status (status),
        INDEX idx_product_variants_product_status (product_id, status),
        INDEX idx_product_variants_status_stock (status, stock_quantity),
        INDEX idx_product_variants_deleted_at (deleted_at),
        CONSTRAINT fk_variant_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        CONSTRAINT chk_variant_sale_price CHECK (sale_price IS NULL OR sale_price <= price),
        CONSTRAINT chk_variant_stock CHECK (stock_quantity >= 0),
        CONSTRAINT chk_product_variants_price_non_negative CHECK (price >= 0)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS product_variants`);
    await queryRunner.query(`DROP TABLE IF EXISTS product_attribute_values`);
    await queryRunner.query(`DROP TABLE IF EXISTS product_attributes`);
    await queryRunner.query(`DROP TABLE IF EXISTS products`);
    await queryRunner.query(`DROP TABLE IF EXISTS product_categories`);
  }
}


