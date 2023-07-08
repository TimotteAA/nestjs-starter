import { Exclude, Expose, Type } from 'class-transformer';
import {
    BaseEntity,
    Column,
    DeleteDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { UserEntity } from '@/modules/user/entities';

import { PermissionEntity } from './permission.entity';

@Exclude()
@Entity('rbac_roles')
export class RoleEntity extends BaseEntity {
    @Expose()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Expose()
    @Column({ comment: '角色名' })
    name!: string;

    @Expose()
    @Column({ comment: '角色别名', nullable: true })
    label?: string;

    @Expose()
    @Column({ comment: '角色描述', type: 'text', nullable: true })
    description?: string;

    @Expose()
    @Column({ comment: '是否为系统默认角色：普通用户与超级管理员', default: false })
    systemd?: boolean;

    @Expose({ groups: ['role-detail', 'role-list'] })
    @Type(() => Date)
    @DeleteDateColumn({
        comment: '删除时间',
    })
    deletedAt!: Date;

    @Expose({ groups: ['role-detail'] })
    // 角色创建时，也创建权限
    @ManyToMany(() => PermissionEntity, (p: PermissionEntity) => p.roles, {
        cascade: true,
    })
    permissions!: PermissionEntity[];

    @ManyToMany(() => UserEntity, (user: UserEntity) => user.roles, { onDelete: 'NO ACTION' })
    @JoinTable()
    users!: UserEntity[];
}
