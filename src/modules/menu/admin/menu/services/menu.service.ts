import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaCrudService, PrismaCrudBag } from '@/common/base/services/prisma/prisma-crud.service';
import { RbacService } from '@/modules/rbac/services/rbac.service';
import { RequestContext } from '@/common/utils/request-context.util';
import { BasicStatus } from '@/shared/enums/types/basic-status.enum';
import { MenuTreeItem } from '@/modules/menu/admin/menu/interfaces/menu-tree-item.interface';

type MenuBag = PrismaCrudBag & {
  Model: any;
  Where: any;
  Select: any;
  Include: any;
  OrderBy: any;
  Create: any & { parent_id?: number | null; required_permission_id?: number | null };
  Update: any & { parent_id?: number | null; required_permission_id?: number | null };
};

@Injectable()
export class MenuService extends PrismaCrudService<MenuBag> {
  private readonly logger = new Logger(MenuService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(RbacService) private readonly rbacService: RbacService,
  ) {
    super(prisma.menu, ['id', 'code', 'sort_order', 'created_at'], 'sort_order:ASC');
  }

  protected override prepareOptions(queryOptions: any = {}) {
    const base = super.prepareOptions(queryOptions);
    return {
      ...base,
      include: {
        parent: true,
        children: true,
        required_permission: true,
        menu_permissions: {
          include: {
            permission: true,
          },
        },
      },
    };
  }

  protected async beforeCreate(createDto: MenuBag['Create']): Promise<MenuBag['Create']> {
    const payload: any = { ...createDto };

    // Check code uniqueness
    const code = payload.code;
    if (code) {
      const exists = await this.getOne({ code } as any);
      if (exists) {
        throw new BadRequestException('Menu code already exists');
      }
    }

    // Handle parent_id
    const parentId = payload.parent_id;
    if (parentId !== undefined && parentId !== null) {
      payload.parent_id = BigInt(parentId);
    } else if (parentId === null) {
      payload.parent_id = null;
    } else {
      delete payload.parent_id;
    }

    // Handle required_permission_id
    const permissionId = payload.required_permission_id;
    if (permissionId !== undefined && permissionId !== null) {
      payload.required_permission_id = BigInt(permissionId);
    } else if (permissionId === null) {
      payload.required_permission_id = null;
    } else {
      delete payload.required_permission_id;
    }

    // Convert other BigInt fields
    if (payload.created_user_id !== undefined && payload.created_user_id !== null) {
      payload.created_user_id = BigInt(payload.created_user_id);
    }
    if (payload.updated_user_id !== undefined && payload.updated_user_id !== null) {
      payload.updated_user_id = BigInt(payload.updated_user_id);
    }

    return payload;
  }

  protected async beforeUpdate(where: any, updateDto: MenuBag['Update']): Promise<MenuBag['Update']> {
    const payload: any = { ...updateDto };

    // Check code uniqueness if changed
    const code = payload.code;
    if (code) {
      const existing = await this.getOne(where);
      if (existing && code !== existing.code) {
        const exists = await this.prisma.menu.findFirst({
          where: { code, deleted_at: null },
        });
        if (exists) {
          throw new BadRequestException('Menu code already exists');
        }
      }
    }

    // Handle parent_id
    const parentId = payload.parent_id;
    if (parentId !== undefined) {
      if (parentId === null) {
        payload.parent_id = null;
      } else {
        payload.parent_id = BigInt(parentId);
      }
    } else {
      delete payload.parent_id;
    }

    // Handle required_permission_id
    const permissionId = payload.required_permission_id;
    if (permissionId !== undefined) {
      if (permissionId === null) {
        payload.required_permission_id = null;
      } else {
        payload.required_permission_id = BigInt(permissionId);
      }
    } else {
      delete payload.required_permission_id;
    }

    // Convert other BigInt fields
    if (payload.created_user_id !== undefined && payload.created_user_id !== null) {
      payload.created_user_id = BigInt(payload.created_user_id);
    }
    if (payload.updated_user_id !== undefined && payload.updated_user_id !== null) {
      payload.updated_user_id = BigInt(payload.updated_user_id);
    }

    return payload;
  }

  /**
   * Get menu tree for admin (no permission filtering)
   */
  async getTree(): Promise<MenuTreeItem[]> {
    const result = await this.getList(
      { deleted_at: null },
      {
        page: 1,
        limit: 10000, // Get all menus for tree
        sort: 'sort_order:ASC',
        include: {
          parent: true,
          children: true,
          required_permission: true,
        },
      }
    );

    return this.buildTree(result.data);
  }

