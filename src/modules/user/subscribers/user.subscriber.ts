import { randomBytes } from 'crypto';

import { EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';

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
        // user的权限通过角色查询而出，因此权限可能会有重复
        let permissions = (entity.permissions ?? []) as PermissionEntity[];
        // 查询角色所有的权限
        if (entity.roles && entity.roles.length > 0) {
            for (const role of entity.roles) {
                const roleEntity = await RoleEntity.findOneOrFail({
                    where: {
                        id: role.id,
                    },
                    relations: ['permissions'],
                });
                permissions = [...permissions, ...(roleEntity.permissions ?? [])];
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
