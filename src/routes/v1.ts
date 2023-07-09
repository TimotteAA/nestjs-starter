import * as contentControllers from '@/modules/content/controllers';
import * as contentManageControllers from '@/modules/content/controllers/manage';

import { Configure } from '@/modules/core/configure';
import * as rbacManageControllers from '@/modules/rbac/controllers';
import { ApiVersionOption } from '@/modules/restful/types';
import * as userControllers from '@/modules/user/controllers';
import * as userMangeControllers from '@/modules/user/controllers/manage';

export const v1 = async (configure: Configure): Promise<ApiVersionOption> => ({
    routes: [
        {
            name: 'app',
            path: '/',
            controllers: [],
            doc: {
                title: '应用接口',
                description: '前端服务接口',
                tags: [
                    { name: '前端分类接口', description: '前端分类的查询、树形查询、详情' },
                    { name: '前端文章接口', description: '前端文章分页、详情' },
                    {
                        name: '前端评论接口',
                        description: '前端评论的发表、删除、分页查询、树形查询',
                    },
                    { name: '账户操作', description: 'Auth操作' },
                    { name: '用户管理', description: '用户的增删查改操作' },
                    { name: '验证码操作', description: '用户相关验证码操作' },
                ],
            },
            children: [
                {
                    name: 'content',
                    path: 'content',
                    controllers: Object.values(contentControllers),
                },
                {
                    name: 'user',
                    path: 'user',
                    controllers: Object.values(userControllers),
                },
            ],
        },
        {
            name: 'manage',
            path: 'manage',
            controllers: [],
            doc: {
                title: '管理接口',
                description: '后台管理面板接口',
                tags: [
                    {
                        name: '权限管理',
                        description: '权限为系统硬编码后自动同步到数据库,只能查看',
                    },
                    {
                        name: '角色管理',
                        description:
                            '默认包含super-admin等系统角色角色,但是可以增删查改(系统角色不可操',
                    },
                    {
                        name: '文章管理',
                        description: '内容模块-文章管理',
                    },
                    {
                        name: '评论管理',
                        description: '内容模块-评论管理',
                    },
                    {
                        name: '分类管理',
                        description: '内容模块-分类管理',
                    },
                    {
                        name: '用户管理',
                        description: '用户管理',
                    },
                ],
            },
            children: [
                {
                    name: 'rbac',
                    path: 'rbac',
                    controllers: Object.values(rbacManageControllers),
                },
                {
                    name: 'content',
                    path: 'content',
                    controllers: Object.values(contentManageControllers),
                },
                {
                    name: 'user',
                    path: '/',
                    controllers: Object.values(userMangeControllers),
                },
            ],
        },
    ],
});
