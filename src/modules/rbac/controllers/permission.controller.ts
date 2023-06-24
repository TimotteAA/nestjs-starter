import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { BaseController } from '@/modules/restful/base';
import { Crud, Depends } from '@/modules/restful/decorators';

import { createHookOption } from '@/modules/restful/helpers';

import { PermissionAction } from '../constants';
import { QueryPermissionDto } from '../dtos';
import { PermissionEntity } from '../entities';
import { RbacModule } from '../rbac.module';
import { PermissionService } from '../services';
import { PermissionChecker } from '../types';

/**
 * 权限：权限管理员
 */
const permissions: PermissionChecker[] = [
    async (ab) => ab.can(PermissionAction.MANAGE, PermissionEntity.name),
];

@ApiTags('权限管理')
@ApiBearerAuth()
@Depends(RbacModule)
@Crud(async () => ({
    id: 'permission',
    enabled: [
        { name: 'list', option: createHookOption({ summary: '分页查询权限', permissions }) },
        { name: 'detail', option: createHookOption({ summary: '查看权限详情', permissions }) },
    ],
    dtos: {
        list: QueryPermissionDto,
    },
}))
@Controller('permissions')
export class PermissionController extends BaseController<PermissionService> {
    constructor(protected permissionService: PermissionService) {
        super(permissionService);
    }

    // @Get()
    // async list(@Query() data: QueryPermissionDto) {
    //   return this.permissionService.pa(data);
    // }

    // @Get(":id")
    // async detail(@Query("id") id: string) {
    //   return this.permissionService.detail(id);
    // }
}
