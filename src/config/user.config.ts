/**
 * 用户模块配置
 */
import { createUserConfig } from '@/modules/user/helpers';

export const user = createUserConfig((configure) => ({
    jwt: {
        secret: '111',
        token_expired: 100000,
        refresh_secret: 'asdasd',
        refresh_token_expired: 22222222,
    },
    super: {
        username: 'timotte',
        password: '123456aA!',
    },
}));
