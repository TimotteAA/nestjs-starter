import { Injectable } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

import { DtoValidation } from '@/modules/core/decorators';
import { IsDataExist } from '@/modules/database/constraints';
import { ListQueryDto } from '@/modules/restful/dtos';

import { RoleEntity } from '../entities';

@DtoValidation({ type: 'query' })
@Injectable()
export class QueryPermissionDto extends ListQueryDto {
    @ApiPropertyOptional({
        description: '角色ID，查询某个角色的权限',
    })
    @IsDataExist(RoleEntity, {
        message: '角色不存在',
    })
    @IsUUID(undefined, {
        message: '角色ID格式错误',
    })
    @IsOptional()
    role?: string;
}
