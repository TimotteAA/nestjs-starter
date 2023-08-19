import { Injectable } from '@nestjs/common';

import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsUUID } from 'class-validator';

import { DtoValidation } from '@/modules/core/decorators';

import { IsDataExist } from '@/modules/database/constraints';

import { ListQueryDto } from '@/modules/restful/dtos';

import { MessageEntity } from '../entities';

@Injectable()
@DtoValidation({ type: 'body' })
export class UpdateReceivesDto {
    @ApiProperty({
        description: '消息ID数组',
        type: [String],
    })
    @IsDataExist(MessageEntity, {
        each: true,
        message: '消息不存在',
    })
    @IsUUID(undefined, {
        each: true,
        message: '消息ID格式不正确',
    })
    @IsDefined({ message: '消息列表不能为空' })
    receives: string[];
}

@Injectable()
@DtoValidation({ type: 'query' })
export class QueryMessageDto extends ListQueryDto {}
