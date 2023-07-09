import { Controller } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';

import { BaseControllerWithTrash } from '@/modules/restful/base';
import { Crud, Depends } from '@/modules/restful/decorators';

import { createHookOption } from '@/modules/restful/helpers';

import { CreateUserDto, QueryUserDto, UpdateUserDto } from '../../dtos/manage';
import { UserService } from '../../services/user.service';
import { UserModule } from '../../user.module';

/**
 * 用户管理控制器
 */
@ApiTags('用户管理')
@Depends(UserModule)
@Crud(() => ({
    id: 'user',
    enabled: [
        {
            name: 'list',
            option: createHookOption({ summary: '用户查询,以分页模式展示', guest: true }),
        },
        { name: 'detail', option: createHookOption({ summary: '用户详情', guest: true }) },
        { name: 'create', option: createHookOption({ summary: '新增用户', guest: true }) },
        { name: 'update', option: createHookOption({ summary: '修改用户信息', guest: true }) },
        { name: 'delete', option: createHookOption({ summary: '删除用户', guest: true }) },
        { name: 'restore', option: createHookOption({ summary: '恢复用户', guest: true }) },
    ],
    dtos: {
        list: QueryUserDto,
        create: CreateUserDto,
        update: UpdateUserDto,
    },
}))
@Controller('users')
export class UserController extends BaseControllerWithTrash<UserService> {
    constructor(protected userService: UserService) {
        super(userService);
    }
}
