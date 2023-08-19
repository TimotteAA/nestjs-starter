import { Body, Controller, Post } from '@nestjs/common';

import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Depends } from '@/modules/restful/decorators';
import { Guest } from '@/modules/user/decorators';

import { UploadFileDto } from '../dtos';
import { MediaModule } from '../media.module';
import { MediaService } from '../services';

@Controller('media')
@ApiTags('前端上传文件')
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
    @ApiConsumes('multipart/form-data')
    @Guest()
    @Post()
    async upload(@Body() data: UploadFileDto) {
        // console.log(data.image);
        // console.log(data.prefix);
        return this.mediaSerive.upload({ file: data.image, prefix: (data.prefix as any).value });
    }
}
