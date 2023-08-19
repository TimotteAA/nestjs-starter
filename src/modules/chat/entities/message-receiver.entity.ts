import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseEntity } from '@/modules/database/base';

import { UserEntity } from '@/modules/user/entities';

import { MessageEntity } from './message.entity';

@Entity('chat_message_reveiver')
export class MessageReceiver extends BaseEntity {
    @ManyToOne(() => MessageEntity, (m) => m.receives)
    message!: MessageEntity;

    @ManyToOne(() => UserEntity, (user) => user.messages)
    receiver!: UserEntity;

    @Column({ comment: '消息是否已读', default: false })
    readed: boolean;
}
