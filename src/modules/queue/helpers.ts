import { isNil } from 'lodash';

import { ConfigureRegister, ConfigureFactory } from '../core/types';
import { RedisConfig } from '../redis/types';

import { QueueConfig } from './types';

export const createQueueConfig: (
    register: ConfigureRegister<QueueConfig>,
) => ConfigureFactory<QueueConfig, QueueConfig> = (register) => ({
    register,
    hook: async (configure, value) =>
        createQueueOptions(value, await configure.get<RedisConfig>('redis')),
    defaultRegister: (configure) => [
        {
            redis: configure.env('QUEUE_REDIS_NAME', 'default'),
        },
    ],
});

export const createQueueOptions = async (
    options: QueueConfig,
    redisOptions: RedisConfig,
): Promise<QueueConfig | undefined> => {
    // 所有的redis名称
    const names = redisOptions.map(({ name }) => name);
    // 没有default的redis配置
    if (redisOptions.length <= 0 && !names.includes('default')) return undefined;

    for (const option of options) {
        const redisName = option.redis;
        // 根据队列配置的redis名称，找到redis配置数组中的配置
        const redis = redisOptions.find((r) => r.name === redisName);
        if (!isNil(redis)) {
            option.connection = redis.connectOptions;
        }
    }
    return options;
};
