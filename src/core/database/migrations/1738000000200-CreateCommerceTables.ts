import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCommerceTables1738000000200 implements MigrationInterface {
  name = 'CreateCommerceTables1738000000200';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // cart_headers - change PK to BIGINT, add uuid
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS cart_headers (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid VARCHAR(36) NULL UNIQUE,
        owner_key VARCHAR(120) NOT NULL,
        user_id BIGINT UNSIGNED NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'VND',
        subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
        tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        shipping_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        coupon_code VARCHAR(50) NULL,
        total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        created_user_id BIGINT UNSIGNED NULL,
        updated_user_id BIGINT UNSIGNED NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL,
        PRIMARY KEY (id),
        INDEX idx_cart_headers_owner_key (owner_key),
        INDEX idx_cart_headers_user_id (user_id),
        INDEX idx_cart_headers_updated_total (updated_at, total_amount),
        INDEX idx_cart_headers_deleted_at (deleted_at),
        CONSTRAINT chk_cart_total CHECK (total_amount >= 0),
        CONSTRAINT chk_cart_owner_key CHECK (owner_key <> '')
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // carts
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS carts (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        cart_header_id BIGINT UNSIGNED NOT NULL,
        product_id BIGINT UNSIGNED NOT NULL,
        product_variant_id BIGINT UNSIGNED NULL,
        product_name VARCHAR(255) NOT NULL,
        product_sku VARCHAR(100) NOT NULL,
        variant_name VARCHAR(255) NULL,
        quantity INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(15,2) NOT NULL,
        total_price DECIMAL(15,2) NOT NULL,
        product_attributes JSON NULL,
        created_user_id BIGINT UNSIGNED NULL,
        updated_user_id BIGINT UNSIGNED NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL,
        PRIMARY KEY (id),
        UNIQUE KEY uk_carts_header_product_variant (cart_header_id, product_id, product_variant_id),
        INDEX idx_carts_cart_header_id (cart_header_id),
        INDEX idx_carts_product_id (product_id),
        INDEX idx_carts_product_variant_id (product_variant_id),
        INDEX idx_carts_quantity (quantity),
        INDEX idx_carts_header_variant (cart_header_id, product_variant_id),
        INDEX idx_carts_deleted_at (deleted_at),
        CONSTRAINT fk_carts_header FOREIGN KEY (cart_header_id) REFERENCES cart_headers(id) ON DELETE CASCADE,
        CONSTRAINT fk_carts_product FOREIGN KEY (product_id) REFERENCES products(id),
        CONSTRAINT fk_carts_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id),
        CONSTRAINT chk_cart_quantity CHECK (quantity > 0)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // orders
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        order_number VARCHAR(50) NOT NULL UNIQUE,
        user_id BIGINT UNSIGNED NULL,
        group_id BIGINT UNSIGNED NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        shipping_address JSON NOT NULL,
        billing_address JSON NOT NULL,
        status ENUM('pending','confirmed','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
        payment_status ENUM('pending','paid','failed','refunded','partially_refunded') NOT NULL DEFAULT 'pending',
        shipping_status ENUM('pending','preparing','shipped','delivered','returned') NOT NULL DEFAULT 'pending',
        order_type ENUM('physical', 'digital', 'mixed') NOT NULL DEFAULT 'physical',
        subtotal DECIMAL(15,2) NOT NULL,
        tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        shipping_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        total_amount DECIMAL(15,2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'VND',
        notes TEXT NULL,
        tracking_number VARCHAR(100) NULL,
        shipped_at DATETIME NULL,
        delivered_at DATETIME NULL,
        session_token VARCHAR(255) NULL COMMENT 'Session token for guest users to track their orders',
        payment_method_id BIGINT UNSIGNED NULL COMMENT 'ID of the payment method used for this order',
        created_user_id BIGINT UNSIGNED NULL,
        updated_user_id BIGINT UNSIGNED NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL,
        PRIMARY KEY (id),
        INDEX idx_orders_user_id (user_id),
        INDEX idx_orders_customer_email (customer_email),
        INDEX idx_orders_customer_phone (customer_phone),
        INDEX idx_orders_status (status),
        INDEX idx_orders_payment_status (payment_status),
        INDEX idx_orders_shipping_status (shipping_status),
        INDEX idx_orders_order_type (order_type),
        INDEX idx_orders_total_amount (total_amount),
        INDEX idx_orders_tracking_number (tracking_number),
        INDEX idx_orders_status_created (status, created_at),
        INDEX idx_orders_payment_created (payment_status, created_at),
        INDEX idx_orders_user_status (user_id, status),
        INDEX idx_orders_deleted_at (deleted_at),
        INDEX idx_orders_session_token (session_token),
        INDEX idx_orders_user_session (user_id, session_token),
        INDEX idx_orders_group_id (group_id),
        INDEX idx_orders_deleted_status_updated (deleted_at, status, updated_at),
        CONSTRAINT chk_order_total CHECK (total_amount >= 0),
        CONSTRAINT chk_orders_amounts_non_negative CHECK (
          subtotal >= 0 AND 
          tax_amount >= 0 AND 
          shipping_amount >= 0 AND 
          discount_amount >= 0 AND 
          total_amount >= 0
        )
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // order_items
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        order_id BIGINT UNSIGNED NOT NULL,
        product_id BIGINT UNSIGNED NOT NULL,
        product_variant_id BIGINT UNSIGNED NULL,
        product_name VARCHAR(255) NOT NULL,
        product_sku VARCHAR(100) NOT NULL,
        variant_name VARCHAR(255) NULL,
        quantity INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(15,2) NOT NULL,
        total_price DECIMAL(15,2) NOT NULL,
        product_attributes JSON NULL,
        created_user_id BIGINT UNSIGNED NULL,
        updated_user_id BIGINT UNSIGNED NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL,
        PRIMARY KEY (id),
        INDEX idx_order_items_order_id (order_id),
        INDEX idx_order_items_product_id (product_id),
        INDEX idx_order_items_variant_id (product_variant_id),
        INDEX idx_order_items_product_sku (product_sku),
        INDEX idx_order_items_quantity (quantity),
        INDEX idx_order_items_unit_total (unit_price, total_price),
        INDEX idx_order_items_variant_created (product_variant_id, created_at),
        INDEX idx_order_items_deleted_at (deleted_at),
        CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
        CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id),
        CONSTRAINT fk_order_items_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id),
        CONSTRAINT chk_order_quantity CHECK (quantity > 0)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS order_items`);
    await queryRunner.query(`DROP TABLE IF EXISTS orders`);
    await queryRunner.query(`DROP TABLE IF EXISTS carts`);
    await queryRunner.query(`DROP TABLE IF EXISTS cart_headers`);
  }
}


