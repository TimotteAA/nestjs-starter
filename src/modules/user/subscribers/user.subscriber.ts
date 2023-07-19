import { randomBytes } from 'crypto';

import { EventSubscriber, In, InsertEvent, UpdateEvent } from 'typeorm';

import { BaseSubscriber } from '@/modules/database/base';

import { PermissionEntity, RoleEntity } from '@/modules/rbac/entities';

import { UserEntity } from '../entities/user.entity';
import { encrypt } from '../helpers';

/**
 * 用户模型监听器
 */
@EventSubscriber()
export class UserSubscriber extends BaseSubscriber<UserEntity> {
    protected entity = UserEntity;

    /**
     * 生成不重复的随机用户名
     * @param event
     */
    protected async generateUserName(event: InsertEvent<UserEntity>): Promise<string> {
        const username = `user_${randomBytes(4).toString('hex').slice(0, 8)}`;
        const user = await event.manager.findOne(UserEntity, {
            where: { username },
        });
        return !user ? username : this.generateUserName(event);
    }

    /**
     * 自动生成唯一用户名和密码
     * @param event
     */
    async beforeInsert(event: InsertEvent<UserEntity>) {
        // 自动生成唯一用户名
        if (!event.entity.username) {
            event.entity.username = await this.generateUserName(event);
        }
        // 自动生成密码
        if (!event.entity.password) {
            event.entity.password = randomBytes(11).toString('hex').slice(0, 22);
        }
        // 自动加密密码
        event.entity.password = await encrypt(event.entity.password);
    }

    /**
     * 当密码更改时加密密码
     * @param event
     */
    async beforeUpdate(event: UpdateEvent<UserEntity>) {
        if (this.isUpdated('password', event)) {
            event.entity.password = encrypt(event.entity.password);
        }
    }

    async afterLoad(entity: UserEntity): Promise<void> {
        // console.log(entity);
        // user的权限通过角色查询而出，因此权限可能会有重复
        // let permissions = (entity.permissions ?? []) as PermissionEntity[];
        let permissions: PermissionEntity[] = [];
        const roles = await RoleEntity.find({
            where: {
                users: {
                    id: In([entity.id]),
                },
            },
            relations: ['permissions'],
        });

        for (const role of roles) {
            const rolePermissions = await PermissionEntity.find({
                where: {
                    roles: {
                        id: role.id,
                    },
                },
            });
            if (Array.isArray(rolePermissions) && rolePermissions.length) {
                permissions.push(...rolePermissions);
            }
        }
        permissions = permissions.reduce<PermissionEntity[]>((o, n) => {
            if (o.map((item) => item.name).includes(n.name)) {
                return o;
            }
            return [...o, n];
        }, []);
        // console.log('permissions', permissions);
        entity.permissions = permissions;
    }
}
