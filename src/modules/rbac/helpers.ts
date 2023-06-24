import { MongoAbility } from '@casl/ability';
import { FastifyRequest as Request } from 'fastify';
import { isNil } from 'lodash';
import { ObjectLiteral } from 'typeorm';

import { PermissionAction } from './constants';
import { PermissionEntity, RoleEntity } from './entities';

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

export const addRolePermissions = () => [
    {
        name: 'role.manage',
        rule: {
            action: PermissionAction.MANAGE,
            subject: RoleEntity,
        },
        customOrder: 3,
    },
    {
        name: 'permission.manage',
        rule: {
            action: PermissionAction.MANAGE,
            subject: PermissionEntity,
        },
        customOrder: 4,
    },
];
