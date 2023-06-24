import { BadRequestException, Injectable } from '@nestjs/common';

import { omit, isNil } from 'lodash';
import { In, SelectQueryBuilder } from 'typeorm';

import { BaseService } from '@/modules/database/base';
import { QueryHook } from '@/modules/database/types';
import { UserService } from '@/modules/user/services';

import { QueryRoleDto, CreateRoleDto, UpdateRoleDto } from '../dtos';

import { RoleEntity } from '../entities';
import { RoleRepository, PermissionRepository } from '../repository';

/**
 * 列表查询参数，提出分页，软删除
 */
type FindParams = {
    [key in keyof Omit<QueryRoleDto, 'limit' | 'page'>]: QueryRoleDto[key];
};

@Injectable()
export class RoleService extends BaseService<RoleEntity, RoleRepository> {
    constructor(
        protected repo: RoleRepository,
        protected permissionRepo: PermissionRepository,
        protected userService: UserService,
    ) {
        super(repo);
    }

    /**
     * 创建新的角色
     * @param data
     */
    async create(data: CreateRoleDto): Promise<RoleEntity> {
        const { permissions } = data;
        const item = await this.repo.save({
            ...data,
            permissions: permissions
                ? await this.permissionRepo.find({
                      where: {
                          id: In(permissions),
                      },
                  })
                : [],
        });
        return this.detail(item.id);
    }

    async update(data: UpdateRoleDto) {
        // 老的role
        // 删除新的permissions，加入新的
        const role = await this.detail(data.id);
        const { permissions } = data;
        if (!isNil(permissions) && Array.isArray(permissions) && permissions.length > 0) {
            await this.repo
                .createQueryBuilder('role')
                .relation(RoleEntity, 'permissions')
                .of(role)
                .addAndRemove(permissions, role.permissions ?? []);
        }
        await this.repo.update(role.id, omit(data, ['permissions']));
        return this.detail(role.id);
    }

    async delete(ids: string[], trash?: boolean): Promise<RoleEntity[]> {
        // 查询是否删除了系统角色
        const items = await this.repo.find({
            where: {
                id: In(ids),
            },
            withDeleted: true,
        });
        for (const item of items) {
            if (item.systemd) {
                throw new BadRequestException('不能删除系统角色');
            }
        }
        return super.delete(ids, trash);
    }

    /**
     * 查询指定用户的角色
     * @param qb
     * @param options
     * @param callback
     */
    protected buildListQuery(
        qb: SelectQueryBuilder<RoleEntity>,
        options: FindParams,
        callback?: QueryHook<RoleEntity>,
    ) {
        const { user } = options;
        qb.leftJoinAndSelect(`${this.repo.qbName}.users`, 'users');
        if (!isNil(user)) {
            qb.andWhere('users.id In (:...ids)', {
                ids: [user],
            });
        }
        return super.buildListQB(qb, options, callback);
    }
}
