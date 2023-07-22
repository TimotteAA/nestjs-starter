import { Controller, Get, Query, SerializeOptions } from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Permission } from '@/modules/rbac/decorators';
import { createCrudPermission } from '@/modules/rbac/helpers';
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
import { CategoryEntity } from '../../entities';
import { CategoryService } from '../../services';

@ApiTags('分类管理')
@ApiBearerAuth()
@Depends(ContentModule)
@Crud(async () => ({
    id: 'category',
    enabled: [
        {
            name: 'list',
            option: createHookOption({
                summary: '分类查询,以分页模式展示',
                permissions: [createCrudPermission(CategoryEntity).read_list],
            }),
        },
        {
            name: 'detail',
            option: createHookOption({
                summary: '分类详情',
                permissions: [createCrudPermission(CategoryEntity).read_detail],
            }),
        },
        {
            name: 'create',
            option: createHookOption({
                summary: '创建分类',
                permissions: [createCrudPermission(CategoryEntity).create],
            }),
        },
        {
            name: 'update',
            option: createHookOption({
                summary: '更新分类',
                permissions: [createCrudPermission(CategoryEntity).update],
            }),
        },
        {
            name: 'delete',
            option: createHookOption({
                summary: '删除分类',
                permissions: [createCrudPermission(CategoryEntity).delete],
            }),
        },
        {
            name: 'restore',
            option: createHookOption({
                summary: '恢复分类',
                permissions: [createCrudPermission(CategoryEntity).restore],
            }),
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
    // @Guest()
    @Permission(createCrudPermission(CategoryEntity).read_tree)
    @ApiOperation({ summary: '树形结构分类查询' })
    @SerializeOptions({ groups: ['category-tree'] })
    async tree(@Query() options: ManageQueryCategoryTreeDto) {
        return this.service.findTrees(options);
    }
}
