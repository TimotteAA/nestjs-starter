import { toNumber } from 'lodash';

import { ContentFactory } from '@/database/factories/content.factory';
import ContentSeeder from '@/database/seeders/content.seeder';
import { createDbConfig } from '@/modules/database/helpers';

/**
 * 数据库配置函数
 */
export const database = createDbConfig((configure) => ({
    connections: [
        {
            type: 'mysql',
            host: configure.env('DB_HOST'),
            port: configure.env('DB_PORT', (v) => toNumber(v)),
            username: configure.env('DB_USER', 'root'),
            password: configure.env('DB_PASSWORD', 'root'),
            database: configure.env('DB_NAME', 'gpt'),
            seeders: [ContentSeeder],
            factories: [ContentFactory],
        },
    ],
}));
