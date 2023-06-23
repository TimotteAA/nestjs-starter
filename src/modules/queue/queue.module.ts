// @ts-ignore
import { BullModule } from '@nestjs/bullmq';
import { omit } from 'lodash';

import { ModuleBuilder } from '../core/decorators';

import { QueueConfig } from './types';

@ModuleBuilder(async (configure) => {
    const queues = await configure.get<QueueConfig>('queue');

    return {
        global: true,
        imports: queues.map((queue) => BullModule.forRoot(queue.redis, omit(queue, ['redis']))),
    };
})
export class QueueModule {}
