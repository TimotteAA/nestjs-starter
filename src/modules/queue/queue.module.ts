// @ts-ignore
import { BullModule } from '@nestjs/bullmq';

import Redis from 'ioredis';

import { ModuleBuilder } from '../core/decorators';

import { RedisConfig } from '../redis/types';

import { QueueConfig } from './types';

@ModuleBuilder(async (configure) => {
    const queues = await configure.get<QueueConfig>('queue');
    const redisOptions = await configure.get<RedisConfig>('redis');

    return {
        global: true,
        imports: queues.map((queue) => {
            const redisOption = redisOptions.find((o) => o.name === queue.redis).connectOptions;
            return BullModule.forRoot({ connection: new Redis(queue.connection && redisOption) });
        }),
    };
})
export class QueueModule {}
