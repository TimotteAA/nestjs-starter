import { MultipartFile } from '@fastify/multipart';
import { ApiProperty } from '@nestjs/swagger';

import { IsDefined, IsOptional } from 'class-validator';

import { IsFileLimit } from '@/modules/core/constraints';
import { DtoValidation } from '@/modules/core/decorators';

import { CosBucket } from '../constants';

/**
 * 上传文件dto，可以是image，也可以是别的字段
 */
@DtoValidation()
export class UploadFileDto {
    @IsFileLimit(
        {
            fileSize: 1024 * 1024 * 5,
            mimetypes: ['image/png', 'image/gif', 'image/jpeg', 'image/webp', 'image/svg+xml'],
        },
        {
            always: true,
        },
    )
    @ApiProperty({
        description: '上传的图片',
    })
    @IsDefined({ groups: ['create'], message: 'image can not be empty' })
    @IsOptional({ groups: ['update'] })
    image: MultipartFile;

    @ApiProperty({
        description: '上传bucket的prefix',
        enum: CosBucket,
    })
    // @IsEnum(CosBucket, {
    //     message: `$property must be one of the following values: ${Object.values(CosBucket).join(
    //         ', ',
    //     )}`,
    // })
    @IsDefined({ groups: ['create'], message: 'prefix can not be empty' })
    prefix!: CosBucket;
}
