import { Body, Controller, Post } from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Depends } from '@/modules/restful/decorators';
import { Guest } from '@/modules/user/decorators';

import { MediaModule } from '../media.module';
import { MediaService } from '../services';

@Controller('media')
@ApiTags('前端分类接口')
@ApiBearerAuth()
@Depends(MediaModule)
export class MediaController {
    constructor(private readonly mediaSerive: MediaService) {}

    /**
     * 前端上传文件
     * @param options
     */
    @ApiOperation({
        summary: '前端上传文件',
    })
    @Guest()
    @Post()
    async upload(@Body() data: any) {
        return this.mediaSerive.upload(data as any);
    }
}
