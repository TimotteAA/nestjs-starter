import { MongoAbility } from '@casl/ability';
import { ApiOperation } from '@nestjs/swagger';
import { FastifyRequest as Request } from 'fastify';
import { isNil } from 'lodash';
import { ObjectLiteral } from 'typeorm';

import { CrudMethodOption } from '@/modules/restful/types';

import { PermissionAction } from './constants';
import { ManualPermission } from './decorators';
import { PermissionEntity, RoleEntity } from './entities';
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

/**
 * 给crud装饰器添加权限
 * @param permissions
 */
export const simpleCrudOptions = (
    permissions?: PermissionChecker[],
    apiSummary?: string,
): CrudMethodOption => ({
    hook: (target, method) => {
        if (permissions) ManualPermission(target, method, permissions);
        if (apiSummary) {
            // const descriptor = Object.getOwnPropertyDescriptor(target.prototype, method);
            // Object.defineProperty(target.prototype, method, {
            //   ...descriptor,
            //   async value(...args: any) {
            //     return descriptor.value.apply(this, args);
            //   }
            // })
            console.log(
                'apiSummary',
                apiSummary,
                target.name,
                method,
                Object.getOwnPropertyDescriptor(target.prototype, method),
            );
            ApiOperation({ summary: apiSummary })(
                target,
                method,
                Object.getOwnPropertyDescriptor(target.prototype, method),
            );
        }
    },
});

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

    //   {
    //       name: "system.role.create",
    //       rule: {
    //           action: PermissionAction.CREATE,
    //           subject: RoleEntity
    //       },
    //       customOrder: 2
    //   },
    //   {
    //       name: "system.role.update",
    //       rule: {
    //           action: PermissionAction.UPDATE,
    //           subject: RoleEntity,
    //       },
    //       customOrder: 2
    //   },
    //   {
    //       name: "system.role.delete",
    //       rule: {
    //           action: PermissionAction.DELETE,
    //           subject: RoleEntity,
    //       },
    //       customOrder: 2
    //   },
    //   {
    //       name: "system.role.restore",
    //       rule: {
    //           action: PermissionAction.RESTORE,
    //           subject: RoleEntity,
    //       },
    //       customOrder: 2
    //   },
    //   {
    //       name: "system.role.read_detail",
    //       rule: {
    //           action: PermissionAction.READ_DETAIL,
    //           subject: RoleEntity,
    //       },
    //       customOrder: 2
    //   },
    //   {
    //       name: "system.role.read_list",
    //       rule: {
    //           action: PermissionAction.READ_LIST,
    //           subject: RoleEntity,
    //       },
    //       customOrder: 2
    //   },
    //   {
    //       name: "system.permission.read_list",
    //       rule: {
    //           action: PermissionAction.READ_LIST,
    //           subject: PermissionEntity,
    //       },
    //       customOrder: 1
    //     },
    //   {
    //       name: "system.permission.read_detail",
    //       rule: {
    //           action: PermissionAction.READ_DETAIL,
    //           subject: PermissionEntity,
    //       },
    //       customOrder: 1
    //   }
];
