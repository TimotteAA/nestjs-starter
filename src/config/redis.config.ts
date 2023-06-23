import { createRedisConfig } from '../modules/redis/helpers';

export const redis = createRedisConfig((configure) => [
    {
        name: 'default',
        connectOptions: {
            port: configure.env('REDIS_PORT', 6379),
            host: configure.env('REDIS_HOST', '127.0.0.1'),
        },
    },
]);
