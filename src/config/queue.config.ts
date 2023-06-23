import { createQueueConfig } from '../modules/queue/helpers';

/**
 * queue基于默认的redis配置
 */
export const queue = createQueueConfig((configure) => [
    {
        redis: 'default',
    },
]);
