import { ApiPropertyOptional, PickType } from '@nestjs/swagger';

import { IsOptional, IsUUID } from 'class-validator';

import { DtoValidation } from '@/modules/core/decorators';
import { IsDataExist } from '@/modules/database/constraints';
import { ListQueryDto } from '@/modules/restful/dtos';
import { UserEntity } from '@/modules/user/entities';

import { PostEntity } from '../../entities';

/**
 * 评论分页查询验证
 */
@DtoValidation({ type: 'query' })
export class ManageQueryCommentDto extends ListQueryDto {
    @ApiPropertyOptional({
        description: '评论所属文章ID:根据传入评论所属文章的ID对评论进行过滤',
    })
    @IsDataExist(PostEntity, {
        message: '所属的文章不存在',
    })
    @IsUUID(undefined, { message: '分类ID格式错误' })
    @IsOptional()
    post?: string;

    @ApiPropertyOptional({
        description: '评论所属用户Id:根据传入评论所属用户的ID对评论进行过滤',
    })
    @IsDataExist(UserEntity, {
        message: '用户不存在',
    })
    @IsUUID(undefined, { message: '作者ID错误' })
    @IsOptional()
    author?: string;
}

/**
 * 评论树查询
 */
@DtoValidation({ type: 'query' })
export class ManageQueryCommentTreeDto extends PickType(ManageQueryCommentDto, [
    'post',
    'author',
]) {}
