import { RedisOptions as IoRedisOptions } from 'ioredis';

/**
 * 单一redis连接配置
 */
export type RedisOption = {
    // redis连接名称
    name: string;
    // 具体的连接配置
    connectOptions?: IoRedisOptions;
};

/**
 * redis模块配置，可以连接多个redis，用name区分
 */
export type RedisConfig = RedisOption[];
