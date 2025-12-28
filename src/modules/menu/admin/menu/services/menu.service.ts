import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Menu } from '@/shared/entities/menu.entity';
import { Permission } from '@/shared/entities/permission.entity';
import { CrudService } from '@/common/base/services/crud.service';
import { ResponseRef } from '@/common/base/utils/response-ref.helper';
import { RbacCacheService } from '@/modules/rbac/services/rbac-cache.service';
import { BasicStatus } from '@/shared/enums/basic-status.enum';
import { MenuTreeItem } from '@/modules/menu/admin/menu/interfaces/menu-tree-item.interface';

@Injectable()
export class MenuService extends CrudService<Menu> {
  private get permRepo(): Repository<Permission> {
    return this.repository.manager.getRepository(Permission);
  }

  constructor(
    @InjectRepository(Menu) protected readonly repository: Repository<Menu>,
    @Inject(RbacCacheService) private readonly rbacCache: RbacCacheService,
  ) {
    super(repository);
  }

  protected override prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    return {
      ...base,
      relations: ['parent', 'children', 'required_permission', 'menu_permissions'],
    } as any;
  }

  protected async beforeCreate(
    entity: Menu,
    createDto: DeepPartial<Menu>,
    response?: ResponseRef<Menu | null>
  ): Promise<boolean> {
    const code = (createDto as any).code;
    if (code) {
      const exists = await this.getOne({ code } as any);
      if (exists) {
        if (response) {
          response.message = 'Menu code already exists';
          response.code = 'MENU_CODE_EXISTS';
        }
        return false;
      }
    }

    const parentId = (createDto as any).parent_id;
    if (parentId) {
      const parent = await this.getOne({ id: parentId } as any);
      if (parent) {
        (createDto as any).parent = parent;
      }
      delete (createDto as any).parent_id;
    }

    const permissionId = (createDto as any).required_permission_id;
    if (permissionId) {
      const permission = await this.permRepo.findOne({ where: { id: permissionId } });
      if (permission) {
        (createDto as any).required_permission = permission;
      }
      delete (createDto as any).required_permission_id;
    }

    return true;
  }

  protected async beforeUpdate(
    entity: Menu,
    updateDto: DeepPartial<Menu>,
    response?: ResponseRef<Menu | null>
  ): Promise<boolean> {
    const code = (updateDto as any).code;
    if (code && code !== entity.code) {
      const exists = await this.getOne({ code } as any);
      if (exists) {
        if (response) {
          response.message = 'Menu code already exists';
          response.code = 'MENU_CODE_EXISTS';
        }
        return false;
      }
    }

    const parentId = (updateDto as any).parent_id;
    if (parentId !== undefined) {
      if (parentId === null) {
        (updateDto as any).parent = null;
      } else {
        const parent = await this.getOne({ id: parentId } as any);
        if (parent) {
          (updateDto as any).parent = parent;
        }
      }
      delete (updateDto as any).parent_id;
    }

    const permissionId = (updateDto as any).required_permission_id;
    if (permissionId !== undefined) {
      if (permissionId === null) {
        (updateDto as any).required_permission = null;
      } else {
        const permission = await this.permRepo.findOne({ where: { id: permissionId } });
        if (permission) {
          (updateDto as any).required_permission = permission;
        }
      }
      delete (updateDto as any).required_permission_id;
    }

    return true;
  }

  /**
   * Get menu tree for admin (no permission filtering)
   */
  async getTree(): Promise<MenuTreeItem[]> {
    const result = await this.getList(
      {},
      {
        page: 1,
        limit: 10000, // Get all menus for tree
        sort: 'sort_order:ASC',
        relations: ['parent', 'children', 'required_permission'],
      }
    );

    return this.buildTree(result.data);
  }

  /**
   * Get menu tree filtered by user permissions
   */
  async getUserMenus(
    userId: number,
    options?: { include_inactive?: boolean; flatten?: boolean; user_email?: string }
  ): Promise<MenuTreeItem[]> {
    const includeInactive = options?.include_inactive || false;
    const flatten = options?.flatten || false;
    const isBypassUser = (options?.user_email || '').toLowerCase() === 'admin@example.com';

    // Get user permissions from cache
    let userPermissions: Set<string> | null = null;
    if (!isBypassUser && this.rbacCache && typeof this.rbacCache.getUserPermissions === 'function') {
      userPermissions = await this.rbacCache.getUserPermissions(userId);
    }
    if (!userPermissions) {
      userPermissions = new Set<string>();
    }

    // Query menus using QueryBuilder to properly load nested relations
    const queryBuilder = this.repository.createQueryBuilder('menu')
      .leftJoinAndSelect('menu.parent', 'parent')
      .leftJoinAndSelect('menu.children', 'children')
      .leftJoinAndSelect('menu.required_permission', 'required_permission')
      .leftJoinAndSelect('menu.menu_permissions', 'menu_permissions')
      .leftJoinAndSelect('menu_permissions.permission', 'permission')
      .where('menu.show_in_menu = :showInMenu', { showInMenu: true });

    if (!includeInactive) {
      queryBuilder.andWhere('menu.status = :status', { status: BasicStatus.Active });
    }

    queryBuilder.orderBy('menu.sort_order', 'ASC');

    const menus = await queryBuilder.getMany();

    // Bypass permission filtering for special admin email
    if (isBypassUser) {
      const tree = this.buildTree(menus);
      return flatten ? this.flattenTree(tree) : tree;
    }

    // Filter menus by permissions
    const filteredMenus = menus.filter(menu => {
      if (menu.is_public) return true;
      if (menu.required_permission?.code && userPermissions.has(menu.required_permission.code)) return true;
      if (menu.menu_permissions?.some(mp => mp.permission?.code && userPermissions.has(mp.permission.code))) return true;
      if (!menu.required_permission_id && (!menu.menu_permissions || menu.menu_permissions.length === 0)) return true;
      return false;
    });

    const tree = this.buildTree(filteredMenus);
    return flatten ? this.flattenTree(tree) : tree;
  }

  /**
   * Build tree structure from flat menu list
   */
  private buildTree(menus: Menu[]): MenuTreeItem[] {
    const menuMap = new Map<number, MenuTreeItem>();
    const rootMenus: MenuTreeItem[] = [];

    menus.forEach(menu => {
      menuMap.set(menu.id, {
        id: menu.id,
        code: menu.code,
        name: menu.name,
        path: menu.path,
        icon: menu.icon,
        type: menu.type,
        status: menu.status,
        children: [],
        allowed: true,
      });
    });

    menus.forEach(menu => {
      const item = menuMap.get(menu.id)!;
      if (menu.parent_id && menuMap.has(menu.parent_id)) {
        menuMap.get(menu.parent_id)!.children!.push(item);
      } else {
        rootMenus.push(item);
      }
    });

    const sortTree = (items: MenuTreeItem[]) => {
      items.sort((a, b) => {
        const menuA = menus.find(m => m.id === a.id);
        const menuB = menus.find(m => m.id === b.id);
        return (menuA?.sort_order || 0) - (menuB?.sort_order || 0);
      });
      items.forEach(item => item.children && sortTree(item.children));
    };

    sortTree(rootMenus);
    return rootMenus;
  }

  /**
   * Flatten tree to array
   */
  private flattenTree(tree: MenuTreeItem[]): MenuTreeItem[] {
    const result: MenuTreeItem[] = [];
    const traverse = (items: MenuTreeItem[]) => {
      items.forEach(item => {
        result.push({ ...item, children: undefined });
        if (item.children?.length) traverse(item.children);
      });
    };
    traverse(tree);
    return result;
  }
}

