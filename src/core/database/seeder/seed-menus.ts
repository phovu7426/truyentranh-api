import { DataSource } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { Menu } from '@/shared/entities/menu.entity';
import { Permission } from '@/shared/entities/permission.entity';
import { User } from '@/shared/entities/user.entity';
import { MenuType } from '@/shared/enums/menu-type.enum';
import { BasicStatus } from '@/shared/enums/basic-status.enum';

@Injectable()
export class SeedMenus {
  private readonly logger = new Logger(SeedMenus.name);

  constructor(private readonly dataSource: DataSource) { }

  async seed(): Promise<void> {
    this.logger.log('Seeding menus...');

    const menuRepo = this.dataSource.getRepository(Menu);
    const permRepo = this.dataSource.getRepository(Permission);
    const userRepo = this.dataSource.getRepository(User);

    // Check if menus already exist
    const existingMenus = await menuRepo.count();
    if (existingMenus > 0) {
      this.logger.log('Menus already seeded, skipping...');
      return;
    }

    // Get admin user for audit fields
    const adminUser = await userRepo.findOne({ where: { username: 'admin' } as any });
    const defaultUserId = adminUser?.id ?? 1;

    // Get permissions
    const permissions = await permRepo.find();
    const permMap = new Map<string, Permission>();
    permissions.forEach(perm => permMap.set(perm.code, perm));

    // Seed menus based on frontend structure
    const menuData = [
      {
        code: 'admin.dashboard',
        name: 'Dashboard',
        path: '/admin',
        api_path: 'api/admin/dashboard',
        icon: '📊',
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
        parent_id: null,
        sort_order: 10,
        is_public: false,
        show_in_menu: true,
        permission_code: 'dashboard.read',
      },
      {
        code: 'admin.account-management',
        name: 'Quản lý tài khoản',
        path: '/admin/users',
        api_path: 'api/admin/users',
        icon: '👥',
        type: MenuType.GROUP,
        status: BasicStatus.Active,
        parent_id: null,
        sort_order: 20,
        is_public: false,
        show_in_menu: true,
        permission_code: 'user.manage',
      },
      {
        code: 'admin.users',
        name: 'Tài khoản',
        path: '/admin/users',
        api_path: 'api/admin/users',
        icon: '👤',
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
        parent_code: 'admin.account-management',
        sort_order: 10,
        is_public: false,
        show_in_menu: true,
        permission_code: 'user.manage',
      },
      {
        code: 'admin.roles',
        name: 'Vai trò',
        path: '/admin/roles',
        api_path: 'api/admin/roles',
        icon: '👑',
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
        parent_code: 'admin.account-management',
        sort_order: 20,
        is_public: false,
        show_in_menu: true,
        permission_code: 'role.manage',
      },
      {
        code: 'admin.permissions',
        name: 'Quyền',
        path: '/admin/permissions',
        api_path: 'api/admin/permissions',
        icon: '🔑',
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
        parent_code: 'admin.account-management',
        sort_order: 30,
        is_public: false,
        show_in_menu: true,
        permission_code: 'permission.manage',
      },
      {
        code: 'admin.products',
        name: 'Quản lý sản phẩm',
        path: '/admin/products',
        api_path: 'api/admin/products',
        icon: '📦',
        type: MenuType.GROUP,
        status: BasicStatus.Active,
        parent_id: null,
        sort_order: 30,
        is_public: false,
        show_in_menu: true,
        permission_code: 'product.manage',
      },
      {
        code: 'admin.products.list',
        name: 'Sản phẩm',
        path: '/admin/products',
        api_path: 'api/admin/products',
        icon: '📦',
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
        parent_code: 'admin.products',
        sort_order: 10,
        is_public: false,
        show_in_menu: true,
        permission_code: 'product.manage',
      },
      {
        code: 'admin.product-variants',
        name: 'Biến thể sản phẩm',
        path: '/admin/product-variants',
        api_path: 'api/admin/product-variants',
        icon: '🔀',
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
        parent_code: 'admin.products',
        sort_order: 20,
        is_public: false,
        show_in_menu: true,
        permission_code: 'product.manage',
      },
      {
        code: 'admin.product-categories',
        name: 'Danh mục sản phẩm',
        path: '/admin/product-categories',
        api_path: 'api/admin/product-categories',
        icon: '🗂️',
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
        parent_code: 'admin.products',
        sort_order: 30,
        is_public: false,
        show_in_menu: true,
        permission_code: 'product.manage',
      },
      {
        code: 'admin.product-attributes',
        name: 'Thuộc tính sản phẩm',
        path: '/admin/product-attributes',
        api_path: 'api/admin/product-attributes',
        icon: '🧩',
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
        parent_code: 'admin.products',
        sort_order: 40,
        is_public: false,
        show_in_menu: true,
        permission_code: 'product.manage',
      },
      {
        code: 'admin.product-attribute-values',
        name: 'Giá trị thuộc tính',
        path: '/admin/product-attribute-values',
        api_path: 'api/admin/product-attribute-values',
        icon: '📝',
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
        parent_code: 'admin.products',
        sort_order: 50,
        is_public: false,
        show_in_menu: true,
        permission_code: 'product.manage',
      },
      {
        code: 'admin.posts',
        name: 'Quản lý nội dung',
        path: '/admin/posts',
        api_path: 'api/admin/posts',
        icon: '📰',
        type: MenuType.GROUP,
        status: BasicStatus.Active,
        parent_id: null,
        sort_order: 40,
        is_public: false,
        show_in_menu: true,
        permission_code: 'post.manage',
      },
      {
        code: 'admin.posts.list',
        name: 'Tin tức',
        path: '/admin/posts',
        api_path: 'api/admin/posts',
        icon: '📰',
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
        parent_code: 'admin.posts',
        sort_order: 10,
        is_public: false,
        show_in_menu: true,
        permission_code: 'post.manage',
      },
      {
        code: 'admin.post-categories',
        name: 'Danh mục bài viết',
        path: '/admin/post-categories',
        api_path: 'api/admin/post-categories',
        icon: '📁',
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
        parent_code: 'admin.posts',
        sort_order: 20,
        is_public: false,
        show_in_menu: true,
        permission_code: 'post.manage',
      },
      {
        code: 'admin.post-tags',
        name: 'Thẻ bài viết',
        path: '/admin/post-tags',
        api_path: 'api/admin/post-tags',
        icon: '🏷️',
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
        parent_code: 'admin.posts',
        sort_order: 30,
        is_public: false,
        show_in_menu: true,
        permission_code: 'post.manage',
      },
      {
        code: 'admin.orders',
        name: 'Đơn hàng',
        path: '/admin/orders',
        api_path: 'api/admin/orders',
        icon: '📋',
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
        parent_id: null,
        sort_order: 50,
        is_public: false,
        show_in_menu: true,
        permission_code: 'order.manage',
      },
      {
        code: 'admin.payment-shipping',
        name: 'Quản lý thanh toán & vận chuyển',
        path: '/admin/payment-methods',
        api_path: 'api/admin/payment-methods',
        icon: '💳',
        type: MenuType.GROUP,
        status: BasicStatus.Active,
        parent_id: null,
        sort_order: 60,
        is_public: false,
        show_in_menu: true,
        permission_code: 'payment_method.manage',
      },
      {
        code: 'admin.payment-methods',
        name: 'Phương thức thanh toán',
        path: '/admin/payment-methods',
        api_path: 'api/admin/payment-methods',
        icon: '💳',
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
        parent_code: 'admin.payment-shipping',
        sort_order: 10,
        is_public: false,
        show_in_menu: true,
        permission_code: 'payment_method.manage',
      },
      {
        code: 'admin.shipping-methods',
        name: 'Phương thức vận chuyển',
        path: '/admin/shipping-methods',
        api_path: 'api/admin/shipping-methods',
        icon: '🚚',
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
        parent_code: 'admin.payment-shipping',
        sort_order: 20,
        is_public: false,
        show_in_menu: true,
        permission_code: 'shipping_method.manage',
      },
      {
        code: 'admin.coupons',
        name: 'Quản lý khuyến mãi',
        path: '/admin/coupons',
        api_path: 'api/admin/coupons',
        icon: '🎟️',
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
        parent_id: null,
        sort_order: 70,
        is_public: false,
        show_in_menu: true,
        permission_code: 'coupon.manage',
      },
      {
        code: 'admin.warehouses',
        name: 'Quản lý kho hàng',
        path: '/admin/warehouses',
        api_path: 'api/admin/warehouses',
        icon: '📦',
        type: MenuType.GROUP,
        status: BasicStatus.Active,
        parent_id: null,
        sort_order: 80,
        is_public: false,
        show_in_menu: true,
        permission_code: 'warehouse.manage',
      },
      {
        code: 'admin.warehouses.list',
        name: 'Kho hàng',
        path: '/admin/warehouses',
        api_path: 'api/admin/warehouses',
        icon: '📦',
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
        parent_code: 'admin.warehouses',
        sort_order: 10,
        is_public: false,
        show_in_menu: true,
        permission_code: 'warehouse.manage',
      },
      {
        code: 'admin.warehouses.inventory',
        name: 'Tồn kho',
        path: '/admin/warehouses/inventory',
        api_path: 'api/admin/warehouses/inventory',
        icon: '📊',
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
        parent_code: 'admin.warehouses',
        sort_order: 20,
        is_public: false,
        show_in_menu: true,
        permission_code: 'warehouse.manage',
      },
      {
        code: 'admin.warehouses.transfers',
        name: 'Chuyển kho',
        path: '/admin/warehouses/transfers',
        api_path: 'api/admin/warehouses/transfers',
        icon: '🔄',
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
        parent_code: 'admin.warehouses',
        sort_order: 30,
        is_public: false,
        show_in_menu: true,
        permission_code: 'warehouse.manage',
      },
      {
        code: 'admin.contacts',
        name: 'Liên hệ',
        path: '/admin/contacts',
        api_path: 'api/admin/contacts',
        icon: '📞',
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
        parent_id: null,
        sort_order: 90,
        is_public: false,
        show_in_menu: true,
        permission_code: 'contact.manage',
      },
      {
        code: 'admin.system-configs',
        name: 'Cấu hình hệ thống',
        path: '/admin/system-configs',
        api_path: 'api/admin/system-configs',
        icon: '⚙️',
        type: MenuType.GROUP,
        status: BasicStatus.Active,
        parent_id: null,
        sort_order: 100,
        is_public: false,
        show_in_menu: true,
        permission_code: 'system_config.manage',
      },
      {
        code: 'admin.system-configs.general',
        name: 'Cài đặt chung',
        path: '/admin/system-configs/general',
        api_path: 'api/admin/system-config/general',
        icon: '⚙️',
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
        parent_code: 'admin.system-configs',
        sort_order: 10,
        is_public: false,
        show_in_menu: true,
        permission_code: 'system_config.manage',
      },
      {
        code: 'admin.system-configs.email',
        name: 'Cấu hình Email',
        path: '/admin/system-configs/email',
        api_path: 'api/admin/system-config/email',
        icon: '📧',
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
        parent_code: 'admin.system-configs',
        sort_order: 20,
        is_public: false,
        show_in_menu: true,
        permission_code: 'system_config.manage',
      },
      {
        code: 'admin.menus',
        name: 'Quản lý Menu',
        path: '/admin/menus',
        api_path: 'api/admin/menus',
        icon: '⚙️',
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
        parent_id: null,
        sort_order: 110,
        is_public: false,
        show_in_menu: true,
        permission_code: 'menu.manage',
      },
      {
        code: 'admin.banners',
        name: 'Quản lý Banner',
        path: '/admin/banners',
        api_path: 'api/admin/banners',
        icon: '🖼️',
        type: MenuType.GROUP,
        status: BasicStatus.Active,
        parent_id: null,
        sort_order: 35,
        is_public: false,
        show_in_menu: true,
        permission_code: 'banner.manage',
      },
      {
        code: 'admin.banner-locations',
        name: 'Vị trí Banner',
        path: '/admin/banner-locations',
        api_path: 'api/admin/banner-locations',
        icon: '📍',
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
        parent_code: 'admin.banners',
        sort_order: 10,
        is_public: false,
        show_in_menu: true,
        permission_code: 'banner.manage',
      },
      {
        code: 'admin.banners.list',
        name: 'Danh sách Banner',
        path: '/admin/banners',
        api_path: 'api/admin/banners',
        icon: '🖼️',
        type: MenuType.ROUTE,
        status: BasicStatus.Active,
        parent_code: 'admin.banners',
        sort_order: 20,
        is_public: false,
        show_in_menu: true,
        permission_code: 'banner.manage',
      },
    ];

    const createdMenus = new Map<string, Menu>();

    // Sort menus: parents first
    const sortedMenus = this.sortMenusByParent(menuData);

    for (const menuItem of sortedMenus) {
      let parent: Menu | null = null;
      if (menuItem.parent_code) {
        parent = createdMenus.get(menuItem.parent_code) || null;
        if (!parent) {
          this.logger.warn(`Parent menu not found for ${menuItem.code}, skipping parent relation`);
        }
      } else if (menuItem.parent_id !== null && menuItem.parent_id !== undefined) {
        // This shouldn't happen in seed data, but handle it anyway
        parent = createdMenus.get(String(menuItem.parent_id)) || null;
      }

      const permission = menuItem.permission_code ? permMap.get(menuItem.permission_code) : null;

      const menu = menuRepo.create({
        code: menuItem.code,
        name: menuItem.name,
        path: menuItem.path,
        api_path: menuItem.api_path,
        icon: menuItem.icon,
        type: menuItem.type,
        status: menuItem.status,
        parent: parent,
        sort_order: menuItem.sort_order,
        is_public: menuItem.is_public,
        show_in_menu: menuItem.show_in_menu,
        required_permission: permission,
        created_user_id: defaultUserId,
        updated_user_id: defaultUserId,
      });

      const saved = await menuRepo.save(menu);
      createdMenus.set(saved.code, saved);
      this.logger.log(`Created menu: ${saved.code}${parent ? ` (parent: ${parent.code})` : ''}`);
    }

    this.logger.log(`Menus seeding completed - Total: ${createdMenus.size}`);
  }

  private sortMenusByParent(menus: Array<any>): Array<any> {
    const result: Array<any> = [];
    const processed = new Set<string>();

    // First pass: add all menus without parents
    for (const menu of menus) {
      if (!menu.parent_code && (menu.parent_id === null || menu.parent_id === undefined)) {
        result.push(menu);
        processed.add(menu.code);
      }
    }

    // Second pass: add children
    let changed = true;
    while (changed) {
      changed = false;
      for (const menu of menus) {
        if (!processed.has(menu.code)) {
          if (!menu.parent_code || processed.has(menu.parent_code)) {
            result.push(menu);
            processed.add(menu.code);
            changed = true;
          }
        }
      }
    }

    return result;
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing menus...');
    const menuRepo = this.dataSource.getRepository(Menu);
    await menuRepo.clear();
    this.logger.log('Menus cleared');
  }
}

