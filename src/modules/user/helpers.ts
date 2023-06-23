import bcrypt from 'bcrypt';
import { isNil, toNumber } from 'lodash';

import { App } from '../core/app';

import { Configure } from '../core/configure';

import { ConfigureFactory, ConfigureRegister } from '../core/types';

import { UserConfig } from './types';
/**
 * 加密明文密码
 * @param password
 */
export const encrypt = async (password: string) => {
    // const hash = (await getUserConfig<UserConfig>()).hash || 10;
    // console.log(password, hash);
    const hash = (await getUserConfig<number>('hash')) ?? 10;

    return bcrypt.hashSync(`${password}`, hash);
};

/**
 * 验证密码
 * @param password
 * @param hashed
 */
export const decrypt = async (password: string, hashed: string) => {
    return bcrypt.compareSync(`${password}`, hashed);
};

/**
 * 生成随机验证码
 */
export function generateCatpchaCode() {
    return Math.random().toFixed(6).slice(-6);
}

/**
 * 用户配置创建函数
 * @param register
 */
export const createUserConfig: (
    register: ConfigureRegister<RePartial<UserConfig>>,
) => ConfigureFactory<UserConfig> = (register) => ({
    register,
    defaultRegister: defaultUserConfig,
});

/**
 * 默认用户配置
 */
export const defaultUserConfig = (configure: Configure): UserConfig => {
    const captchaTimeConfig = {
        age: configure.env('CAPTCHA_AGE', 5 * 60),
        // limit: configure.env('CAPTCHA_LIMIT', 3 * 60),
        limit: 3,
    };

    return {
        hash: 10,
        jwt: {
            secret: configure.env('USER_TOKEN_SECRET', 'my-refresh-secret'),
            token_expired: configure.env('USER_TOKEN_EXPIRED', (v) => toNumber(v), 3600),
            refresh_secret: configure.env('USER_REFRESH_TOKEN_SECRET', 'my-refresh-secret'),
            refresh_token_expired: configure.env(
                'USER_REFRESH_TOKEN_EXPIRED',
                (v) => toNumber(v),
                3600 * 30,
            ),
        },
        captcha: {
            sms: {
                login: {
                    templateId: configure.env('SMS_LOGIN_CAPTCHA_QCLOUD'),
                    ...captchaTimeConfig,
                },
                register: {
                    templateId: configure.env('SMS_REGISTER_CAPTCHA_QCLOUD'),
                    ...captchaTimeConfig,
                },
                retrieve_password: {
                    templateId: configure.env('SMS_RETRIEVEPASSWORD_CAPTCHA_QCLOUD'),
                    ...captchaTimeConfig,
                },
                bound: {
                    templateId: configure.env('SMS_BOUND_CAPTCHA_QCLOUD'),
                    ...captchaTimeConfig,
                },
                reset_password: {
                    templateId: configure.env('SMS_RETRIEVEPASSWORD_CAPTCHA_QCLOUD'),
                    ...captchaTimeConfig,
                },
            },
            email: {
                login: {
                    subject: configure.env('EMAIL_LOGIN'),
                    ...captchaTimeConfig,
                },
                register: {
                    subject: configure.env('EMAIL_REGISTER'),
                    ...captchaTimeConfig,
                },
                retrieve_password: {
                    subject: configure.env('EMAIL_RETRIEVEPASSWORD'),
                    ...captchaTimeConfig,
                },
                bound: {
                    subject: configure.env('EMAIL_BOUND'),
                    ...captchaTimeConfig,
                },
                reset_password: {
                    subject: configure.env('EMAIL_RESET'),
                    ...captchaTimeConfig,
                },
            },
            age: captchaTimeConfig.age,
            limit: captchaTimeConfig.limit,
        },
    };
};

/**
 * 获取user模块配置的值
 * @param key
 */
export async function getUserConfig<T>(key?: string): Promise<T> {
    return App.configure.get<T>(isNil(key) ? 'user' : `user.${key}`);
}