  /**
   * Get menu tree filtered by user permissions in context
   */
  async getUserMenus(
    userId: number,
    options?: { include_inactive?: boolean; flatten?: boolean; contextId?: number }
  ): Promise<MenuTreeItem[]> {
    const includeInactive = options?.include_inactive || false;
    const flatten = options?.flatten || false;
    
    // Lấy groupId từ RequestContext (group-based)
    const groupId = RequestContext.get<number | null>('groupId');
    
    // Lấy context từ RequestContext hoặc từ group
    let context = RequestContext.get<any>('context');
    let contextType: string | null = null;
    
    if (groupId) {
      // Nếu có groupId, lấy context từ group
      const group = await this.prisma.group.findFirst({
        where: { id: BigInt(groupId) },
        include: { context: true },
      });
      
      if (group?.context) {
        context = group.context;
        contextType = group.context.type;
      } else if (group?.context_id) {
        const contextData = await this.prisma.context.findFirst({
          where: { id: group.context_id },
        });
        context = contextData;
        contextType = contextData?.type || null;
      }
    } else {
      // Nếu không có groupId, lấy từ RequestContext
      context = RequestContext.get<any>('context');
      contextType = context?.type || null;
    }
    
    // Fallback: nếu không có context type, dùng system
    if (!contextType) {
      contextType = 'system';
    }

    // Query menus with relations
    const where: any = {
      show_in_menu: true,
      deleted_at: null,
    };

    if (!includeInactive) {
      where.status = BasicStatus.active;
    }

    const menus = await this.prisma.menu.findMany({
      where,
      include: {
        parent: true,
        children: true,
        required_permission: true,
        menu_permissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: { sort_order: 'asc' },
    });
    
    // Log menu codes để debug
    const menuCodes = menus.map((m: any) => m.code).join(', ');
    this.logger.debug(`Query result: Found ${menus.length} menus with codes: [${menuCodes}]`);

    // Nếu không có menu nào, trả về empty
    if (!menus || menus.length === 0) {
      this.logger.warn(`No menus found for user ${userId} in groupId ${groupId}`);
      return [];
    }

    this.logger.debug(`Found ${menus.length} menus, checking permissions for user ${userId} in groupId ${groupId}`);
    
    // Lấy tất cả permissions của user trong group để check
    // Build set of all permissions user has
    const allPerms = new Set<string>();
    const testPerms = menus
      .filter((m: any) => m.required_permission?.code || m.menu_permissions?.length)
      .flatMap((m: any) => [
        ...(m.required_permission?.code ? [m.required_permission.code] : []),
        ...(m.menu_permissions?.map((mp: any) => mp.permission?.code).filter(Boolean) || []),
      ]);

    // Check từng permission một cách hiệu quả
    for (const perm of new Set(testPerms)) {
      // Dùng group-based permissions: user lấy menu dựa vào quyền trong group
      const hasPerm = await this.rbacService.userHasPermissionsInGroup(userId, groupId ?? null, [perm as string]);
      if (hasPerm) {
        allPerms.add(perm as string);
      }
    }

    // Filter menus by permissions (không có bypass)
    // Mỗi menu chỉ có 1 permission (required_permission), không cần check menu_permissions nữa
    let filteredMenus = menus.filter((menu: any) => {
      // Menu public luôn hiển thị
      if (menu.is_public) {
        this.logger.debug(`Menu ${menu.code}: PUBLIC - showing`);
        return true;
      }
      
      // Menu không có permission requirement → hiển thị
      const hasNoPermissionRequirement = 
        (!menu.required_permission_id && !menu.required_permission);
      
      if (hasNoPermissionRequirement) {
        this.logger.debug(`Menu ${menu.code}: NO PERMISSION REQUIREMENT - showing`);
        return true;
      }
      
      // Menu có required_permission → check user có permission trong group không
      if (menu.required_permission?.code) {
        const hasRequiredPerm = allPerms.has(menu.required_permission.code);
        this.logger.debug(`Menu ${menu.code}: required_permission=${menu.required_permission.code}, has=${hasRequiredPerm}, userPerms=[${Array.from(allPerms).join(', ')}]`);
        if (hasRequiredPerm) {
          return true;
        }
      }
      
      // Fallback: Nếu vẫn dùng menu_permissions (legacy)
      if (menu.menu_permissions && menu.menu_permissions.length > 0) {
        const menuPermCodes = menu.menu_permissions.map((mp: any) => mp.permission?.code).filter(Boolean);
        const hasAnyPerm = menuPermCodes.some((code: string) => allPerms.has(code));
        this.logger.debug(`Menu ${menu.code}: menu_permissions=[${menuPermCodes.join(', ')}], hasAny=${hasAnyPerm}`);
        if (hasAnyPerm) {
          return true;
        }
      }
      
      this.logger.debug(`Menu ${menu.code}: FILTERED OUT - no matching permissions. required_permission=${menu.required_permission?.code || 'none'}, userPerms=[${Array.from(allPerms).join(', ')}]`);
      return false;
    });

    // Filter các menu system-only (chỉ hiển thị trong system group)
    // Các menu này chỉ hiển thị khi context type là 'system'
    if (contextType !== 'system') {
      const systemOnlyPermissions = [
        'role.manage',
        'permission.manage',
        'group.manage',
        'system.manage',
        'config.manage',
      ];
      
      const systemOnlyMenuCodes = [
        'roles',
        'permissions',
        'groups',
        'contexts',
        'config-general',
        'config-email',
        'rbac-management',
        'config-management',
      ];
      
      filteredMenus = filteredMenus.filter(menu => {
        // Check theo permission code
        if (menu.required_permission?.code && systemOnlyPermissions.includes(menu.required_permission.code as string)) {
          this.logger.debug(`Menu ${menu.code}: SYSTEM-ONLY (permission=${menu.required_permission.code}) - filtered out for contextType=${contextType}`);
          return false;
        }
        
        // Check theo menu code
        if (systemOnlyMenuCodes.includes(menu.code as string)) {
          this.logger.debug(`Menu ${menu.code}: SYSTEM-ONLY (menu code) - filtered out for contextType=${contextType}`);
          return false;
        }
        
        return true;
      });
    }

    this.logger.debug(`Filtered ${filteredMenus.length} menus from ${menus.length} total menus for user ${userId} in groupId ${groupId}, contextType=${contextType}`);
    const filteredMenuCodes = filteredMenus.map((m: any) => m.code).join(', ');
    this.logger.debug(`Filtered menu codes: [${filteredMenuCodes}]`);

    const tree = this.buildTree(filteredMenus);
    this.logger.debug(`Built tree with ${tree.length} root items`);
    return flatten ? this.flattenTree(tree) : tree;
  }

  /**
   * Build tree structure from flat menu list
   */
  private buildTree(menus: any[]): MenuTreeItem[] {
    const menuMap = new Map<number, MenuTreeItem>();
    const rootMenus: MenuTreeItem[] = [];

    menus.forEach((menu: any) => {
      const menuId = Number(menu.id);
      menuMap.set(menuId, {
        id: menuId,
        code: menu.code as string,
        name: menu.name as string,
        path: menu.path as string | null,
        icon: menu.icon as string | null,
        type: menu.type as string,
        status: menu.status as string,
        children: [],
        allowed: true,
      });
    });

    menus.forEach((menu: any) => {
      const menuId = Number(menu.id);
      const item = menuMap.get(menuId)!;
      const parentId = menu.parent_id ? Number(menu.parent_id) : null;
      if (parentId && menuMap.has(parentId)) {
        menuMap.get(parentId)!.children!.push(item);
      } else {
        rootMenus.push(item);
      }
    });

    const sortTree = (items: MenuTreeItem[]) => {
      items.sort((a, b) => {
        const menuA = menus.find((m: any) => Number(m.id) === a.id);
        const menuB = menus.find((m: any) => Number(m.id) === b.id);
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

  /**
   * Override getOne to handle BigInt conversion
   */
  protected override async afterGetOne(entity: any, _where?: any, _options?: any): Promise<any> {
    if (!entity) return null;
    return this.convertBigIntFields(entity);
  }

  /**
   * Override getList to handle BigInt conversion
   */
  protected override async afterGetList(data: any[], _filters?: any, _options?: any): Promise<any[]> {
    return data.map(item => this.convertBigIntFields(item));
  }

  /**
   * Convert BigInt fields to number for JSON serialization
   */
  private convertBigIntFields(entity: any): any {
    if (!entity) return entity;
    const converted = { ...entity };
    if (converted.id) converted.id = Number(converted.id);
    if (converted.parent_id) converted.parent_id = Number(converted.parent_id);
    if (converted.required_permission_id) converted.required_permission_id = Number(converted.required_permission_id);
    if (converted.created_user_id) converted.created_user_id = Number(converted.created_user_id);
    if (converted.updated_user_id) converted.updated_user_id = Number(converted.updated_user_id);
    if (converted.children) {
      converted.children = converted.children.map((child: any) => this.convertBigIntFields(child));
    }
    if (converted.parent) {
      converted.parent = this.convertBigIntFields(converted.parent);
    }
    if (converted.menu_permissions) {
      converted.menu_permissions = converted.menu_permissions.map((mp: any) => ({
        ...mp,
        id: mp.id ? Number(mp.id) : mp.id,
        menu_id: mp.menu_id ? Number(mp.menu_id) : mp.menu_id,
        permission_id: mp.permission_id ? Number(mp.permission_id) : mp.permission_id,
      }));
    }
    return converted;
  }

  /**
   * Simple list giống getList nhưng limit mặc định lớn hơn
   */
  async getSimpleList(filters?: any, options?: any) {
    const simpleOptions = {
      ...options,
      limit: options?.limit ?? 50,
      maxLimit: options?.maxLimit ?? 1000,
    };
    return this.getList(filters, simpleOptions);
  }

  /**
   * Wrapper create/update/delete để nhận id dạng number (giữ API cũ)
   */
  async createWithUser(data: MenuBag['Create'], userId?: number) {
    if (userId) {
      (data as any).created_user_id = userId;
    }
    return super.create(data);
  }

  async updateById(id: number, data: MenuBag['Update'], userId?: number) {
    if (userId) {
      (data as any).updated_user_id = userId;
    }
    return super.update({ id: BigInt(id) } as any, data);
  }

  async deleteById(id: number) {
    return super.delete({ id: BigInt(id) } as any);
  }
}
