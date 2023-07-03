import { AbilityOptions, AbilityTuple, MongoQuery, SubjectType } from '@casl/ability';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { isNil, omit } from 'lodash';
import { DataSource, EntityManager, Not, In } from 'typeorm';

import { deepMerge } from '@/modules/core/helpers';

import { Configure } from '../core/configure';
import { UserEntity } from '../user/entities';
import { getUserConfig } from '../user/helpers';
import { UserConfig } from '../user/types';

import { PermissionAction, SystemRoles } from './constants';
import { MenuEntity, PermissionEntity, RoleEntity } from './entities';
import { Menu, PermissionType, Role } from './types';

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
            name: 'system.manage',
            label: '系统管理',
            description: '管理整个系统',
            // casl中的两个关键词
            rule: {
                action: PermissionAction.MANAGE,
                subject: 'all',
            } as any,
            customOrder: 0,
        },
        {
            name: 'system.permission.manage',
            label: '系统-权限管理',
            description: '系统模块-权限管理',
            rule: {
                action: PermissionAction.MANAGE,
                subject: PermissionEntity.name,
            } as any,
            customOrder: 1,
        },
        {
            name: 'system.role.manage',
            label: '系统-角色管理',
            description: '系统模块-角色管理',
            rule: {
                action: PermissionAction.MANAGE,
                subject: RoleEntity.name,
            } as any,
            customOrder: 1,
        },
        {
            name: 'system.menu.manage',
            label: '系统-菜单管理',
            description: '系统模块-菜单管理',
            rule: {
                action: PermissionAction.MANAGE,
                subject: MenuEntity.name,
            },
            customOrder: 1,
        },
    ];

    protected _menus: Menu[] = [
        {
            name: 'system.manage',
            label: '系统管理',
            systemed: true,
            router: '/system',
            customOrder: 0,
            permissions: ['system.manage'],
        },
        {
            name: 'system.permission.manage',
            label: '权限管理',
            systemed: true,
            router: '/permission',
            customOrder: 1,
            permissions: ['system.permission.manage'],
            parent: 'system.manage',
        },
        {
            name: 'system.role.manage',
            label: '角色管理',
            systemed: true,
            router: '/role',
            customOrder: 1,
            permissions: ['system.role.manage'],
            parent: 'system.manage',
        },
        {
            name: 'system.menu.manage',
            label: '菜单管理',
            systemed: true,
            router: '/menu',
            customOrder: 1,
            permissions: ['system.menu.manage'],
            parent: 'system.manage',
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

    get menus() {
        return this._menus;
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
            let subject: typeof item.rule.subject;
            // 确保Subject是字符串或字符串数组
            if (Array.isArray(item.rule.subject))
                subject = item.rule.subject.map((s) => getSubject(s));
            else subject = getSubject(item.rule.subject);

            const rule = { ...item.rule, subject };
            return { ...item, rule };
        });
    }

    addMenus(data: Menu[]) {
        this._menus = [...this._menus, ...data];
    }

    async onApplicationBootstrap() {
        // console.log(
        //     'app start ->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',
        // );
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
            await this.syncMenus(queryRunner.manager);
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
        });
        // console.log("systemRoles", systemRoles);
        const toDels: string[] = [];
        for (const role of systemRoles) {
            if (!this.roles.find((item) => item.name === role.name)) {
                toDels.push(role.id);
            }
        }
        // console.log('toDels role', toDels);
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
            const permission = { ...item, rule: omit(item.rule, 'conditions') };
            // console.log("4", permission)
            const old = await manager.findOne(PermissionEntity, {
                where: {
                    name: permission.name,
                },
            });
            if (isNil(old)) {
                await manager.save(manager.create(PermissionEntity, omit(permission, ['menu'])));
            } else {
                await manager.update(PermissionEntity, old.id, omit(permission, ['menu']));
            }
        }

        // console.log("所有的权限", await manager.find(PermissionEntity))

        // 删除冗余权限
        // 去除硬编码的代码中不存在的角色，不可删除系统管理权限
        const toDels: string[] = [];
        for (const item of permissions) {
            if (!names.includes(item.name) && item.name !== 'system.manage') {
                toDels.push(item.id);
                console.log('del', item.name);
            }
        }
        if (toDels.length > 0) await manager.delete(PermissionEntity, toDels);

        // 建立角色到权限的关系

        /** *********** 同步普通角色 *************** */
        for (const role of roles) {
            // const p = this.roles.find(r => r.name === role.name).permissions
            // 动态创建的角色不会同步
            const roleMemory = this.roles.find((r) => r.name === role.name);

            if (roleMemory) {
                // 新配置的权限
                const rolePermissions = await manager.findBy(PermissionEntity, {
                    // 新配置的role的权限
                    name: In(roleMemory.permissions),
                });
                // 删除老的权限，增加新配置的
                await roleRepo
                    .createQueryBuilder('role')
                    .relation(RoleEntity, 'permissions')
                    .of(role)
                    .addAndRemove(
                        rolePermissions.map((p) => p.id),
                        // 同步权限前的角色权限
                        role.permissions ? role.permissions.map((p) => p.id) : [],
                    );
            }
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
            .addAndRemove(
                [systemManage.id],
                (superRole.permissions ?? []).map(({ id }) => id),
            );

        // 添加超级管理员角色到初始用户
        // 用户与角色未同步过的，superRole.id这个Entity已经同步权限了
        const superUser = await manager.findOne(UserEntity, {
            where: {
                username: superAdmin.username,
            },
            relations: ['roles', 'permissions'],
        });
        // console.log("superUser", superUser)
        // console.log("superRole", superRole)

        // 不为空
        if (!isNil(superUser)) {
            const userRepo = manager.getRepository(UserEntity);
            await userRepo
                .createQueryBuilder('user')
                .relation(UserEntity, 'roles')
                .of(superUser)
                .addAndRemove(
                    [superRole.id],
                    (superUser.roles ?? []).map(({ id }) => id),
                );
        }
    }

    protected async syncMenus(manager: EntityManager) {
        this._menus = this._menus.reduce<Menu[]>((o, n) => {
            if (o.map(({ name }) => name).includes(n.name)) {
                // 相同名称的menu，将两者进行合并
                return o.map((e) => (e.name === n.name ? deepMerge(e, n, 'merge') : e));
            }
            return [...o, n];
        }, []);

        for (const item of this.menus) {
            let menu = await manager.findOne(MenuEntity, {
                where: {
                    name: item.name,
                },
            });
            if (isNil(menu)) {
                // 原来没有menu
                menu = manager.create(MenuEntity, {
                    name: item.name,
                    label: item.label,
                    router: item.router,
                    customOrder: item.customOrder,
                    parent: isNil(item.parent)
                        ? null
                        : await manager.findOne(MenuEntity, {
                              where: {
                                  name: item.parent,
                              },
                          }),
                    permissions: !isNil(item.permissions)
                        ? await manager.find(PermissionEntity, {
                              where: {
                                  name: In(item.permissions),
                              },
                          })
                        : null,
                    systemd: true,
                });

                await manager.save(menu, {
                    reload: true,
                });
            } else {
                await manager.update(MenuEntity, menu.id, {
                    name: item.name,
                    label: item.label,
                    router: item.router,
                    customOrder: item.customOrder,
                    parent: isNil(item.parent)
                        ? null
                        : await manager.findOne(MenuEntity, {
                              where: {
                                  name: item.parent,
                              },
                          }),
                    systemd: true,
                });
                menu = await manager.findOne(MenuEntity, {
                    where: {
                        id: menu.id,
                    },
                });
                const permissions = await manager.find(PermissionEntity, {
                    where: {
                        name: In(item.permissions),
                    },
                });
                // 处理permissions：删了老的，加入新的
                await manager
                    .createQueryBuilder(MenuEntity, 'menu')
                    .relation(PermissionEntity, 'permissions')
                    .of(menu)
                    .addAndRemove(permissions ?? [], menu.permissions);
            }
        }

        const systemMenus = await manager.find(MenuEntity, {
            where: {
                systemd: true,
            },
        });
        const toDels: string[] = [];
        for (const menu of systemMenus) {
            if (!this.menus.find((m) => menu.name === m.name)) {
                toDels.push(menu.id);
            }
        }
        if (toDels.length) await manager.delete(MenuEntity, toDels);
    }
}
