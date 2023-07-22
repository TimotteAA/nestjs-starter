import { Controller } from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

// import { Permission } from '@/modules/rbac/decorators';
// import { createCrudPermission } from '@/modules/rbac/helpers';
import { BaseController } from '@/modules/restful/base';
import { Crud, Depends } from '@/modules/restful/decorators';

import { createHookOption } from '@/modules/restful/helpers';

import { MediaModule } from '../../media.module';
import { MediaService } from '../../services';

@ApiBearerAuth()
@ApiTags('文件管理')
@Crud(async () => ({
    id: 'media',
    enabled: [
        {
            name: 'list',
            option: createHookOption({
                summary: '评论查询,以分页模式展示',
                // permissions: [createCrudPermission(CommentEntity).read_list],
                guest: true,
            }),
        },
        {
            name: 'detail',
            option: createHookOption({
                summary: '评论详情',
                // permissions: [createCrudPermission(CommentEntity).read_detail],
                guest: true,
            }),
        },
        {
            name: 'delete',
            option: createHookOption({
                summary: '删除评论',
                // permissions: [createCrudPermission(CommentEntity).delete],
                guest: true,
            }),
        },
    ],
    dtos: {
        // list: ManageQueryCommentDto,
    },
}))
@Depends(MediaModule)
@Controller('medias')
export class CommentController extends BaseController<MediaService> {
    constructor(protected service: MediaService) {
        super(service);
    }
}
