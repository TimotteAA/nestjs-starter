import { Controller, Delete, Get, Query, SerializeOptions } from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { BaseController } from '@/modules/restful/base';
import { Crud, Depends } from '@/modules/restful/decorators';

import { DeleteDto } from '@/modules/restful/dtos';
import { createHookOption } from '@/modules/restful/helpers';

import { ContentModule } from '../../content.module';
import { ManageQueryCommentDto, ManageQueryCommentTreeDto } from '../../dtos/manage';
import { CommentService } from '../../services';

@ApiTags('评论管理')
@Depends(ContentModule)
@Crud(async () => ({
    id: 'comment',
    enabled: [
        {
            name: 'list',
            option: createHookOption({ summary: '评论查询,以分页模式展示' }),
        },
        {
            name: 'detail',
            option: createHookOption({ summary: '评论详情' }),
        },
        {
            name: 'delete',
            option: createHookOption('删除评论'),
        },
    ],
    dtos: {
        list: ManageQueryCommentDto,
    },
}))
@Controller('comments')
export class CommentController extends BaseController<CommentService> {
    constructor(protected service: CommentService) {
        super(service);
    }

    @Get('tree')
    @ApiOperation({ summary: '树形结构评论查询' })
    @SerializeOptions({ groups: ['comment-tree'] })
    async tree(
        @Query()
        query: ManageQueryCommentTreeDto,
    ) {
        return this.service.findTrees(query);
    }

    @Delete()
    @ApiOperation({ summary: '批量删除评论' })
    async delete({ ids }: DeleteDto): Promise<any> {
        return this.service.delete(ids, false);
    }
}
