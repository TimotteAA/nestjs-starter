import { AbilityTuple, MongoQuery, RawRuleFrom } from '@casl/ability';

import { Exclude, Expose, Type } from 'class-transformer';
import { Column, Entity, JoinTable, ManyToMany, Tree, TreeChildren, TreeParent } from 'typeorm';

import { BaseEntity } from '@/modules/database/base';
import { UserEntity } from '@/modules/user/entities';

import { MenuType } from '../constants';

import { RoleEntity } from './role.entity';

@Exclude()
@Tree('materialized-path')
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
    @Column({ comment: '具体的权限规则', type: 'simple-json', nullable: true })
    rule?: Omit<RawRuleFrom<A, C>, 'conditions'>;

    @Expose({ groups: ['permission-detail', 'permission-list'] })
    @ManyToMany(() => RoleEntity, (role: RoleEntity) => role.permissions)
    @JoinTable()
    roles!: RoleEntity[];

    @ManyToMany(() => UserEntity, (user: UserEntity) => user.permissions)
    @JoinTable()
    users!: UserEntity[];

    @Expose()
    @Column({
        comment: '权限排列字段',
        default: 0,
    })
    customOrder!: number;

    @Expose()
    @Type(() => PermissionEntity)
    @TreeParent()
    parent: PermissionEntity | null;

    @Expose()
    @Type(() => PermissionEntity)
    @TreeChildren()
    children: PermissionEntity[];

    /** ******************************************menu字段***************************************************** */
    @Column({
        comment: '菜单类型，0是目录，1是菜单项，2是权限',
        enum: MenuType,
        default: MenuType.DIRECTORY,
        type: 'enum',
    })
    type!: MenuType;

    @Column({
        comment: '菜单链接',
        nullable: true,
    })
    path?: string;

    @Column({
        comment: '菜单展示的icon',
        nullable: true,
    })
    icon?: string;

    @Column({
        comment: '路由对应前端组件',
        nullable: true,
    })
    component?: string;

    @Column({ comment: '是否是外链', default: false })
    external?: boolean;

    @Column({
        comment: '是否缓存',
        default: true,
    })
    keepAlive?: boolean;

    @Column({
        comment: '是否显示',
        default: true,
    })
    show?: boolean;
}
