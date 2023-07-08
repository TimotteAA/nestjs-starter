import { Body, Controller, Get, Query, SerializeOptions, Delete } from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PermissionAction } from '@/modules/rbac/constants';
import { Permission } from '@/modules/rbac/decorators';
import { PermissionChecker } from '@/modules/rbac/types';
import { BaseController } from '@/modules/restful/base';
import { Crud, Depends } from '@/modules/restful/decorators';

import { DeleteWithTrashDto } from '@/modules/restful/dtos';
import { createHookOption } from '@/modules/restful/helpers';

import { ContentModule } from '../../content.module';
import { ManageQueryCommentDto, ManageQueryCommentTreeDto } from '../../dtos/manage';
import { CommentEntity } from '../../entities';
import { CommentService } from '../../services';

const permissions: PermissionChecker[] = [
    async (ab) => ab.can(PermissionAction.MANAGE, CommentEntity),
];

@ApiBearerAuth()
@ApiTags('评论管理')
@Crud(async () => ({
    id: 'comment',
    enabled: [
        {
            name: 'list',
            option: createHookOption({ summary: '评论查询,以分页模式展示', permissions }),
        },
        {
            name: 'detail',
            option: createHookOption({ summary: '评论详情', permissions }),
        },
        {
            name: 'delete',
            option: createHookOption({ summary: '删除评论', permissions }),
        },
    ],
    dtos: {
        list: ManageQueryCommentDto,
    },
}))
@Depends(ContentModule)
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

    @Permission(permissions[0])
    @Delete()
    @ApiOperation({ summary: '删除评论' })
    async delete(@Body() data: DeleteWithTrashDto): Promise<any> {
        console.log('ids comment', data);
        return this.service.delete(data.ids, false);
    }
}
