import { Body, Controller, Get } from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { BaseController } from '@/modules/restful/base';

import { Crud, Depends } from '@/modules/restful/decorators';

import { createHookOption } from '@/modules/restful/helpers';

import { CreateMenuDto, QueryMenuTreeDto, UpdateMenuDto } from '../dtos';
import { RbacModule } from '../rbac.module';
import { MenuService } from '../services';

@Crud(async () => ({
    id: 'menu',
    enabled: [
        { name: 'create', option: createHookOption({ summary: '创建菜单' }) },
        { name: 'delete', option: createHookOption({ summary: '删除菜单' }) },
        { name: 'update', option: createHookOption({ summary: '更新菜单' }) },
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
