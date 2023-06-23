import { Entity, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { BaseEntity } from '@/modules/database/base';

import { CaptchaActionType, CaptchaType } from '../constants';

@Entity('user_code')
export class CodeEntity extends BaseEntity {
    @Column()
    code!: string;

    @Column({
        type: 'enum',
        enum: CaptchaActionType,
        default: CaptchaActionType.REGISTER,
        comment: '验证码行为',
    })
    action!: CaptchaActionType;

    @Column({
        type: 'enum',
        enum: CaptchaType,
        default: CaptchaType.SMS,
        comment: '手机验证码或邮箱验证码',
    })
    type!: CaptchaType;

    @Column({ comment: '手机号或邮箱' })
    media!: string;

    /**
     * 初次验证码
     */
    @CreateDateColumn()
    createtAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
