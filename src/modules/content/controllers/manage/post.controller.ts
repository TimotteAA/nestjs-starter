import { Body, Controller, Post } from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { PermissionAction } from '@/modules/rbac/constants';
import { PermissionChecker } from '@/modules/rbac/types';
import { BaseControllerWithTrash } from '@/modules/restful/base';
import { Crud, Depends } from '@/modules/restful/decorators';

import { createHookOption } from '@/modules/restful/helpers';

import { ReqUser } from '@/modules/user/decorators';

import { UserEntity } from '@/modules/user/entities';

import { ContentModule } from '../../content.module';
import { QueryPostDto } from '../../dtos';
import { ManageCreatePostDto, ManageUpdatePostDto } from '../../dtos/manage/post.dto';
import { PostEntity } from '../../entities';
import { PostService } from '../../services/post.service';

// 文章的后台管理权限
const permissions: PermissionChecker[] = [
    async (ab) => ab.can(PermissionAction.MANAGE, PostEntity.name),
];

@ApiTags('文章管理')
@Depends(ContentModule)
@Crud(async () => ({
    id: 'post',
    enabled: [
        {
            name: 'list',
            option: createHookOption({
                summary: '文章查询,以分页模式展示',
                permissions,
            }),
        },
        {
            name: 'detail',
            option: createHookOption({ summary: '文章查询,以分页模式展示', permissions }),
        },
        {
            name: 'create',
            option: createHookOption({ summary: '创建文章', permissions }),
        },
        {
            name: 'update',
            option: createHookOption({ summary: '更新文章', permissions }),
        },
        {
            name: 'delete',
            option: createHookOption({ summary: '删除文章', permissions }),
        },
        {
            name: 'restore',
            option: createHookOption({ summary: '恢复文章', permissions }),
        },
    ],
    dtos: {
        create: ManageCreatePostDto,
        update: ManageUpdatePostDto,
        list: QueryPostDto,
    },
}))
@Controller('posts')
export class PostController extends BaseControllerWithTrash<PostService> {
    constructor(protected service: PostService) {
        super(service);
    }

    @ApiOperation({ description: '发表文章' })
    @Post()
    async create(@Body() data: ManageCreatePostDto, @ReqUser() user: ClassToPlain<UserEntity>) {
        return this.service.create(data, user.id);
    }
}
