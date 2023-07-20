import { BadRequestException, ForbiddenException, Injectable, OnModuleInit } from '@nestjs/common';
import { isNil, omit } from 'lodash';
import { EntityNotFoundError, SelectQueryBuilder, DataSource, In } from 'typeorm';

import { Configure } from '@/modules/core/configure';
import { BaseService } from '@/modules/database/base';
import { QueryHook } from '@/modules/database/types';

import { SystemRoles } from '@/modules/rbac/constants';
import { PermissionRepository, RoleRepository } from '@/modules/rbac/repository';

import { CreateUserDto, QueryUserDto, UpdateUserDto } from '../dtos/manage';
import { UserEntity } from '../entities/user.entity';
import { getUserConfig } from '../helpers';
import { UserRepository } from '../repositories/user.repository';
import { UserConfig } from '../types';

/**
 * 用户管理服务
 */
@Injectable()
export class UserService extends BaseService<UserEntity, UserRepository> implements OnModuleInit {
    async onModuleInit() {
        // 在运行cli时防止报错
        // console.log(await this.configure.get("app"));
        if (!(await this.configure.get<boolean>('app.server', false))) return null;
        // console.log(
        //     'user module init>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',
        // );
        const adminConf = await getUserConfig<UserConfig['super']>('super');
        const admin = await this.findOneByCredential(adminConf.username);
        if (!isNil(admin)) {
            if (!admin.isCreator) {
                await UserEntity.save({ id: admin.id, isCreator: true });
                return this.findOneByCredential(adminConf.username);
            }
            return admin;
        }
        const res = await this.create({
            ...adminConf,
            isCreator: true,
            phone: '+8617301780942',
            email: '1273871844@qq.com',
        });
        return res;
    }

    protected enableTrash = true;

    constructor(
        protected readonly userRepository: UserRepository,
        protected readonly configure: Configure,
        protected readonly dataSource: DataSource,
        protected readonly roleRepo: RoleRepository,
        protected readonly permissionRepo: PermissionRepository,
    ) {
        super(userRepository);
    }

    /**
     * 创建用户
     * @param data
     */
    async create(data: CreateUserDto & { isCreator?: boolean }) {
        const { permissions, roles, isCreator, ...rest } = data;
        const user = await this.userRepository.save(
            {
                ...rest,
                isCreator: !!(!isNil(isCreator) && isCreator === true),
            },
            { reload: true },
        );

        if (!isNil(roles) && roles.length > 0) {
            await this.userRepository
                .createQueryBuilder('user')
                .relation(UserEntity, 'roles')
                .of(user)
                .add(roles);
        }

        if (!isNil(permissions) && permissions.length > 0) {
            await this.userRepository
                .createQueryBuilder('user')
                .relation(UserEntity, 'permissions')
                .of(user)
                .add(permissions);
        }
        await this.syncActived(user);
        return this.detail(user.id);
    }

    /**
     * 更新用户
     * @param data
     */
    async update(data: UpdateUserDto & { isCreator?: boolean }) {
        const { permissions, roles, ...rest } = data;
        const user = await this.detail(rest.id);
        if (user.isCreator && data.actived === false) {
            throw new ForbiddenException('不能禁用超级用户');
        }
        await this.userRepository.save(omit(rest, ['isCreator', 'id']) as any, {
            reload: true,
        });
        const updatedUser = await this.detail(rest.id);
        if (!isNil(permissions) && permissions.length) {
            await this.userRepository
                .createQueryBuilder('user')
                .relation(UserEntity, 'permissions')
                .of(updatedUser)
                .addAndRemove(permissions, updatedUser.permissions ?? []);
        }
        if (!isNil(roles) && roles.length) {
            await this.userRepository
                .createQueryBuilder('user')
                .relation(UserEntity, 'roles')
                .of(updatedUser)
                .addAndRemove(roles, updatedUser.roles ?? []);
        }
        await this.syncActived(updatedUser);
        return this.detail(user.id);
    }

    async delete(ids: string[], trash?: boolean): Promise<UserEntity[]> {
        const users = await this.userRepository.find({
            where: {
                id: In(ids),
            },
            withDeleted: true,
        });
        for (const user of users) {
            if (user.isCreator) {
                throw new BadRequestException(`不能删除用户：${user.username}`);
            }
        }
        return super.delete(ids, trash);
    }

    /**
     * 根据用户用户凭证查询用户
     * @param credential
     * @param callback
     */
    async findOneByCredential(credential: string, callback?: QueryHook<UserEntity>) {
        let query = this.userRepository.buildBaseQuery();
        if (callback) {
            query = await callback(query);
        }
        return query
            .where('user.username = :credential', { credential })
            .orWhere('user.email = :credential', { credential })
            .orWhere('user.phone = :credential', { credential })
            .getOne();
    }

    /**
     * 根据对象条件查找用户,不存在则抛出异常
     * @param condition
     * @param callback
     */
    async findOneByCondition(condition: { [key: string]: any }, callback?: QueryHook<UserEntity>) {
        let query = this.userRepository.buildBaseQuery();
        if (callback) {
            query = await callback(query);
        }
        const wheres = Object.fromEntries(
            Object.entries(condition).map(([key, value]) => [key, value]),
        );
        const user = query.where(wheres).getOne();
        if (!user) {
            throw new EntityNotFoundError(UserEntity, Object.keys(condition).join(','));
        }
        return user;
    }

    protected async buildListQB(
        queryBuilder: SelectQueryBuilder<UserEntity>,
        options: QueryUserDto,
        callback?: QueryHook<UserEntity>,
    ) {
        const { orderBy } = options;
        const qb = await super.buildListQB(queryBuilder, options, callback);
        if (orderBy) qb.orderBy(`user.${orderBy}`, 'ASC');
        return qb;
    }

    protected async syncActived(user: UserEntity) {
        // user的role和permission，用于后续处理
        const roleRelation = this.userRepository.createQueryBuilder().relation('roles').of(user);
        const permissionRelation = this.userRepository
            .createQueryBuilder()
            .relation('permissions')
            .of(user);
        // 激活的用户
        if (user.actived) {
            // 当前用户的所有角色
            const roleNames = (user.roles ?? []).map((item) => item.name);
            // 是否没有角色
            const noRoles =
                roleNames.length <= 0 ||
                (!roleNames.includes(SystemRoles.ADMIN) && !roleNames.includes(SystemRoles.USER));
            const isSuperAdmin = roleNames.includes(SystemRoles.ADMIN);
            if (noRoles) {
                // 分配普通角色
                const customRole = await this.roleRepo.findOne({
                    where: {
                        name: SystemRoles.USER,
                    },
                    relations: ['users'],
                });
                if (!isNil(customRole)) await roleRelation.add(customRole);
            } else if (isSuperAdmin) {
                // 分配超级管理员角色
                const adminRole = await this.roleRepo.findOne({
                    where: {
                        name: SystemRoles.ADMIN,
                    },
                    relations: ['users'],
                });

                if (!isNil(adminRole)) await roleRelation.addAndRemove(adminRole, user.roles);
            }
        } else {
            // 没有激活的用户，删除所有权限与角色
            await roleRelation.remove((user.roles ?? []).map((item) => item.id));
            await permissionRelation.remove((user.permissions ?? []).map((item) => item.id));
        }
    }
}
