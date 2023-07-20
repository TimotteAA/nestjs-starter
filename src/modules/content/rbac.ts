import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { MenuType, PermissionAction, SystemRoles } from '../rbac/constants';
import { RbacResolver } from '../rbac/rbac.resolver';

import { CategoryEntity, CommentEntity, PostEntity } from './entities';

/**
 * 模块启动时，添加权限与角色
 */
@Injectable()
export class ContentRbac implements OnModuleInit {
    constructor(protected moduleRef: ModuleRef) {}

    onModuleInit() {
        const resolver = this.moduleRef.get(RbacResolver, { strict: false });
        // 添加权限
        resolver.addPermissions([
            {
                name: 'comment.create',
                rule: {
                    action: PermissionAction.CREATE,
                    subject: CommentEntity,
                },
                customOrder: 55,
                type: MenuType.PERMISSION,
                parentName: 'global.permission',
            },
            {
                name: 'comment.owner',
                rule: {
                    action: PermissionAction.OWNER,
                    subject: CommentEntity,
                    conditions: (user) => ({
                        'author.id': user.id,
                    }),
                },
                customOrder: 55,
                type: MenuType.PERMISSION,
                parentName: 'global.permission',
            },
            // 后台权限：三个Entity的管理
            {
                name: 'content.manage',
                type: MenuType.DIRECTORY,
            },
            {
                name: 'content.post.manage',
                parentName: 'content.manage',
                type: MenuType.MENU,
            },
            {
                name: 'content.category.manage',
                type: MenuType.MENU,
            },
            {
                name: 'content.comment.manage',
                type: MenuType.MENU,
            },
            // post crud
            {
                name: 'content.post.create',
                parentName: 'content.post.manage',
                type: MenuType.PERMISSION,
                rule: {
                    action: PermissionAction.CREATE,
                    subject: PostEntity,
                },
            },
            {
                name: 'content.post.delete',
                parentName: 'content.post.manage',
                type: MenuType.PERMISSION,
                rule: {
                    action: PermissionAction.DELETE,
                    subject: PostEntity,
                },
            },
            {
                name: 'content.post.update',
                parentName: 'content.post.manage',
                type: MenuType.PERMISSION,
                rule: {
                    action: PermissionAction.UPDATE,
                    subject: PostEntity,
                },
            },
            {
                name: 'content.post.restore',
                parentName: 'content.post.manage',
                type: MenuType.PERMISSION,
                rule: {
                    action: PermissionAction.RESTORE,
                    subject: PostEntity,
                },
            },
            {
                name: 'content.post.read_list',
                parentName: 'content.post.manage',
                type: MenuType.PERMISSION,
                rule: {
                    action: PermissionAction.READ_LIST,
                    subject: PostEntity,
                },
            },
            {
                name: 'content.post.read_detail',
                parentName: 'content.post.manage',
                type: MenuType.PERMISSION,
                rule: {
                    action: PermissionAction.READ_DETAIL,
                    subject: PostEntity,
                },
            },
            // category crud
            {
                name: 'content.category.create',
                parentName: 'content.category.manage',
                type: MenuType.PERMISSION,
                rule: {
                    action: PermissionAction.CREATE,
                    subject: CategoryEntity,
                },
            },
            {
                name: 'content.category.delete',
                parentName: 'content.category.manage',
                type: MenuType.PERMISSION,
                rule: {
                    action: PermissionAction.DELETE,
                    subject: CategoryEntity,
                },
            },
            {
                name: 'content.category.update',
                parentName: 'content.category.manage',
                type: MenuType.PERMISSION,
                rule: {
                    action: PermissionAction.UPDATE,
                    subject: CategoryEntity,
                },
            },
            {
                name: 'content.category.restore',
                parentName: 'content.category.manage',
                type: MenuType.PERMISSION,
                rule: {
                    action: PermissionAction.RESTORE,
                    subject: CategoryEntity,
                },
            },
            {
                name: 'content.category.read_list',
                parentName: 'content.category.manage',
                type: MenuType.PERMISSION,
                rule: {
                    action: PermissionAction.READ_LIST,
                    subject: CategoryEntity,
                },
            },
            {
                name: 'content.category.read_detail',
                parentName: 'content.category.manage',
                type: MenuType.PERMISSION,
                rule: {
                    action: PermissionAction.READ_DETAIL,
                    subject: CategoryEntity,
                },
            },
            // comment crud
            {
                name: 'content.comment.delete',
                parentName: 'content.comment.manage',
                type: MenuType.PERMISSION,
                rule: {
                    action: PermissionAction.DELETE,
                    subject: CategoryEntity,
                },
            },
            {
                name: 'content.comment.read_list',
                parentName: 'content.comment.manage',
                type: MenuType.PERMISSION,
                rule: {
                    action: PermissionAction.READ_LIST,
                    subject: CategoryEntity,
                },
            },
            {
                name: 'content.comment.read_detail',
                parentName: 'content.comment.manage',
                type: MenuType.PERMISSION,
                rule: {
                    action: PermissionAction.READ_DETAIL,
                    subject: CategoryEntity,
                },
            },
            {
                name: 'content.comment.read_tree',
                parentName: 'content.comment.manage',
                type: MenuType.PERMISSION,
                rule: {
                    action: PermissionAction.READ_TREE,
                    subject: CategoryEntity,
                },
            },
        ]);

        resolver.addRoles([
            // 普通用户角色
            {
                name: SystemRoles.USER,
                permissions: ['comment.create', 'comment.owner'],
            },
        ]);
    }
}
