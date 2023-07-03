import { Controller, Get, Param, ParseUUIDPipe, Query, SerializeOptions } from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SelectTrashMode } from '@/modules/database/constants';
import { Depends } from '@/modules/restful/decorators';

import { ListQueryDto } from '@/modules/restful/dtos';
import { Guest } from '@/modules/user/decorators';

import { ContentModule } from '../content.module';

import { ApiQueryCategoryTreeDto } from '../dtos';
import { CategoryService } from '../services';

@ApiTags('前端分类接口')
@ApiBearerAuth()
@Depends(ContentModule)
@Controller('categories')
export class CategoryController {
    constructor(protected categoryService: CategoryService) {}

    /**
     * 获取分类树
     * @param options
     */
    @ApiOperation({
        summary: '查询分类树',
    })
    @Guest()
    @SerializeOptions({ groups: ['category-tree'] })
    @Get('tree')
    async tree(@Query() data: ApiQueryCategoryTreeDto) {
        return this.categoryService.findTrees({ ...data, trashed: SelectTrashMode.NONE });
    }

    /**
     * 评论列表
     * @param data
     */
    @ApiOperation({
        summary: '查询分类列表',
    })
    @Guest()
    @SerializeOptions({ groups: ['category-list'] })
    @Get()
    async list(@Query() data: ListQueryDto) {
        return this.categoryService.paginate({ ...data, trashed: false });
    }

    @ApiOperation({
        summary: '分类详情',
    })
    @Guest()
    @SerializeOptions({ groups: ['category-detail'] })
    @Get(':id')
    async detail(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.categoryService.detail(id);
    }
}
