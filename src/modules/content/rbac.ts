import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { PermissionAction, SystemRoles } from '../rbac/constants';
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
            },
            // 后台权限：三个Entity的管理
            {
                name: 'content.manage',
                rule: {
                    action: PermissionAction.MANAGE,
                    subject: [CommentEntity, PostEntity, CategoryEntity],
                },
            },
            {
                name: 'content.post.manage',
                rule: {
                    action: PermissionAction.MANAGE,
                    subject: PostEntity,
                },
                parentName: 'content.manage',
            },
            {
                name: 'content.category.manage',
                rule: {
                    action: PermissionAction.MANAGE,
                    subject: CategoryEntity,
                },
                parentName: 'content.manage',
            },
            {
                name: 'content.comment.manage',
                rule: {
                    action: PermissionAction.MANAGE,
                    subject: CommentEntity,
                },
                parentName: 'content.manage',
            },
        ]);

        resolver.addRoles([
            // 普通用户角色
            {
                name: SystemRoles.USER,
                permissions: ['comment.create', 'comment.owner'],
            },
        ]);

        resolver.addMenus([
            {
                name: 'content.manage',
                label: '内容模块管理',
                systemed: true,
                router: '/content',
                customOrder: 0,
                permissions: ['content.manage'],
            },
            {
                name: 'content.post.manage',
                label: '文章管理',
                systemed: true,
                router: '/post',
                customOrder: 1,
                permissions: ['content.post.manage'],
                parent: 'content.manage',
            },
            {
                name: 'content.comment.manage',
                label: '评论管理',
                systemed: true,
                router: '/comment',
                customOrder: 1,
                permissions: ['content.comment.manage'],
                parent: 'content.manage',
            },
            {
                name: 'content.category.manage',
                label: '分类管理',
                systemed: true,
                router: '/category',
                customOrder: 1,
                permissions: ['content.category.manage'],
                parent: 'content.manage',
            },
        ]);
    }
}
