import { DataSource } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { Permission } from '@/shared/entities/permission.entity';
import { User } from '@/shared/entities/user.entity';

@Injectable()
export class SeedPermissions {
  private readonly logger = new Logger(SeedPermissions.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed(): Promise<void> {
    this.logger.log('Seeding permissions...');

    const permRepo = this.dataSource.getRepository(Permission);
    const userRepo = this.dataSource.getRepository(User);

    // Check if permissions already exist
    const existingPermissions = await permRepo.count();
    if (existingPermissions > 0) {
      this.logger.log('Permissions already seeded, skipping...');
      return;
    }

    // Get admin user for audit fields
    const adminUser = await userRepo.findOne({ where: { username: 'admin' } as any });
    const defaultUserId = adminUser?.id ?? 1;

    // Seed permissions with hierarchy - theo module/chức năng
    const permissions = [
      // ========== DASHBOARD MODULE ==========
      { code: 'dashboard.read', name: 'Xem Dashboard', status: 'active', parent_code: null },
      
      // ========== POST MODULE ==========
      { code: 'post.manage', name: 'Quản lý Bài viết', status: 'active', parent_code: null },
      { code: 'post.create', name: 'Tạo Bài viết', status: 'active', parent_code: 'post.manage' },
      { code: 'post.read', name: 'Xem Bài viết', status: 'active', parent_code: 'post.manage' },
      { code: 'post.update', name: 'Sửa Bài viết', status: 'active', parent_code: 'post.manage' },
      { code: 'post.delete', name: 'Xóa Bài viết', status: 'active', parent_code: 'post.manage' },
      { code: 'post.publish', name: 'Xuất bản Bài viết', status: 'active', parent_code: 'post.manage' },
      
      // ========== POST CATEGORY MODULE ==========
      { code: 'postcategory.manage', name: 'Quản lý Danh mục', status: 'active', parent_code: null },
      { code: 'postcategory.create', name: 'Tạo Danh mục', status: 'active', parent_code: 'postcategory.manage' },
      { code: 'postcategory.read', name: 'Xem Danh mục', status: 'active', parent_code: 'postcategory.manage' },
      { code: 'postcategory.update', name: 'Sửa Danh mục', status: 'active', parent_code: 'postcategory.manage' },
      { code: 'postcategory.delete', name: 'Xóa Danh mục', status: 'active', parent_code: 'postcategory.manage' },
      
      // ========== POST TAG MODULE ==========
      { code: 'posttag.manage', name: 'Quản lý Thẻ', status: 'active', parent_code: null },
      { code: 'posttag.create', name: 'Tạo Thẻ', status: 'active', parent_code: 'posttag.manage' },
      { code: 'posttag.read', name: 'Xem Thẻ', status: 'active', parent_code: 'posttag.manage' },
      { code: 'posttag.update', name: 'Sửa Thẻ', status: 'active', parent_code: 'posttag.manage' },
      { code: 'posttag.delete', name: 'Xóa Thẻ', status: 'active', parent_code: 'posttag.manage' },
      
      // ========== USER MODULE ==========
      { code: 'user.manage', name: 'Quản lý Người dùng', status: 'active', parent_code: null },
      { code: 'user.create', name: 'Tạo Người dùng', status: 'active', parent_code: 'user.manage' },
      { code: 'user.read', name: 'Xem Người dùng', status: 'active', parent_code: 'user.manage' },
      { code: 'user.update', name: 'Sửa Người dùng', status: 'active', parent_code: 'user.manage' },
      { code: 'user.delete', name: 'Xóa Người dùng', status: 'active', parent_code: 'user.manage' },
      { code: 'user.activate', name: 'Kích hoạt Người dùng', status: 'active', parent_code: 'user.manage' },
      { code: 'user.deactivate', name: 'Vô hiệu hóa Người dùng', status: 'active', parent_code: 'user.manage' },
      
      // ========== ROLE MODULE ==========
      { code: 'role.manage', name: 'Quản lý Vai trò', status: 'active', parent_code: null },
      { code: 'role.create', name: 'Tạo Vai trò', status: 'active', parent_code: 'role.manage' },
      { code: 'role.read', name: 'Xem Vai trò', status: 'active', parent_code: 'role.manage' },
      { code: 'role.update', name: 'Sửa Vai trò', status: 'active', parent_code: 'role.manage' },
      { code: 'role.delete', name: 'Xóa Vai trò', status: 'active', parent_code: 'role.manage' },
      { code: 'role.assign', name: 'Gán Vai trò', status: 'active', parent_code: 'role.manage' },
      
      // ========== PERMISSION MODULE ==========
      { code: 'permission.manage', name: 'Quản lý Quyền', status: 'active', parent_code: null },
      { code: 'permission.read', name: 'Xem Quyền', status: 'active', parent_code: 'permission.manage' },
      { code: 'permission.assign', name: 'Gán Quyền', status: 'active', parent_code: 'permission.manage' },
      
      // ========== SYSTEM MODULE ==========
      { code: 'system.manage', name: 'Quản lý Hệ thống', status: 'active', parent_code: null },
      { code: 'system.settings', name: 'Cài đặt Hệ thống', status: 'active', parent_code: 'system.manage' },
      { code: 'system.logs', name: 'Xem Nhật ký', status: 'active', parent_code: 'system.manage' },
      { code: 'system.backup', name: 'Sao lưu Hệ thống', status: 'active', parent_code: 'system.manage' },
      
      // ========== MENU MODULE ==========
      { code: 'menu.manage', name: 'Quản lý Menu', status: 'active', parent_code: null },
      { code: 'menu.create', name: 'Tạo Menu', status: 'active', parent_code: 'menu.manage' },
      { code: 'menu.read', name: 'Xem Menu', status: 'active', parent_code: 'menu.manage' },
      { code: 'menu.update', name: 'Sửa Menu', status: 'active', parent_code: 'menu.manage' },
      { code: 'menu.delete', name: 'Xóa Menu', status: 'active', parent_code: 'menu.manage' },
      
      // ========== PRODUCT MODULE ==========
      { code: 'product.manage', name: 'Quản lý Sản phẩm', status: 'active', parent_code: null },
      { code: 'product.create', name: 'Tạo Sản phẩm', status: 'active', parent_code: 'product.manage' },
      { code: 'product.read', name: 'Xem Sản phẩm', status: 'active', parent_code: 'product.manage' },
      { code: 'product.update', name: 'Sửa Sản phẩm', status: 'active', parent_code: 'product.manage' },
      { code: 'product.delete', name: 'Xóa Sản phẩm', status: 'active', parent_code: 'product.manage' },
      { code: 'product.category.manage', name: 'Quản lý Danh mục sản phẩm', status: 'active', parent_code: 'product.manage' },
      { code: 'product.attribute.manage', name: 'Quản lý Thuộc tính sản phẩm', status: 'active', parent_code: 'product.manage' },
      
      // ========== ORDER MODULE ==========
      { code: 'order.manage', name: 'Quản lý Đơn hàng', status: 'active', parent_code: null },
      { code: 'order.create', name: 'Tạo Đơn hàng', status: 'active', parent_code: 'order.manage' },
      { code: 'order.read', name: 'Xem Đơn hàng', status: 'active', parent_code: 'order.manage' },
      { code: 'order.update', name: 'Sửa Đơn hàng', status: 'active', parent_code: 'order.manage' },
      { code: 'order.delete', name: 'Xóa Đơn hàng', status: 'active', parent_code: 'order.manage' },
      { code: 'order.cancel', name: 'Hủy Đơn hàng', status: 'active', parent_code: 'order.manage' },
      { code: 'order.process', name: 'Xử lý Đơn hàng', status: 'active', parent_code: 'order.manage' },
      
      // ========== BANNER MODULE ==========
      { code: 'banner.manage', name: 'Quản lý Banner', status: 'active', parent_code: null },
      { code: 'banner.create', name: 'Tạo Banner', status: 'active', parent_code: 'banner.manage' },
      { code: 'banner.read', name: 'Xem Banner', status: 'active', parent_code: 'banner.manage' },
      { code: 'banner.update', name: 'Sửa Banner', status: 'active', parent_code: 'banner.manage' },
      { code: 'banner.delete', name: 'Xóa Banner', status: 'active', parent_code: 'banner.manage' },
      { code: 'banner.location.manage', name: 'Quản lý Vị trí Banner', status: 'active', parent_code: 'banner.manage' },
      
      // ========== WAREHOUSE MODULE ==========
      { code: 'warehouse.manage', name: 'Quản lý Kho hàng', status: 'active', parent_code: null },
      { code: 'warehouse.create', name: 'Tạo Kho hàng', status: 'active', parent_code: 'warehouse.manage' },
      { code: 'warehouse.read', name: 'Xem Kho hàng', status: 'active', parent_code: 'warehouse.manage' },
      { code: 'warehouse.update', name: 'Sửa Kho hàng', status: 'active', parent_code: 'warehouse.manage' },
      { code: 'warehouse.delete', name: 'Xóa Kho hàng', status: 'active', parent_code: 'warehouse.manage' },
      { code: 'warehouse.inventory.manage', name: 'Quản lý Tồn kho', status: 'active', parent_code: 'warehouse.manage' },
      { code: 'warehouse.transfer.manage', name: 'Quản lý Chuyển kho', status: 'active', parent_code: 'warehouse.manage' },
      
      // ========== PAYMENT METHOD MODULE ==========
      { code: 'payment_method.manage', name: 'Quản lý Phương thức thanh toán', status: 'active', parent_code: null },
      { code: 'payment_method.create', name: 'Tạo Phương thức thanh toán', status: 'active', parent_code: 'payment_method.manage' },
      { code: 'payment_method.read', name: 'Xem Phương thức thanh toán', status: 'active', parent_code: 'payment_method.manage' },
      { code: 'payment_method.update', name: 'Sửa Phương thức thanh toán', status: 'active', parent_code: 'payment_method.manage' },
      { code: 'payment_method.delete', name: 'Xóa Phương thức thanh toán', status: 'active', parent_code: 'payment_method.manage' },
      
      // ========== SHIPPING METHOD MODULE ==========
      { code: 'shipping_method.manage', name: 'Quản lý Phương thức vận chuyển', status: 'active', parent_code: null },
      { code: 'shipping_method.create', name: 'Tạo Phương thức vận chuyển', status: 'active', parent_code: 'shipping_method.manage' },
      { code: 'shipping_method.read', name: 'Xem Phương thức vận chuyển', status: 'active', parent_code: 'shipping_method.manage' },
      { code: 'shipping_method.update', name: 'Sửa Phương thức vận chuyển', status: 'active', parent_code: 'shipping_method.manage' },
      { code: 'shipping_method.delete', name: 'Xóa Phương thức vận chuyển', status: 'active', parent_code: 'shipping_method.manage' },
      
      // ========== COUPON MODULE ==========
      { code: 'coupon.manage', name: 'Quản lý Mã giảm giá', status: 'active', parent_code: null },
      { code: 'coupon.create', name: 'Tạo Mã giảm giá', status: 'active', parent_code: 'coupon.manage' },
      { code: 'coupon.read', name: 'Xem Mã giảm giá', status: 'active', parent_code: 'coupon.manage' },
      { code: 'coupon.update', name: 'Sửa Mã giảm giá', status: 'active', parent_code: 'coupon.manage' },
      { code: 'coupon.delete', name: 'Xóa Mã giảm giá', status: 'active', parent_code: 'coupon.manage' },
      
      // ========== CONTACT MODULE ==========
      { code: 'contact.manage', name: 'Quản lý Liên hệ', status: 'active', parent_code: null },
      { code: 'contact.read', name: 'Xem Liên hệ', status: 'active', parent_code: 'contact.manage' },
      { code: 'contact.update', name: 'Sửa Liên hệ', status: 'active', parent_code: 'contact.manage' },
      { code: 'contact.delete', name: 'Xóa Liên hệ', status: 'active', parent_code: 'contact.manage' },
      
      // ========== SYSTEM CONFIG MODULE ==========
      { code: 'system_config.manage', name: 'Quản lý Cấu hình hệ thống', status: 'active', parent_code: null },
      { code: 'system_config.read', name: 'Xem Cấu hình', status: 'active', parent_code: 'system_config.manage' },
      { code: 'system_config.update', name: 'Sửa Cấu hình', status: 'active', parent_code: 'system_config.manage' },
    ];

    const createdPermissions: Map<string, Permission> = new Map();

    // Create permissions in order (parents first)
    const sortedPermissions = this.sortPermissionsByParent(permissions);
    
    for (const permData of sortedPermissions) {
      let parentPermission: Permission | null = null;
      if (permData.parent_code) {
        parentPermission = createdPermissions.get(permData.parent_code) || null;
        if (!parentPermission) {
          this.logger.warn(`Parent permission not found for ${permData.code}, skipping parent relation`);
        }
      }

      const permission = permRepo.create({
        code: permData.code,
        name: permData.name,
        status: permData.status,
        parent: parentPermission,
        created_user_id: defaultUserId,
        updated_user_id: defaultUserId,
      });
      const saved = await permRepo.save(permission);
      createdPermissions.set(saved.code, saved);
      this.logger.log(`Created permission: ${saved.code}${parentPermission ? ` (parent: ${parentPermission.code})` : ''}`);
    }

    this.logger.log(`Permissions seeding completed - Total: ${createdPermissions.size}`);
  }

  private sortPermissionsByParent(permissions: Array<{code: string, name: string, status: string, parent_code: string | null}>): Array<{code: string, name: string, status: string, parent_code: string | null}> {
    const result: Array<{code: string, name: string, status: string, parent_code: string | null}> = [];
    const processed = new Set<string>();

    // First pass: add all permissions without parents
    for (const perm of permissions) {
      if (!perm.parent_code) {
        result.push(perm);
        processed.add(perm.code);
      }
    }

    // Second pass: add children
    let changed = true;
    while (changed) {
      changed = false;
      for (const perm of permissions) {
        if (!processed.has(perm.code)) {
          if (!perm.parent_code || processed.has(perm.parent_code)) {
            result.push(perm);
            processed.add(perm.code);
            changed = true;
          }
        }
      }
    }

    return result;
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing permissions...');
    const permRepo = this.dataSource.getRepository(Permission);
    await permRepo.clear();
    this.logger.log('Permissions cleared');
  }
}
