import { MongoAbility } from '@casl/ability';
import { FastifyRequest as Request } from 'fastify';
import { isNil } from 'lodash';
import { ObjectLiteral } from 'typeorm';

import { PermissionAction } from './constants';
import { PermissionChecker } from './types';

/**
 * 从request中的params或body中得到id或ids字段
 * @param request
 */
export const getRequestItems = (request?: Request): string[] => {
    const { params = {}, body = {} } = (request ?? {}) as any;
    const id = params.id ?? body.id ?? params.item ?? body.item ?? body.receives;
    const { ids } = body;
    if (!isNil(id)) return [id];
    return !isNil(ids) && Array.isArray(ids) ? ids : [];
};

/**
 * 验证是否是数据所有者
 * @param ability
 * @param getModels 获取entity的方法
 * @param request
 * @param permission 权限的action
 */
export const checkOwner = async <E extends ObjectLiteral>(
    ability: MongoAbility,
    getModels: (ids: string[]) => Promise<E[]>,
    request?: Request,
    permission?: string,
) => {
    const models = await getModels(getRequestItems(request));
    // console.log("models", models);
    // console.log("permission", permission);
    if (!models || !models.length) return false;
    // console.log(models.every((model) => ability.can(permission ?? PermissionAction.OWNER, model)))
    return models.every((model) => ability.can(permission ?? PermissionAction.OWNER, model));
};

export const createCrudPermission = <Entity extends ObjectLiteral>(E: Entity) => {
    // @ts-ignore
    const permissions: Record<PermissionAction, PermissionChecker> = {
        create: async (ab) => ab.can(PermissionAction.CREATE, E.name),
        read_detail: async (ab) => ab.can(PermissionAction.READ_DETAIL, E.name),
        read_list: async (ab) => ab.can(PermissionAction.READ_LIST, E.name),
        read_tree: async (ab) => ab.can(PermissionAction.READ_TREE, E.name),
        delete: async (ab) => ab.can(PermissionAction.DELETE, E.name),
        update: async (ab) => ab.can(PermissionAction.UPDATE, E.name),
        restore: async (ab) => ab.can(PermissionAction.RESTORE, E.name),
    };

    return permissions;
};
