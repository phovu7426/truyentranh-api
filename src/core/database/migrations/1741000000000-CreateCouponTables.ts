import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateCouponTables1741000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create coupons table
    await queryRunner.createTable(
      new Table({
        name: 'coupons',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            unsigned: true,
          },
          {
            name: 'code',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'group_id',
            type: 'bigint',
            unsigned: true,
            isNullable: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['percentage', 'fixed_amount', 'free_shipping'],
          },
          {
            name: 'value',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
          {
            name: 'min_order_value',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'max_discount_amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'usage_limit',
            type: 'int',
            unsigned: true,
            isNullable: true,
          },
          {
            name: 'usage_per_customer',
            type: 'int',
            unsigned: true,
            default: 1,
          },
          {
            name: 'used_count',
            type: 'int',
            unsigned: true,
            default: 0,
          },
          {
            name: 'start_date',
            type: 'datetime',
          },
          {
            name: 'end_date',
            type: 'datetime',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'expired'],
            default: "'active'",
          },
          {
            name: 'applicable_products',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'applicable_categories',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'excluded_products',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'first_order_only',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_user_id',
            type: 'bigint',
            unsigned: true,
            isNullable: true,
          },
          {
            name: 'updated_user_id',
            type: 'bigint',
            unsigned: true,
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'datetime',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create indexes for coupons table
    await queryRunner.createIndex(
      'coupons',
      new TableIndex({
        name: 'idx_coupons_code',
        columnNames: ['code'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'coupons',
      new TableIndex({
        name: 'idx_coupons_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'coupons',
      new TableIndex({
        name: 'idx_coupons_dates',
        columnNames: ['start_date', 'end_date'],
      }),
    );

    await queryRunner.createIndex(
      'coupons',
      new TableIndex({
        name: 'idx_coupons_group_id',
        columnNames: ['group_id'],
      }),
    );

    // Create coupon_usage table
    await queryRunner.createTable(
      new Table({
        name: 'coupon_usage',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            unsigned: true,
          },
          {
            name: 'coupon_id',
            type: 'bigint',
            unsigned: true,
          },
          {
            name: 'user_id',
            type: 'bigint',
            unsigned: true,
          },
          {
            name: 'order_id',
            type: 'bigint',
            unsigned: true,
          },
          {
            name: 'discount_amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
          {
            name: 'order_total',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
          {
            name: 'used_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'created_user_id',
            type: 'bigint',
            unsigned: true,
            isNullable: true,
          },
          {
            name: 'updated_user_id',
            type: 'bigint',
            unsigned: true,
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'datetime',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create indexes for coupon_usage table
    await queryRunner.createIndex(
      'coupon_usage',
      new TableIndex({
        name: 'idx_coupon_usage_coupon_id',
        columnNames: ['coupon_id'],
      }),
    );

    await queryRunner.createIndex(
      'coupon_usage',
      new TableIndex({
        name: 'idx_coupon_usage_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'coupon_usage',
      new TableIndex({
        name: 'idx_coupon_usage_order_id',
        columnNames: ['order_id'],
      }),
    );

    await queryRunner.createIndex(
      'coupon_usage',
      new TableIndex({
        name: 'idx_coupon_usage_user_coupon',
        columnNames: ['user_id', 'coupon_id'],
      }),
    );

    await queryRunner.createIndex(
      'coupon_usage',
      new TableIndex({
        name: 'idx_coupon_usage_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );

    // Create foreign keys for coupon_usage table
    await queryRunner.createForeignKey(
      'coupon_usage',
      new TableForeignKey({
        columnNames: ['coupon_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'coupons',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'coupon_usage',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'coupon_usage',
      new TableForeignKey({
        columnNames: ['order_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'orders',
        onDelete: 'CASCADE',
      }),
    );

    // Insert sample coupons
    const now = new Date();
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3); // 3 months from now

    await queryRunner.query(`
      INSERT INTO coupons (code, name, description, type, value, min_order_value, usage_limit, usage_per_customer, start_date, end_date, status, created_at, updated_at) VALUES
      ('WELCOME10', 'Welcome Discount', '10% discount for new customers', 'percentage', '10.00', '0.00', 100, 1, '${now.toISOString().slice(0, 19).replace('T', ' ')}', '${futureDate.toISOString().slice(0, 19).replace('T', ' ')}', 'active', NOW(), NOW()),
      ('SAVE20', 'Save 20%', '20% discount on orders above $50', 'percentage', '20.00', '50.00', 50, 3, '${now.toISOString().slice(0, 19).replace('T', ' ')}', '${futureDate.toISOString().slice(0, 19).replace('T', ' ')}', 'active', NOW(), NOW()),
      ('FLAT15', 'Flat $15 Off', '$15 discount on orders above $100', 'fixed_amount', '15.00', '100.00', 75, 2, '${now.toISOString().slice(0, 19).replace('T', ' ')}', '${futureDate.toISOString().slice(0, 19).replace('T', ' ')}', 'active', NOW(), NOW()),
      ('FREESHIP', 'Free Shipping', 'Free shipping on all orders', 'free_shipping', '0.00', '0.00', 200, 5, '${now.toISOString().slice(0, 19).replace('T', ' ')}', '${futureDate.toISOString().slice(0, 19).replace('T', ' ')}', 'active', NOW(), NOW()),
      ('FIRST25', 'First Order 25%', '25% discount on first order', 'percentage', '25.00', '0.00', 150, 1, '${now.toISOString().slice(0, 19).replace('T', ' ')}', '${futureDate.toISOString().slice(0, 19).replace('T', ' ')}', 'active', NOW(), NOW()),
      ('SUMMER30', 'Summer Sale', '30% discount on selected categories', 'percentage', '30.00', '75.00', 40, 2, '${now.toISOString().slice(0, 19).replace('T', ' ')}', '${futureDate.toISOString().slice(0, 19).replace('T', ' ')}', 'active', NOW(), NOW()),
      ('WEEKEND5', 'Weekend Special', '$5 off for weekend shopping', 'fixed_amount', '5.00', '25.00', 300, 3, '${now.toISOString().slice(0, 19).replace('T', ' ')}', '${futureDate.toISOString().slice(0, 19).replace('T', ' ')}', 'active', NOW(), NOW()),
      ('LOYALTY15', 'Loyalty Reward', '15% discount for loyal customers', 'percentage', '15.00', '40.00', 60, 4, '${now.toISOString().slice(0, 19).replace('T', ' ')}', '${futureDate.toISOString().slice(0, 19).replace('T', ' ')}', 'active', NOW(), NOW())
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('coupon_usage');
    await queryRunner.dropTable('coupons');
  }
}