/**
 * 用户模块配置
 */
import { createUserConfig } from '@/modules/user/helpers';

export const user = createUserConfig((configure) => ({
    hash: 10,
    jwt: {
        secret: '我是密钥',
        refresh_secret: '我是refresh token的密钥',
        refresh_token_expired: 3600000,
        token_expired: 36000,
    },
}));
