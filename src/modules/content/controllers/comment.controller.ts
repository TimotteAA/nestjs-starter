import {
    Param,
    Controller,
    Get,
    Query,
    SerializeOptions,
    ParseUUIDPipe,
    Body,
    Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { In } from 'typeorm';

import { PermissionAction } from '@/modules/rbac/constants';
import { Permission } from '@/modules/rbac/decorators';
import { checkOwner } from '@/modules/rbac/helpers';
import { PermissionChecker } from '@/modules/rbac/types';
import { Depends } from '@/modules/restful/decorators';
import { DeleteDto } from '@/modules/restful/dtos';
import { Guest, ReqUser } from '@/modules/user/decorators';

import { UserEntity } from '@/modules/user/entities';

import { ContentModule } from '../content.module';
import { CreateCommentDto, QueryCommentDto } from '../dtos';

import { CommentEntity } from '../entities';
import { CommentRepository } from '../repositories';
import { CommentService } from '../services';

const permissions: Record<'create' | 'delete', PermissionChecker> = {
    create: async (ab) => ab.can(PermissionAction.CREATE, CommentEntity),
    delete: async (ab, ref, request) =>
        checkOwner(
            ab,
            async (ids) =>
                ref.get(CommentRepository, { strict: false }).find({
                    relations: ['author'],
                    where: {
                        id: In(ids),
                    },
                }),
            request,
        ),
};

@ApiTags('前端评论接口')
@Depends(ContentModule)
@Controller('comments')
export class CommentController {
    public constructor(protected service: CommentService) {}

    @ApiOperation({
        summary: '查询文章列表',
    })
    @Guest()
    @Get()
    @SerializeOptions({ groups: ['comment-list'] })
    async list(@Query() data: QueryCommentDto) {
        return this.service.paginate(data);
    }

    @ApiOperation({
        summary: '查看评论详情',
    })
    @Get(':id')
    @Guest()
    @SerializeOptions({ groups: ['comment-detail'] })
    async detail(
        @Param('id', new ParseUUIDPipe())
        id: string,
    ) {
        return this.service.detail(id);
    }

    @ApiOperation({
        summary: '创建评论',
    })
    @Permission(permissions.create)
    @Post()
    async create(@Body() data: CreateCommentDto, @ReqUser() user: ClassToPlain<UserEntity>) {
        return this.service.create(data, user.id);
    }

    @ApiOperation({
        summary: '删除评论',
    })
    @Guest()
    @Permission(permissions.delete)
    async delete(@Body() data: DeleteDto) {
        console.log('data', data);
        return this.service.delete(data.ids, false);
    }
}
