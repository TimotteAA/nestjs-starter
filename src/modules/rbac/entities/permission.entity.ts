import { AbilityTuple, MongoQuery, RawRuleFrom } from '@casl/ability';

import { Exclude, Expose } from 'class-transformer';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';

import { BaseEntity } from '@/modules/database/base';
import { UserEntity } from '@/modules/user/entities';

import { MenuEntity } from './menu.entity';
import { RoleEntity } from './role.entity';

@Exclude()
@Entity('rbac_permission')
export class PermissionEntity<
    A extends AbilityTuple = AbilityTuple,
    C extends MongoQuery = MongoQuery,
> extends BaseEntity {
    @Expose()
    @Column({ comment: '权限名' })
    name!: string;

    @Expose()
    @Column({ comment: '权限别名', nullable: true })
    label?: string;

    @Expose()
    @Column({ comment: '权限描述', type: 'text', nullable: true })
    description?: string;

    @Expose()
    @Column({ comment: '具体的权限规则', type: 'simple-json' })
    rule!: Omit<RawRuleFrom<A, C>, 'conditions'>;

    @Expose({ groups: ['permission-detail', 'permission-list'] })
    @ManyToMany(() => RoleEntity, (role: RoleEntity) => role.permissions)
    @JoinTable()
    roles!: RoleEntity[];

    @ManyToMany(() => UserEntity, (user: UserEntity) => user.permissions, {
        // onDelete: 'NO ACTION',
    })
    @JoinTable()
    users!: UserEntity[];

    @ManyToMany(() => MenuEntity, (menu: MenuEntity) => menu.permissions, {
        // onDelete: 'NO ACTION',
    })
    @JoinTable()
    menus: MenuEntity[];

    @Expose()
    @Column({
        comment: '权限排列字段',
        default: 0,
    })
    customOrder!: number;
}
