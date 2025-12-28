import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateShippingAndPaymentTables1738000000300 implements MigrationInterface {
  name = 'CreateShippingAndPaymentTables1738000000300';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // shipping_methods
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS shipping_methods (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL UNIQUE,
        description TEXT NULL,
        base_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
        estimated_days INT NULL,
        status ENUM('active','inactive') NOT NULL DEFAULT 'active',
        created_user_id BIGINT UNSIGNED NULL,
        updated_user_id BIGINT UNSIGNED NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL,
        PRIMARY KEY (id),
        INDEX idx_shipping_methods_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // payment_methods
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL UNIQUE,
        description TEXT NULL,
        provider VARCHAR(100) NULL,
        config JSON NULL,
        type ENUM('online', 'offline') NOT NULL DEFAULT 'offline',
        status ENUM('active','inactive') NOT NULL DEFAULT 'active',
        created_user_id BIGINT UNSIGNED NULL,
        updated_user_id BIGINT UNSIGNED NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL,
        PRIMARY KEY (id),
        INDEX idx_payment_methods_status (status),
        INDEX idx_payment_methods_type (type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // payments
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        order_id BIGINT UNSIGNED NOT NULL,
        payment_method_id BIGINT UNSIGNED NOT NULL,
        payment_method_type ENUM('online', 'offline') NOT NULL DEFAULT 'offline',
        status ENUM('pending','processing','completed','failed','refunded') NOT NULL DEFAULT 'pending',
        amount DECIMAL(15,2) NOT NULL,
        transaction_id VARCHAR(255) NULL,
        payment_method_code VARCHAR(100) NULL,
        paid_at DATETIME NULL,
        refunded_at DATETIME NULL,
        notes TEXT NULL,
        created_user_id BIGINT UNSIGNED NULL,
        updated_user_id BIGINT UNSIGNED NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL,
        PRIMARY KEY (id),
        INDEX idx_payments_order_id (order_id),
        INDEX idx_payments_method_id (payment_method_id),
        INDEX idx_payments_method_type (payment_method_type),
        INDEX idx_payments_status (status),
        INDEX idx_payments_deleted_at (deleted_at),
        CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        CONSTRAINT fk_payments_method FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // alter orders add shipping_method_id
    await queryRunner.query(`
      ALTER TABLE orders
      ADD COLUMN shipping_method_id BIGINT UNSIGNED NULL AFTER billing_address,
      ADD INDEX idx_orders_shipping_method_id (shipping_method_id),
      ADD CONSTRAINT fk_orders_shipping_method FOREIGN KEY (shipping_method_id) REFERENCES shipping_methods(id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE orders DROP FOREIGN KEY fk_orders_shipping_method`);
    await queryRunner.query(`ALTER TABLE orders DROP COLUMN shipping_method_id`);
    await queryRunner.query(`DROP TABLE IF EXISTS payments`);
    await queryRunner.query(`DROP TABLE IF EXISTS payment_methods`);
    await queryRunner.query(`DROP TABLE IF EXISTS shipping_methods`);
  }
}


