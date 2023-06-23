import { Controller, Get, Query, SerializeOptions } from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { BaseController } from '@/modules/restful/base';
import { Crud, Depends } from '@/modules/restful/decorators';

import { createHookOption } from '@/modules/restful/helpers';

import { ReqUser } from '@/modules/user/decorators';

import { UserEntity } from '@/modules/user/entities';

import { ContentModule } from '../content.module';
import { CreateCommentDto, QueryCommentDto, QueryCommentTreeDto } from '../dtos';
import { CommentService } from '../services';

@ApiTags('评论')
@Depends(ContentModule)
@Crud(async () => ({
    id: 'comment',
    enabled: [
        {
            name: 'list',
            option: createHookOption({ summary: '评论查询,以分页模式展示', guest: true }),
        },
        {
            name: 'detail',
            option: createHookOption({ summary: '评论详情', guest: true }),
        },
        {
            name: 'create',
            option: createHookOption('添加评论'),
        },
        {
            name: 'delete',
            option: createHookOption('删除评论'),
        },
    ],
    dtos: {
        create: CreateCommentDto,
        list: QueryCommentDto,
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
        query: QueryCommentTreeDto,
    ) {
        return this.service.findTrees(query);
    }

    async create(@ReqUser() user: ClassToPlain<UserEntity>, data: CreateCommentDto) {
        return this.service.create(data, user.id);
    }
}
