import { Body, Controller, Post } from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Permission } from '@/modules/rbac/decorators';
import { createCrudPermission } from '@/modules/rbac/helpers';
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

@ApiTags('文章管理')
@Depends(ContentModule)
@Crud(async () => ({
    id: 'post',
    enabled: [
        {
            name: 'list',
            option: createHookOption({
                summary: '文章查询,以分页模式展示',
                permissions: [createCrudPermission(PostEntity).read_list],
            }),
        },
        {
            name: 'detail',
            option: createHookOption({
                summary: '文章查询,以分页模式展示',
                permissions: [createCrudPermission(PostEntity).read_detail],
            }),
        },
        {
            name: 'create',
            option: createHookOption({
                summary: '创建文章',
                permissions: [createCrudPermission(PostEntity).create],
            }),
        },
        {
            name: 'update',
            option: createHookOption({
                summary: '更新文章',
                permissions: [createCrudPermission(PostEntity).update],
            }),
        },
        {
            name: 'delete',
            option: createHookOption({
                summary: '删除文章',
                permissions: [createCrudPermission(PostEntity).delete],
            }),
        },
        {
            name: 'restore',
            option: createHookOption({
                summary: '恢复文章',
                permissions: [createCrudPermission(PostEntity).restore],
            }),
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

    @Permission(createCrudPermission(PostEntity).create)
    @ApiOperation({ description: '发表文章' })
    @Post()
    async create(@Body() data: ManageCreatePostDto, @ReqUser() user: ClassToPlain<UserEntity>) {
        return this.service.create(data, user.id);
    }
}
