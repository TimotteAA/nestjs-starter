import { Controller, Get, Query, SerializeOptions } from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { BaseControllerWithTrash } from '@/modules/restful/base';

import { Crud, Depends } from '@/modules/restful/decorators';

import { createHookOption } from '@/modules/restful/helpers';

import { ContentModule } from '../../content.module';

import {
    ManageCreateCategoryDto,
    ManageUpdateCategoryDto,
    ManageQueryCategoryDto,
    ManageQueryCategoryTreeDto,
} from '../../dtos/manage';
import { CategoryService } from '../../services';

@ApiTags('分类管理')
@ApiBearerAuth()
@Depends(ContentModule)
@Crud(async () => ({
    id: 'category',
    enabled: [
        {
            name: 'list',
            option: createHookOption({ summary: '分类查询,以分页模式展示', guest: true }),
        },
        {
            name: 'detail',
            option: createHookOption({ summary: '分类详情', guest: true }),
        },
        {
            name: 'create',
            option: createHookOption('创建分类'),
        },
        {
            name: 'update',
            option: createHookOption('更新分类'),
        },
        {
            name: 'delete',
            option: createHookOption('删除分类'),
        },
        {
            name: 'restore',
            option: createHookOption('恢复分类'),
        },
    ],
    dtos: {
        create: ManageCreateCategoryDto,
        update: ManageUpdateCategoryDto,
        list: ManageQueryCategoryDto,
    },
}))
@Controller('categories')
export class CategoryController extends BaseControllerWithTrash<CategoryService> {
    constructor(protected service: CategoryService) {
        super(service);
    }

    @Get('tree')
    @ApiOperation({ summary: '树形结构分类查询' })
    @SerializeOptions({ groups: ['category-tree'] })
    async tree(@Query() options: ManageQueryCategoryTreeDto) {
        return this.service.findTrees(options);
    }
}
