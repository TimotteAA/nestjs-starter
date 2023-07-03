import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsOptional, IsUUID, MaxLength, ValidateIf } from 'class-validator';

import { DtoValidation } from '@/modules/core/decorators';
import { IsDataExist } from '@/modules/database/constraints';

import { CommentEntity, PostEntity } from '../entities';

import { ManageQueryCommentDto, ManageQueryCommentTreeDto } from './manage/comment.dto';

@DtoValidation({ type: 'query' })
export class QueryCommentDto extends ManageQueryCommentDto {}

@DtoValidation({ type: 'query' })
export class QueryCommentTreeDto extends ManageQueryCommentTreeDto {}

/**
 * 评论添加验证
 */
@DtoValidation()
export class CreateCommentDto {
    @ApiProperty({
        description: '评论内容',
        maximum: 1000,
    })
    @MaxLength(1000, { message: '评论内容不能超过$constraint1个字' })
    @IsNotEmpty({ message: '评论内容不能为空' })
    body!: string;

    @ApiProperty({
        description: '评论所属文章ID',
    })
    @IsDataExist(PostEntity, { message: '指定的文章不存在' })
    @IsUUID(undefined, { message: '文章ID格式错误' })
    @IsDefined({ message: '评论文章ID必须指定' })
    post!: string;

    @ApiProperty({
        description: '父级评论ID',
    })
    @IsDataExist(CommentEntity, { message: '父评论不存在' })
    @IsUUID(undefined, { message: '父评论ID格式不正确' })
    @ValidateIf((value) => value.parent !== null && value.parent)
    @IsOptional()
    @Transform(({ value }) => (value === 'null' ? null : value))
    parent?: string;
}
