import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { BaseControllerWithTrash } from '@/modules/restful/base';
import { Crud, Depends } from '@/modules/restful/decorators';

import { createHookOption } from '@/modules/restful/helpers';

import { PermissionAction } from '../constants';
import { CreateRoleDto, UpdateRoleDto, QueryRoleDto } from '../dtos';
import { RoleEntity } from '../entities';
import { RbacModule } from '../rbac.module';
import { RoleService } from '../services';
import { PermissionChecker } from '../types';

// 文章的后台管理权限
const permissions: PermissionChecker[] = [
    async (ab) => ab.can(PermissionAction.MANAGE, RoleEntity.name),
];

@ApiTags('角色管理')
@ApiBearerAuth()
@Depends(RbacModule)
@Crud(async () => ({
    id: 'role',
    enabled: [
        { name: 'create', options: createHookOption({ permissions, summary: '创建角色' }) },
        { name: 'list', options: createHookOption({ permissions, summary: '分页查询角色' }) },
        { name: 'update', options: createHookOption({ permissions, summary: '更新指定角色' }) },
        {
            name: 'delete',
            options: createHookOption({ permissions, summary: '删除角色' }),
        },
        { name: 'detail', options: createHookOption({ permissions, summary: '查看角色详情' }) },
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

    // @Post()
    // async create(@Body() data: CreateRoleDto) {
    //     console.log('data', data);
    //     return this.service.create(data);
    // }
}
