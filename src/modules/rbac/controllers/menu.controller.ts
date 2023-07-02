import { Body, Controller, Get } from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { BaseController } from '@/modules/restful/base';

import { Crud, Depends } from '@/modules/restful/decorators';

import { createHookOption } from '@/modules/restful/helpers';

import { PermissionAction } from '../constants';
import { CreateMenuDto, QueryMenuTreeDto, UpdateMenuDto } from '../dtos';
import { MenuEntity } from '../entities';
import { RbacModule } from '../rbac.module';
import { MenuService } from '../services';
import { PermissionChecker } from '../types';

/**
 * 权限：权限管理员
 */
const permissions: PermissionChecker[] = [
    async (ab) => ab.can(PermissionAction.MANAGE, MenuEntity.name),
];

@Crud(async () => ({
    id: 'menu',
    enabled: [
        { name: 'create', option: createHookOption({ summary: '创建菜单', permissions }) },
        { name: 'delete', option: createHookOption({ summary: '删除菜单', permissions }) },
        { name: 'update', option: createHookOption({ summary: '更新菜单', permissions }) },
    ],
    dtos: {
        create: CreateMenuDto,
        update: UpdateMenuDto,
    },
}))
@ApiTags('菜单管理')
@Depends(RbacModule)
@Controller('menus')
export class MenuController extends BaseController<MenuService> {
    constructor(protected readonly service: MenuService) {
        super(service);
    }

    @ApiOperation({ summary: '树形菜单查询' })
    @Get('tree')
    tree(@Body() data: QueryMenuTreeDto) {
        return this.service.tree(data);
    }
}
