import { toNumber } from 'lodash';

import { ContentFactory } from '@/database/factories/content.factory';
import { UserFactory } from '@/database/factories/user.factory';
import ContentSeeder from '@/database/seeders/content.seeder';
import UserSeeder from '@/database/seeders/user.seeder';
import { createDbConfig } from '@/modules/database/helpers';

/**
 * 数据库配置函数
 */
export const database = createDbConfig((configure) => ({
    connections: [
        {
            type: 'mysql',
            host: configure.env('DB_HOST', '127.0.0.1'),
            port: configure.env('DB_PORT', (v) => toNumber(v)),
            username: configure.env('DB_USER'),
            password: configure.env('DB_AUTH'),
            database: configure.env('DB_DATABASE'),
            seeders: [UserSeeder, ContentSeeder],
            factories: [UserFactory, ContentFactory],
            timezone: '+8.00', // 上海时区，默认为UTC
        },
    ],
}));
