import { AbilityTuple, MongoQuery, RawRuleFrom } from '@casl/ability';

import { Exclude, Expose } from 'class-transformer';
import { BaseEntity, Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { UserEntity } from '@/modules/user/entities';

import { RoleEntity } from './role.entity';

@Exclude()
@Entity('rbac_permission')
export class PermissionEntity<
    A extends AbilityTuple = AbilityTuple,
    C extends MongoQuery = MongoQuery,
> extends BaseEntity {
    @Expose()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

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

    @ManyToMany(() => UserEntity, (user: UserEntity) => user.permissions)
    @JoinTable()
    users!: UserEntity[];

    @Expose()
    @Column({
        comment: '权限排列字段',
        default: 0,
    })
    customOrder!: number;
}
