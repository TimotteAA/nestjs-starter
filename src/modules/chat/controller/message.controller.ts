import { Controller, Get, Param } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';

import { Depends } from '@/modules/restful/decorators';

import { Guest } from '@/modules/user/decorators';
import { UserRepository } from '@/modules/user/repositories';

import { ChatModule } from '../chat.module';
import { ReceiverActionType } from '../constants';
import { MessageEntity, MessageReceiver } from '../entities';
import { MessageReceiveRepository } from '../repositorys';
import { MessageService } from '../services';

let id = 0;

@ApiTags('消息路由')
@Depends(ChatModule)
@Controller('chat')
export class MessageController {
    constructor(
        protected userRepository: UserRepository,
        protected receiveRepository: MessageReceiveRepository,
        protected messageService: MessageService,
    ) {}

    @Guest()
    @Get()
    async test() {
        // timotte给小李发消息
        const message = new MessageEntity();
        message.body = `测试消息啦${id}`;
        id++;
        message.sender = await this.userRepository.findOneByOrFail({
            id: '41bf1e60-b24b-41eb-972d-402b168b6584',
        });
        message.title = 'aaa';
        message.type = 'asdad';
        // 先保存一下
        await message.save({ reload: true });
        // 接收者
        const receivers = ['be347bb6-6823-4fc5-9257-1ebe5950e1a1'];
        // 创建中间表实例
        const receives = await Promise.all(
            receivers.map(async (receiver) => {
                // 接收者id
                const messageReceive = new MessageReceiver();
                messageReceive.message = message;
                messageReceive.receiver = await this.userRepository.findOneByOrFail({
                    id: receiver,
                });
                await messageReceive.save();
                return messageReceive;
            }),
        );
        await this.receiveRepository.save(receives);
        message.receives = receives;
        await message.save({ reload: true });
    }

    @Guest()
    @Get('/:id')
    async update(@Param() id: any) {
        const res = await this.messageService.updateReceive(
            id.id,
            ReceiverActionType.READED,
            'be347bb6-6823-4fc5-9257-1ebe5950e1a1',
        );
        return res;
    }
}
