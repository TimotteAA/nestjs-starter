import { Exclude, Expose, Type } from 'class-transformer';
import { Column, Entity, JoinTable, ManyToMany, Tree, TreeChildren, TreeParent } from 'typeorm';

import { BaseEntity } from '@/modules/database/base';

import { UserEntity } from '@/modules/user/entities';

import { MenuType } from '../constants';

@Exclude()
@Tree('materialized-path')
@Entity('rbac_menus')
export class MenuEntity extends BaseEntity {
    @Expose()
    @Column({ comment: 'menu名称' })
    name!: string;

    @Column({ comment: 'menu显示标签', nullable: true })
    label?: string;

    @Column({
        comment: '菜单类型，0是目录，1是菜单项，2是权限',
        enum: MenuType,
        default: MenuType.DIRECTORY,
        type: 'enum',
    })
    type!: MenuType;

    @Column({
        comment: '菜单展示的icon',
    })
    icon?: string;

    @Column({
        comment: '路由对应前端组件',
    })
    component?: string;

    @Column({
        comment: '菜单链接',
        nullable: false,
    })
    router!: string;

    @Column({ comment: '是否是外链', default: false })
    isLink?: boolean;

    @Column({
        comment: '是否缓存',
        default: true,
    })
    keepAlive?: boolean;

    @Column({
        comment: '是否显示',
    })
    isShow?: boolean;

    @Column({
        comment: '菜单排序字段',
        default: 0,
    })
    customOrder: number;

    // 关联关系
    @Expose({ groups: ['menu-detail', 'menu-list'] })
    @Type(() => MenuEntity)
    @TreeParent({ onDelete: 'NO ACTION' })
    parent: MenuEntity | null;

    @Expose({ groups: ['menu-tree'] })
    @Type(() => MenuEntity)
    @TreeChildren({ cascade: true })
    children: MenuEntity[];

    @ManyToMany(() => UserEntity, (user: UserEntity) => user.menus, {
        onDelete: 'NO ACTION',
    })
    @JoinTable()
    users: UserEntity[];
}
