import { PickType, PartialType, ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsDefined, IsEnum, IsOptional, IsUUID } from 'class-validator';

import { DtoValidation } from '@/modules/core/decorators';

import { toBoolean } from '@/modules/core/helpers';
import { IsDataExist } from '@/modules/database/constraints';
import { RoleEntity } from '@/modules/rbac/entities';
import { ListWithTrashedQueryDto } from '@/modules/restful/dtos';

import { UserOrderType, UserValidateGroups } from '../../constants';

import { UserCommonDto } from '../common.dto';

/**
 * 创建用的请求数据验证
 */
@DtoValidation({ groups: [UserValidateGroups.CREATE] })
export class CreateUserDto extends PickType(UserCommonDto, [
    'username',
    'nickname',
    'password',
    'phone',
    'email',
]) {
    @ApiPropertyOptional({
        description: '用户是否激活',
        type: Boolean,
    })
    @IsBoolean()
    @Transform(({ value }) => toBoolean(value))
    @IsOptional({ always: true })
    actived?: boolean = true;

    @ApiPropertyOptional({
        description: '用户角色',
    })
    @IsDataExist(RoleEntity, {
        message: '角色不存在',
        each: true,
    })
    @IsUUID(undefined, {
        message: '角色ID错误',
        each: true,
    })
    @IsOptional()
    roles?: string[];

    @ApiPropertyOptional({
        description: '用户权限',
    })
    @IsDataExist(RoleEntity, {
        message: '权限不存在',
        each: true,
    })
    @IsUUID(undefined, {
        message: '权限ID错误',
        each: true,
    })
    @IsOptional()
    permissions?: string[];
}

/**
 * 更新用户
 */
@DtoValidation({ groups: [UserValidateGroups.UPDATE] })
export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty({
        description: '待更新的用户ID',
    })
    @IsUUID(undefined, { groups: [UserValidateGroups.UPDATE], message: '用户ID格式不正确' })
    @IsDefined({ groups: ['update'], message: '用户ID必须指定' })
    id!: string;
}

/**
 * 查询用户列表的Query数据验证
 */
@DtoValidation({ type: 'query' })
export class QueryUserDto extends ListWithTrashedQueryDto {
    @ApiPropertyOptional({
        description: '排序规则:可指定用户列表的排序规则,默认为按创建时间降序排序',
        enum: UserOrderType,
    })
    @IsEnum(UserOrderType)
    orderBy?: UserOrderType;
}
