import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { BaseControllerWithTrash } from '@/modules/restful/base';
import { Crud, Depends } from '@/modules/restful/decorators';

import { createHookOption } from '@/modules/restful/helpers';

import { CreateRoleDto, UpdateRoleDto, QueryRoleDto } from '../dtos';
import { RoleEntity } from '../entities';
import { createCrudPermission } from '../helpers';
import { RbacModule } from '../rbac.module';
import { RoleService } from '../services';

@ApiTags('角色管理')
@ApiBearerAuth()
@Depends(RbacModule)
@Crud(async () => ({
    id: 'role',
    enabled: [
        {
            name: 'create',
            options: createHookOption({
                permissions: [createCrudPermission(RoleEntity).create],
                summary: '创建角色',
            }),
        },
        {
            name: 'list',
            options: createHookOption({
                permissions: [createCrudPermission(RoleEntity).read_list],
                summary: '分页查询角色',
            }),
        },
        {
            name: 'update',
            options: createHookOption({
                permissions: [createCrudPermission(RoleEntity).update],
                summary: '更新指定角色',
            }),
        },
        {
            name: 'delete',
            options: createHookOption({
                permissions: [createCrudPermission(RoleEntity).delete],
                summary: '删除角色',
            }),
        },
        {
            name: 'detail',
            options: createHookOption({
                permissions: [createCrudPermission(RoleEntity).read_detail],
                summary: '查看角色详情',
            }),
        },
    ],
    dtos: {
        list: QueryRoleDto,
        create: CreateRoleDto,
        update: UpdateRoleDto,
    },
}))
@Controller('roles')
export class RoleController extends BaseControllerWithTrash<RoleService> {
    constructor(protected roleService: RoleService) {
        super(roleService);
    }
}
