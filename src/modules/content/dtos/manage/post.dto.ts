import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsDateString,
    IsDefined,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsUUID,
    MaxLength,
    Min,
    ValidateIf,
} from 'class-validator';

import { isNil, toNumber } from 'lodash';

import { DtoValidation } from '@/modules/core/decorators';

import { IsDataExist } from '@/modules/database/constraints';

import { PostBodyType } from '../../constants';
import { CategoryEntity } from '../../entities';

/**
 * 文章创建验证
 */
@DtoValidation({ groups: ['create'] })
export class ManageCreatePostDto {
    @ApiProperty({ description: '文章标题', maxLength: 255 })
    @MaxLength(255, {
        always: true,
        message: '文章标题长度最大为$constraint1',
    })
    @IsNotEmpty({ groups: ['create'], message: '文章标题必须填写' })
    @IsOptional({ groups: ['update'] })
    title!: string;

    @ApiProperty({ description: '文章内容' })
    @IsNotEmpty({ groups: ['create'], message: '文章内容必须填写' })
    @IsOptional({ groups: ['update'] })
    body!: string;

    @ApiPropertyOptional({
        description: '文章内容类型: 默认为markdown',
        enum: PostBodyType,
        default: 'markdown',
    })
    @IsEnum(PostBodyType, {
        message: `内容类型必须是${Object.values(PostBodyType).join(',')}其中一项`,
    })
    @IsOptional()
    type?: PostBodyType;

    @ApiPropertyOptional({ description: '文章描述', maxLength: 500 })
    @MaxLength(500, {
        always: true,
        message: '文章描述长度最大为$constraint1',
    })
    @IsOptional({ always: true })
    summary?: string;

    @ApiPropertyOptional({
        description: '发布时间:通过设置文章的发布时间来发布文章',
        type: Date,
    })
    @IsDateString({ strict: true }, { always: true })
    @IsOptional({ always: true })
    @ValidateIf((value) => !isNil(value.publishedAt))
    @Transform(({ value }) => (value === 'null' ? null : value))
    publishedAt?: Date;

    @ApiPropertyOptional({
        description: '关键字:用于SEO',
        type: [String],
        maxLength: 20,
    })
    @MaxLength(20, {
        each: true,
        always: true,
        message: '每个关键字长度最大为$constraint1',
    })
    @IsOptional({ always: true })
    keywords?: string[];

    @ApiPropertyOptional({
        description: '关联分类ID列表:一篇文章可以关联多个分类',
        type: [String],
    })
    @IsDataExist(CategoryEntity, {
        each: true,
        always: true,
        message: '分类不存在',
    })
    @IsUUID(undefined, {
        each: true,
        always: true,
        message: '分类ID格式不正确',
    })
    @IsOptional({ always: true })
    categories?: string[];

    @ApiPropertyOptional({
        description: '自定义排序',
        type: Number,
        minimum: 0,
        default: 0,
    })
    @Transform(({ value }) => toNumber(value))
    @Min(0, { always: true, message: '排序值必须大于0' })
    @IsNumber(undefined, { always: true })
    @IsOptional({ always: true })
    customOrder = 0;
}

/**
 * 文章更新验证
 */
@DtoValidation({ groups: ['update'] })
export class ManageUpdatePostDto extends PartialType(ManageCreatePostDto) {
    @ApiProperty({
        description: '待更新的文章ID',
    })
    @IsUUID(undefined, { groups: ['update'], message: '文章ID格式错误' })
    @IsDefined({ groups: ['update'], message: '文章ID必须指定' })
    id!: string;
}
