import { Body, Controller, Post } from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { BaseControllerWithTrash } from '@/modules/restful/base';
import { Crud, Depends } from '@/modules/restful/decorators';

import { createHookOption } from '@/modules/restful/helpers';

import { ReqUser } from '@/modules/user/decorators';

import { UserEntity } from '@/modules/user/entities';

import { ContentModule } from '../content.module';
import { CreatePostDto, QueryPostDto, UpdatePostDto } from '../dtos';
import { PostService } from '../services/post.service';

@ApiTags('文章')
@Depends(ContentModule)
@Crud(async () => ({
    id: 'post',
    enabled: [
        {
            name: 'list',
            option: createHookOption({ summary: '文章查询,以分页模式展示', guest: true }),
        },
        {
            name: 'detail',
            option: createHookOption({ summary: '文章查询,以分页模式展示', guest: true }),
        },
        {
            name: 'create',
            option: createHookOption('创建文章'),
        },
        {
            name: 'update',
            option: createHookOption('更新文章'),
        },
        {
            name: 'delete',
            option: createHookOption('删除文章'),
        },
        {
            name: 'restore',
            option: createHookOption('恢复文章'),
        },
    ],
    dtos: {
        create: CreatePostDto,
        update: UpdatePostDto,
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
    async create(@Body() data: CreatePostDto, @ReqUser() user: ClassToPlain<UserEntity>) {
        return this.service.create(data, user.id);
    }
}
