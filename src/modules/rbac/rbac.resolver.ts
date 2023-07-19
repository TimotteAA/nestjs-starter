import { AbilityOptions, AbilityTuple, MongoQuery, SubjectType } from '@casl/ability';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { isNil, omit } from 'lodash';
import { DataSource, EntityManager, Not, In } from 'typeorm';

import { deepMerge } from '@/modules/core/helpers';

import { Configure } from '../core/configure';
import { UserEntity } from '../user/entities';
import { getUserConfig } from '../user/helpers';
import { UserConfig } from '../user/types';

import { MenuType, PermissionAction, SystemRoles } from './constants';
import { PermissionEntity, RoleEntity } from './entities';
import { PermissionType, Role } from './types';

/**
 * 获取管理对象的字符串名
 * @param subject
 */
const getSubject = <S extends SubjectType>(subject: S) => {
    if (typeof subject === 'string') return subject;
    if (subject.modelName) return subject.modelName;
    return subject.name;
};

@Injectable()
export class RbacResolver<A extends AbilityTuple = AbilityTuple, C extends MongoQuery = MongoQuery>
    implements OnApplicationBootstrap
{
    protected setuped = false;

    /**
     * set的时候为空
     */
    protected options: AbilityOptions<A, C>;

    /**
     * 具体的权限会在应用启动中同步
     */
    protected _roles: Role[] = [
        {
            name: SystemRoles.USER,
            label: '默认用户',
            description: '新用户的默认角色',
            permissions: [],
        },
        {
            name: SystemRoles.ADMIN,
            label: '系统超级管理员',
            description: '拥有整个系统的超级管理员',
            permissions: [],
        },
    ];

    /**
     * 默认权限
     */
    protected _permissions: PermissionType<A, C>[] = [
        {
            name: 'global.permission',
            type: MenuType.PERMISSION,
        },
        // 下面是后台权限
        {
            name: 'system.manage',
            label: '系统管理',
            // casl中的两个关键词
            rule: {
                action: PermissionAction.MANAGE,
                subject: 'all',
            } as any,
            customOrder: 0,
            type: MenuType.DIRECTORY,
        },
        {
            name: 'rbac.manage',
            label: 'rbac模块管理',
            customOrder: 0,
            type: MenuType.DIRECTORY,
        },
        {
            name: 'rbac.permission.manage',
            label: '权限管理',
            type: MenuType.MENU,
            parentName: 'rbac.manage',
        },
        {
            name: 'rbac.role.manage',
            label: '角色管理',
            parentName: 'rbac.manage',
            type: MenuType.MENU,
        },
        // crud of roles
        {
            name: 'rabc.role.create',
            label: '创建角色',
            parentName: 'rbac.role.manage',
            type: MenuType.PERMISSION,
            rule: {
                action: PermissionAction.CREATE,
                subject: RoleEntity,
            } as any,
        },
        {
            name: 'rabc.role.read_list',
            label: '分页查询角色',
            parentName: 'rbac.role.manage',
            type: MenuType.PERMISSION,
            rule: {
                action: PermissionAction.READ_LIST,
                subject: RoleEntity,
            } as any,
        },
        {
            name: 'rabc.role.update',
            label: '更新角色',
            parentName: 'rbac.role.manage',
            type: MenuType.PERMISSION,
            rule: {
                action: PermissionAction.UPDATE,
                subject: RoleEntity,
            } as any,
        },
        {
            name: 'rabc.role.detail',
            label: '查询角色详情',
            parentName: 'rbac.role.manage',
            type: MenuType.PERMISSION,
            rule: {
                action: PermissionAction.READ_DETAIL,
                subject: RoleEntity,
            } as any,
        },
        {
            name: 'rabc.role.delete',
            label: '删除角色',
            parentName: 'rbac.role.delete',
            type: MenuType.PERMISSION,
            rule: {
                action: PermissionAction.DELETE,
                subject: RoleEntity,
            } as any,
        },
    ];

    constructor(protected dataSource: DataSource, protected configure: Configure) {}

    setOptions(options: AbilityOptions<A, C>) {
        if (!this.setuped) {
            this.options = options;
            this.setuped = true;
        }
        return this;
    }

    get roles() {
        return this._roles;
    }

    get permissions() {
        return this._permissions;
    }

    /**
     * 每个模块添加角色
     * @param data
     */
    addRoles(data: Role[]) {
        this._roles = [...this.roles, ...data];
    }

    /**
     * 每个模块添加权限
     * @param data
     */
    addPermissions(data: PermissionType<A, C>[]) {
        this._permissions = [...this._permissions, ...data].map((item) => {
            if (isNil(item.rule)) return { ...item };
            let subject: typeof item.rule.subject;
            // 确保Subject是字符串或字符串数组
            if (Array.isArray(item?.rule?.subject))
                subject = item?.rule?.subject.map((s) => getSubject(s));
            else subject = getSubject(item?.rule?.subject);

            const rule = { ...item.rule, subject };
            return { ...item, rule };
        });
    }

    async onApplicationBootstrap() {
        console.log(
            'app start ->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',
        );
        // // 在运行cli时防止报错
        // console.log(await this.configure.get<boolean>('app'));
        if (!(await this.configure.get<boolean>('app.server', false))) return;

        const queryRunner = this.dataSource.createQueryRunner();
        // 连接到数据库
        // await queryRunner.query('SET FOREIGN_KEY_CHECKS=0;');

        await queryRunner.connect();
        // 开启事务
        await queryRunner.startTransaction();
        // console.log(chalk.red(1231231))

        try {
            // 同步模块角色
            await this.syncRoles(queryRunner.manager);
            // 同步模块权限
            await this.syncPermissions(queryRunner.manager);
            // 同步模块菜单
            // await this.syncMenus(queryRunner.manager);
            await queryRunner.commitTransaction();
        } catch (err) {
            console.error(err);
            await queryRunner.rollbackTransaction();
        } finally {
            // await queryRunner.query('SET FOREIGN_KEY_CHECKS=1;');
            await queryRunner.release();
        }
    }

    /**
     * 同步模块系统角色到数据库中
     * 模块硬编码的角色都是系统角色
     * @param manager
     */
    protected async syncRoles(manager: EntityManager) {
        // 内存中的系统角色
        this._roles = this.roles.reduce<Role[]>((o, n) => {
            if (o.map(({ name }) => name).includes(n.name)) {
                // 相同名称的role，将两者进行合并
                return o.map((e) => (e.name === n.name ? deepMerge(e, n, 'merge') : e));
            }
            return [...o, n];
        }, []);

        for (const item of this.roles) {
            // 角色数据库中进行查找
            let role = await manager.findOne(RoleEntity, {
                where: {
                    name: item.name,
                },
                relations: ['permissions'],
            });

            if (isNil(role)) {
                // 放到数据库中
                // 各个模块的默认都是系统角色
                role = manager.create(RoleEntity, {
                    name: item.name,
                    label: item.label,
                    description: item.description,
                    systemd: true,
                });

                await manager.save(role, {
                    reload: true,
                });
                // console.log("item", item2)
            } else {
                await manager.update(RoleEntity, role.id, { systemd: true });
            }
        }

        // 清理已经不存在的系统角色
        const systemRoles = await manager.find(RoleEntity, {
            where: {
                systemd: true,
            },
            relations: ['permissions'],
        });
        // console.log("systemRoles", systemRoles);
        const toDels: string[] = [];
        for (const role of systemRoles) {
            if (!this.roles.find((item) => item.name === role.name)) {
                toDels.push(role.id);
                // 由于外键约束，清理老的permissions
                await manager
                    .createQueryBuilder()
                    .relation(RoleEntity, 'permissions')
                    .of(role)
                    .remove(role.permissions ?? []);
            }
        }
        console.log('toDels role', toDels);
        // 删除角色前，清楚permissions的关系

        if (toDels.length > 0) await manager.delete(RoleEntity, toDels);
    }

    /**
     * 同步模块权限
     * 权限都是硬编码的
     * @param manager
     */
    protected async syncPermissions(manager: EntityManager) {
        const superAdmin = await getUserConfig<UserConfig['super']>('super');
        // 数据库中所有的权限
        const permissions = await manager.find(PermissionEntity);
        // console.log('permissions1', permissions)
        // 非超级管理员的所有角色
        const roles = await manager.find(RoleEntity, {
            where: {
                name: Not(SystemRoles.ADMIN),
            },
            relations: ['permissions'],
        });
        const roleRepo = manager.getRepository(RoleEntity);
        // console.log("2", this.permissions)
        // 合并并去除重名权限
        this._permissions = this.permissions.reduce<PermissionType<A, C>[]>((o, n) => {
            if (o.map(({ name }) => name).includes(n.name)) {
                // 不能含有同名的permission
                return o;
            }
            return [...o, n];
        }, []);
        // 当前所有的权限名
        const names = this.permissions.map((p) => p.name);
        // console.log("3", this.permissions)

        // 同步权限
        for (const item of this.permissions) {
            // 去掉rule.conditions
            // const permission = omit(item, ['conditions']);
            const permission = {
                ...item,
                rule: omit(item.rule, 'conditions'),
                parent: isNil(item.parentName)
                    ? null
                    : await manager.findOne(PermissionEntity, {
                          where: {
                              name: item.parentName,
                          },
                      }),
            };

            // console.log("4", permission)
            const old = await manager.findOne(PermissionEntity, {
                where: {
                    name: permission.name,
                },
                relations: ['parent'],
            });
            if (isNil(old)) {
                await manager.save(manager.create(PermissionEntity, permission));
            } else {
                if (permission.parent.name !== old.parent.name) {
                    // remove parent
                    await manager
                        .createQueryBuilder()
                        .relation(PermissionEntity, 'parent')
                        .of(old)
                        .set(null);
                    await manager.update(PermissionEntity, old.id, permission);
                } else {
                    await manager.update(PermissionEntity, old.id, omit(permission, ['parent']));
                }
            }
        }

        // console.log("所有的权限", await manager.find(PermissionEntity))

        // 删除冗余权限
        // 去除硬编码的代码中不存在的角色，不可删除系统管理权限
        const toDels: string[] = [];
        for (const item of permissions) {
            if (!names.includes(item.name) && item.name !== 'system.manage') {
                toDels.push(item.id);
                // console.log('del', item.name);
            }
        }
        if (toDels.length > 0) await manager.delete(PermissionEntity, toDels);

        // 建立角色到权限的关系

        /** *********** 同步普通角色 *************** */
        // console.log('roles', roles);
        for (const role of roles) {
            // const p = this.roles.find(r => r.name === role.name).permissions
            // // 动态创建的角色不会同步
            // const roleMemory = this.roles.find((r) => r.name === role.name);
            // // 处理权限
            // if (roleMemory) {
            //     // 新配置的权限
            //     const rolePermissions = await manager.findBy(PermissionEntity, {
            //         // 新配置的role的权限
            //         name: In(roleMemory.permissions),
            //     });
            //     const oldPermissions = role.permissions;
            //     await manager
            //         .createQueryBuilder()
            //         .relation(RoleEntity, 'permissions')
            //         .of(role)
            //         .remove(oldPermissions);

            //     await manager
            //         .createQueryBuilder()
            //         .relation(RoleEntity, 'permissions')
            //         .of(role)
            //         .add(rolePermissions);
            // }
            const rolePermissions = await manager.findBy(PermissionEntity, {
                name: In(this.roles.find(({ name }) => name === role.name).permissions),
            });
            await roleRepo
                .createQueryBuilder('role')
                .relation(RoleEntity, 'permissions')
                .of(role)
                .addAndRemove(
                    rolePermissions.map(({ id }) => id),
                    (role.permissions ?? []).map(({ id }) => id),
                );
        }
        /** *********** 同步超级管理员 *************** */
        // 数据库中的超级管理员角色
        // 未同步的系统管理员角色及其权限
        const superRole = await manager.findOneOrFail(RoleEntity, {
            where: {
                name: SystemRoles.ADMIN,
            },
            relations: ['permissions'],
        });
        // 新的，所有的系统权限
        // 前面同步过系统权限
        const systemManage = await manager.findOneOrFail(PermissionEntity, {
            where: {
                name: 'system.manage',
            },
        });
        await roleRepo
            .createQueryBuilder('role')
            .relation(RoleEntity, 'permissions')
            .of(superRole)
            .remove((superRole.permissions ?? []).map(({ id }) => id));

        await roleRepo
            .createQueryBuilder('role')
            .relation(RoleEntity, 'permissions')
            .of(superRole)
            .add([systemManage.id]);

        // 添加超级管理员角色到初始用户
        // 用户与角色未同步过的，superRole.id这个Entity已经同步权限了
        const superUser = await manager.findOne(UserEntity, {
            where: {
                username: superAdmin.username,
            },
            relations: ['roles', 'permissions'],
        });
        console.log('superUser', superUser);
        // console.log("superRole", superRole)

        // 不为空
        if (!isNil(superUser)) {
            const userRepo = manager.getRepository(UserEntity);
            await userRepo
                .createQueryBuilder('user')
                .relation(UserEntity, 'roles')
                .of(superUser)
                .remove((superUser.roles ?? []).map(({ id }) => id));

            await userRepo
                .createQueryBuilder('user')
                .relation(UserEntity, 'roles')
                .of(superUser)
                .add([superRole.id]);
        }
    }
}
