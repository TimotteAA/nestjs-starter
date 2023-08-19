import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { isNil, omit } from 'lodash';

import { In } from 'typeorm';

import { BaseService } from '@/modules/database/base';

import { ReceiverActionType } from '../constants';
import { QueryMessageDto, UpdateReceivesDto } from '../dtos/message.dto';
import { MessageEntity, MessageReceiver } from '../entities';
import { MessageReceiveRepository, MessageRepository } from '../repositorys';

@Injectable()
export class MessageService extends BaseService<MessageEntity, MessageRepository> {
    constructor(
        protected messageRepo: MessageRepository,
        protected receiveRepo: MessageReceiveRepository,
    ) {
        super(messageRepo);
    }

    /**
     * 删除已发送的消息
     *
     * @param id
     * @param userId
     */
    async deleteSended(id: string, userId: string) {
        const message = await this.messageRepo.findOne({
            where: {
                id,
                sender: {
                    id: userId,
                },
            },
        });
        if (isNil(message)) throw new BadRequestException(MessageEntity, '消息不存在');
        await this.repository.remove(message);
        return message;
    }

    /**
     * 发送者批量删除收到的消息
     *
     * @param data
     */
    async deleteSendeds(data: UpdateReceivesDto, userId: string, options?: QueryMessageDto) {
        const messages = await this.messageRepo.find({
            where: {
                id: In(data.receives),
                sender: {
                    id: userId,
                },
            },
        });
        await this.repository.remove(messages);
        // 删完后支持分页
        return this.paginate({ ...options });
    }

    async updateReceive(id: string, type: ReceiverActionType, userId: string) {
        const receives = await this.updateReceives([id], type, userId);
        console.log('receives ', receives);
        if (receives.length < 0) {
            throw new NotFoundException(MessageEntity, '消息不存在');
        }

        // 非最优解， readed还是一个对象
        return this.repository
            .buildBaseQB()
            .leftJoinAndSelect(`${this.repository.qbName}.sender`, 'sender')
            .leftJoinAndMapOne(
                'message.readed',
                MessageReceiver,
                'receives',
                'message.id = receives.messageId',
            )
            .select(['message', 'receives.readed', 'sender'])
            .andWhere('message.id = :id', { id })
            .getOne();
    }

    /**
     * 批量更改接收数据
     * 删除消息接收者与消息的关联(即接收者删除该消息)/更改已读状态
     * @param data 消息ID列表
     * @param type 操作类型
     * @param userId 当前用户ID
     * @param params 列表查询参数
     */
    async updateReceviesList(
        data: UpdateReceivesDto,
        type: ReceiverActionType,
        userId: string,
        params: QueryMessageDto,
    ) {
        await this.updateReceives(data.receives, type, userId);
        return this.list(omit(params, ['page', 'limit']) as any);
    }

    /**
     * 批量更改接收数据,返回分页后的消息列表
     * 返回分页后的消息列表，删除消息接收者与消息的关联(即接收者删除该消息)/更改已读状态
     * @param data 消息ID列表
     * @param type 操作类型
     * @param userId 当前用户ID
     * @param options 分页查询参数
     */
    async updateReceviesPaginate(
        data: UpdateReceivesDto,
        type: ReceiverActionType,
        userId: string,
        options: QueryMessageDto,
    ) {
        await this.updateReceives(data.receives, type, userId);
        return this.paginate({ ...options, receiver: userId } as any);
    }

    /**
     * 批量修改message的状态
     *
     * @param data
     * @param type
     * @param userId
     */
    protected async updateReceives(data: string[], type: ReceiverActionType, userId: string) {
        // 中间表
        const receives = await this.receiveRepo.find({
            where: {
                message: {
                    id: In(data),
                },
                receiver: {
                    id: userId,
                },
            },
            relations: ['message', 'receiver'],
        });
        for (const receive of receives) {
            if (type === ReceiverActionType.READED && !receive.readed) {
                receive.readed = true;
                await receive.save({ reload: true });
            }
            if (type === ReceiverActionType.DELETE) {
                await this.receiveRepo.remove(receive);
            }
        }
        return receives;
    }
}
