import { Injectable } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsUUID,
    IsUrl,
    MaxLength,
} from 'class-validator';

import { toNumber } from 'lodash';

import { DtoValidation } from '@/modules/core/decorators';

import { toBoolean } from '@/modules/core/helpers';

import { IsDataExist } from '@/modules/database/constraints';

import { MenuType } from '../constants';
import { MenuEntity } from '../entities';

@Injectable()
@DtoValidation({ groups: ['create'] })
export class CreateMenuDto {
    @ApiProperty({
        description: '菜单名称',
        maxLength: 20,
    })
    @MaxLength(20, { message: '$property长度不能超过$constraint1' })
    @IsNotEmpty({ message: 'menu名称不能为空' })
    name!: string;

    @ApiPropertyOptional({
        description: 'menu显示名称',
        maxLength: 20,
    })
    @MaxLength(20, { message: '$property长度不能超过$constraint1' })
    @IsOptional()
    label?: string;

    @ApiProperty({
        description: '菜单类型',
        enum: MenuType,
    })
    @IsEnum(MenuType, {
        message: `$property的值必须是${Object.values(MenuType).join(',')}中的一个`,
    })
    @IsNotEmpty()
    type!: MenuType;

    @ApiPropertyOptional({
        description: '菜单显示icon',
    })
    @IsOptional()
    icon?: string;

    @ApiPropertyOptional({
        description: '菜单对应前端组件',
    })
    @IsOptional()
    component?: string;

    @ApiProperty({
        description: '菜单对应路由',
    })
    @IsUrl(undefined, { message: '$property不是url' })
    @IsNotEmpty()
    router!: string;

    @ApiPropertyOptional({
        description: '菜单是否是外链',
    })
    @Transform(({ value }) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    isLink?: boolean;

    @ApiPropertyOptional({
        description: '菜单是否显示',
    })
    @Transform(({ value }) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    isShow?: boolean;

    @ApiPropertyOptional({
        description: '页面是否缓存',
    })
    @Transform(({ value }) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    keepAlive?: boolean;

    @ApiPropertyOptional({
        description: '菜单自定义排序',
    })
    @Transform(({ value }) => toNumber(value))
    @IsOptional()
    custormOrder?: number = 0;

    @ApiPropertyOptional({
        description: '父菜单id',
    })
    @IsUUID(undefined, {
        message: '$property不是uuid',
    })
    @IsOptional()
    parent?: string;
}

@Injectable()
@DtoValidation({ groups: ['update'] })
export class UpdateMenuDto extends PartialType(CreateMenuDto) {
    @ApiProperty({ description: '待更新菜单id' })
    @IsUUID(undefined, {
        message: '待更新菜单id不是uuid格式',
    })
    @IsNotEmpty()
    id!: string;
}

@Injectable()
@DtoValidation({ groups: ['query'] })
export class QueryMenuTreeDto {
    @IsDataExist(MenuEntity, {
        message: '菜单不存在',
    })
    @ApiPropertyOptional({ description: '查询某菜单下的子菜单' })
    @IsUUID(undefined, {
        message: '菜单id不是uuid格式',
    })
    @IsOptional()
    menuId?: string;
}
