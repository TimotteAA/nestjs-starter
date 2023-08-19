import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany } from 'typeorm';

import { BaseEntity } from '@/modules/database/base';
import { UserEntity } from '@/modules/user/entities';

import { MessageReceiver } from './message-receiver.entity';

@Entity('chat_messages')
export class MessageEntity extends BaseEntity {
    @Column({ comment: '消息标题，用于后台管理系统', nullable: true, default: '' })
    title?: string;

    @Column({ comment: '消息类型，与title一起使用', nullable: true, default: '' })
    type?: string;

    @Column({ comment: '消息内容', nullable: false })
    body!: string;

    @CreateDateColumn()
    createdAt!: Date;

    /**
     * 消息发送者
     */
    @ManyToOne(() => UserEntity, (user) => user.messages, { cascade: true })
    sender!: UserEntity;

    @OneToMany(() => MessageReceiver, (mr) => mr.message, {
        cascade: true,
    })
    receives!: MessageReceiver[];

    // 是否已读的虚拟字段
    readed: boolean;
}
