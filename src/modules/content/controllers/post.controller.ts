import { Param, Controller, Get, Query, SerializeOptions, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { omit } from 'lodash';

import { SelectTrashMode } from '@/modules/database/constants';
import { Depends } from '@/modules/restful/decorators';
import { Guest, ReqUser } from '@/modules/user/decorators';
import { UserEntity } from '@/modules/user/entities';

import { ContentModule } from '../content.module';
import { QueryPostDto } from '../dtos';

import { PostService } from '../services/post.service';

@ApiTags('前端文章接口')
@Depends(ContentModule)
@Controller('posts')
export class PostController {
    public constructor(protected service: PostService) {}

    @ApiOperation({
        summary: '查询文章列表',
    })
    @Guest()
    @Get()
    @SerializeOptions({ groups: ['post-list'] })
    async list(@Query() data: QueryPostDto, @ReqUser() user: ClassToPlain<UserEntity>) {
        data.trashed = SelectTrashMode.NONE;
        return this.service.paginate(omit(data, ['author', 'isPublished']));
    }

    @ApiOperation({
        summary: '查询文章详情',
    })
    @Get(':id')
    @Guest()
    @SerializeOptions({ groups: ['post-detail'] })
    async detail(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @ReqUser() author: ClassToPlain<UserEntity>,
    ) {
        return this.service.detail(id);
    }
}
