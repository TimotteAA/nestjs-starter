import { ApiPropertyOptional } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsUUID, MaxLength } from 'class-validator';

import { DtoValidation } from '@/modules/core/decorators';
import { toBoolean } from '@/modules/core/helpers';
import { IsDataExist } from '@/modules/database/constraints';
import { ListWithTrashedQueryDto } from '@/modules/restful/dtos';

import { UserEntity } from '@/modules/user/entities';

import { PostOrderType } from '../constants';
import { CategoryEntity } from '../entities';

/**
 * 文章分页查询验证
 */
@DtoValidation({ type: 'query' })
export class QueryPostDto extends ListWithTrashedQueryDto {
    @ApiPropertyOptional({
        description: '搜索关键字:文章全文搜索字符串',
        maxLength: 100,
    })
    @MaxLength(100, {
        always: true,
        message: '搜索字符串长度不得超过$constraint1',
    })
    @IsOptional({ always: true })
    search?: string;

    @ApiPropertyOptional({
        description: '分类ID:过滤一个分类及其子孙分类下的文章',
    })
    @IsDataExist(CategoryEntity, {
        message: '指定的分类不存在',
    })
    @IsUUID(undefined, { message: '分类ID格式错误' })
    @IsOptional()
    category?: string;

    @ApiPropertyOptional({
        description: '发布状态:根据是否发布过滤文章状态',
    })
    @Transform(({ value }) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;

    @ApiPropertyOptional({
        description: '排序规则:可指定文章列表的排序规则,默认为综合排序',
        enum: PostOrderType,
    })
    @IsEnum(PostOrderType, {
        message: `排序规则必须是${Object.values(PostOrderType).join(',')}其中一项`,
    })
    @IsOptional()
    orderBy?: PostOrderType;

    @ApiPropertyOptional({
        description: '文章作者ID',
    })
    @IsDataExist(UserEntity, {
        // always: true,
        message: '用户不存在',
    })
    @IsUUID(undefined, {
        message: '用户id格式错误',
    })
    @IsOptional({ always: true })
    author?: UserEntity;
}
