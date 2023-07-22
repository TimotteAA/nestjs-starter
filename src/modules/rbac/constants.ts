import { PermissionEntity } from './entities';

/**
 * 默认的系统用户：普通用户、超级管理员
 */
export enum SystemRoles {
    USER = 'custom-user',
    ADMIN = 'super-admin',
}

/**
 * rule的action
 */
export enum PermissionAction {
    CREATE = 'create',
    READ_DETAIL = 'read_detail',
    READ_LIST = 'read_list',
    READ_TREE = 'read_tree',
    UPDATE = 'update',
    DELETE = 'delete',
    OWNER = 'owner',
    MANAGE = 'manage',
    RESTORE = 'restore',
}

/**
 * 菜单类型
 */
export enum MenuType {
    /**
     * 目录，顶级菜单项
     */
    DIRECTORY = 0,
    /**
     * 菜单项
     */
    MENU = 1,
    /**
     * CRUD权限
     */
    PERMISSION = 2,
}

export const PERMISSION_CHECKERS = 'permission_checkers';

export const DirectoryOrMenuRule: (path: string) => ClassToPlain<PermissionEntity>['rule'] = (
    path: string,
) => ({
    action: 'VIEW',
    subject: path,
});
