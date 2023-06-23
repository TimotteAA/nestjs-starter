import { createConnectionOptions } from '../core/helpers';
import { ConfigureRegister, ConfigureFactory } from '../core/types';

import { RedisConfig } from './types';

/**
 * 创建redis模块配置
 * 自定义时传入原生配置，但是最终加工成RedisConfig类型
 * @param register
 */
export const createRedisConfig: (
    register: ConfigureRegister<RedisConfig>,
) => ConfigureFactory<RedisConfig, RedisConfig> = (register) => ({
    register,
    hook: (configure, value) => createConnectionOptions(value),
    defaultRegister: (configure) => [
        {
            name: 'default',
            connectOptions: {
                port: configure.env('REDIS_PORT', 6379),
                host: configure.env('REDIS_HOST', '127.0.0.1'),
            },
        },
    ],
});
