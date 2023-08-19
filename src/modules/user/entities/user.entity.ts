import { Exclude, Expose, Type } from 'class-transformer';

import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    UpdateDateColumn,
} from 'typeorm';

import { MessageEntity, MessageReceiver } from '@/modules/chat/entities';
import { BaseEntity } from '@/modules/database/base';

import { AddRelations } from '@/modules/database/decorators';
import { DynamicRelation } from '@/modules/database/types';

import { MediaEntity } from '@/modules/media/entities';
import { PermissionEntity, RoleEntity } from '@/modules/rbac/entities';

import { getUserConfig } from '../helpers';

import { AccessTokenEntity } from './access-token.entity';

const relations = () => getUserConfig<DynamicRelation[]>('relations');

/**
 * 用户模型
 */
@AddRelations(relations)
@Exclude()
@Entity('users')
export class UserEntity extends BaseEntity {
    [key: string]: any;

    @Expose()
    @Column({
        comment: '姓名',
        nullable: true,
    })
    nickname?: string;

    @Expose()
    @Column({ comment: '用户名', unique: true })
    username!: string;

    @Column({ comment: '密码', length: 500, select: false })
    password!: string;

    @Expose()
    @Column({ comment: '手机号', nullable: true, unique: true })
    phone?: string;

    @Expose()
    @Column({ comment: '邮箱', nullable: true, unique: true })
    email?: string;

    @Expose()
    @Type(() => Date)
    @CreateDateColumn({
        comment: '用户创建时间',
    })
    createdAt!: Date;

    @Expose()
    @Type(() => Date)
    @UpdateDateColumn({
        comment: '用户更新时间',
    })
    updatedAt!: Date;

    @OneToMany(() => AccessTokenEntity, (accessToken) => accessToken.user, {
        cascade: true,
    })
    accessTokens!: AccessTokenEntity[];

    @Expose()
    @Type(() => Date)
    @DeleteDateColumn({
        comment: '删除时间',
    })
    deletedAt!: Date;

    @Column({ comment: '用户是否激活', default: true })
    actived?: boolean;

    @Column({ comment: '是否是超级管理员用户', default: false })
    isCreator?: boolean;

    @Expose({ groups: ['user-detail'] })
    @Type(() => PermissionEntity)
    @ManyToMany(() => PermissionEntity, (p) => p.users, {
        cascade: true,
    })
    @JoinTable()
    permissions!: PermissionEntity[];

    @Expose({ groups: ['user-detail'] })
    @ManyToMany(() => RoleEntity, (role: RoleEntity) => role.users, {
        cascade: true,
    })
    @JoinTable()
    roles!: RoleEntity[];

    /**
     * 用户上传的文件
     */
    @OneToMany(() => MediaEntity, (media) => media.user, { onDelete: 'CASCADE' })
    medias: MediaEntity[];

    @OneToMany(() => MessageEntity, (message) => message.sender, { onDelete: 'CASCADE' })
    messages: MessageEntity[];

    @OneToMany(() => MessageReceiver, (mr) => mr.receiver)
    receives!: MessageReceiver[];
}
