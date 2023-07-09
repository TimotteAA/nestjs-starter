import { Controller, Get, SerializeOptions } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { BaseController } from '@/modules/restful/base';
import { Crud, Depends } from '@/modules/restful/decorators';

import { createHookOption } from '@/modules/restful/helpers';

import { Guest } from '@/modules/user/decorators';

import { PermissionAction } from '../constants';
import { QueryPermissionDto } from '../dtos';
import { PermissionEntity } from '../entities';
import { RbacModule } from '../rbac.module';
import { PermissionService } from '../services';
import { PermissionChecker } from '../types';

/**
 * 权限：权限管理员
 */
const permissions: PermissionChecker[] = [
    async (ab) => ab.can(PermissionAction.MANAGE, PermissionEntity.name),
];

@ApiTags('权限管理')
@ApiBearerAuth()
@Depends(RbacModule)
@Crud(async () => ({
    id: 'permission',
    enabled: [
        { name: 'list', option: createHookOption({ summary: '分页查询权限', permissions }) },
        { name: 'detail', option: createHookOption({ summary: '查看权限详情', permissions }) },
    ],
    dtos: {
        list: QueryPermissionDto,
    },
}))
@Controller('permissions')
export class PermissionController extends BaseController<PermissionService> {
    // 前端权限
    private appPermissionNames: Set<string> = new Set<string>()
        .add('comment.owner')
        .add('comment.create');

    constructor(protected permissionService: PermissionService) {
        super(permissionService);
    }

    // @Get()
    // async list(@Query() data: QueryPermissionDto) {
    //   return this.permissionService.pa(data);
    // }

    // @Get(":id")
    // async detail(@Query("id") id: string) {
    //   return this.permissionService.detail(id);
    // }

    @SerializeOptions({ groups: ['permission-tree'] })
    @ApiOperation({ summary: '返回权限树' })
    @Guest()
    @Get('tree')
    async tree() {
        const list = await this.permissionService.list({});
        return this.listToTree(list);
    }

    protected listToTree(list: ClassToPlain<PermissionEntity>[]) {
        // 创建一个以id为键的项目映射
        const itemsMap: Record<string, ClassToPlain<PermissionEntity>> = {};
        list.forEach((item) => {
            item.children = [];
            itemsMap[item.id] = item;
        });

        // 创建一个空数组，用于存储根节点
        const roots: ClassToPlain<PermissionEntity>[] = [];
        // 过滤掉前端权限
        const managePermissions = list.filter((p) => !this.appPermissionNames.has(p.name));
        // 对于每个项目
        for (const item of managePermissions) {
            // 如果该项目有父项目
            if (item.parentName) {
                // 查找该项目的父项目
                const parentItem = list.find((parent) => parent.name === item.parentName);
                console.log('parentItem', parentItem);
                if (parentItem) {
                    // 将该项目添加到父项目的children数组中
                    parentItem.children = parentItem.children || [];
                    parentItem.children.push(itemsMap[item.id]);
                }
            } else {
                // 如果该项目没有父项目，将它添加到根节点
                roots.push(itemsMap[item.id]);
            }
            // console.log('item', item);
        }
        return roots;
    }
}
