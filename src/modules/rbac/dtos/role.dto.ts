import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';

import { DtoValidation } from '@/modules/core/decorators';
import { IsDataExist } from '@/modules/database/constraints';
import { ListQueryDto } from '@/modules/restful/dtos';
import { UserEntity } from '@/modules/user/entities';

import { PermissionEntity } from '../entities';

@DtoValidation({ type: 'query' })
export class QueryRoleDto extends ListQueryDto {
    @ApiPropertyOptional({
        description: '用户ID，查询用户的角色',
    })
    @IsDataExist(UserEntity, {
        message: '用户不存在',
    })
    @IsUUID(undefined, {
        message: '用户ID不对',
    })
    @IsOptional()
    user?: string;
}

@DtoValidation({ groups: ['create'] })
export class CreateRoleDto {
    @ApiProperty({
        description: '创建的角色名',
    })
    @MaxLength(50, {
        message: '角色名称的长度不能超过$constraint1',
        always: true,
    })
    @IsOptional({ groups: ['update'] })
    @IsNotEmpty({ groups: ['create'], message: '角色名称必须填写' })
    name!: string;

    @ApiPropertyOptional({
        description: '角色的显示名称',
    })
    @MaxLength(50, {
        message: '角色别名的长度不能超过$constraint1',
    })
    @IsOptional({ always: true })
    label?: string;

    @ApiPropertyOptional({
        description: '角色的描述',
    })
    @MaxLength(100, {
        message: '角色描述的长度不能超过$constraint1',
    })
    @IsOptional({ always: true })
    description?: string;

    @ApiPropertyOptional({
        description: '权限ID数组',
        type: [String],
    })
    @IsDataExist(PermissionEntity, {
        message: '权限不存在',
        always: true,
        each: true,
    })
    @IsUUID(undefined, {
        each: true,
        message: '权限ID格式错误',
        always: true,
    })
    @IsOptional({ always: true })
    permissions?: string[];
}

@DtoValidation({ groups: ['update'] })
export class UpdateRoleDto extends PartialType(CreateRoleDto) {
    @ApiProperty({
        description: '要更新的角色ID',
    })
    @IsUUID(undefined, {
        groups: ['update'],
        message: '角色ID格式错误',
    })
    @IsNotEmpty({ groups: ['update'], message: '角色ID不能为空' })
    id!: string;
}
