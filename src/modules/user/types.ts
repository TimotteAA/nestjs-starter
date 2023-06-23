import { SendResult } from '../tencent-os/types';

import { CaptchaType, CaptchaActionType } from './constants';
import { CodeEntity } from './entities';

/**
 * 用户模块配置
 */
export interface UserConfig {
    hash: number;
    jwt: JwtConfig;
    captcha: CaptchaConfig;
}

/**
 * JWT配置
 */
export interface JwtConfig {
    secret: string;
    token_expired: number;
    refresh_secret: string;
    refresh_token_expired: number;
}

/**
 * JWT荷载对象类型
 */
export interface JwtPayload {
    sub: string;
    iat: number;
}

/** ********验证码**************** */
export interface CaptchaOption {
    limit: number; // 验证码发送间隔
    age: number; // 验证码有效时间
}

/**
 * 手机验证码选项
 */
export interface SmsCaptchaOption extends CaptchaOption {
    templateId: string; // 云厂商短信推送模板id
}

/**
 * 邮箱验证码选项
 */
export interface EmailCaptchaOption extends CaptchaOption {
    subject: string; // 邮件主题
    template?: string; // 邮件模板路径
}

/**
 * queue的worker的job类型
 */
export interface SendCaptchaQueueJob {
    captcha: { [key in keyof CodeEntity]: CodeEntity[key] };
    option: SmsCaptchaOption | EmailCaptchaOption;
    otherVars?: Record<string, any> & { age: number };
}

export interface CaptchaConfig {
    [CaptchaType.SMS]?: {
        [key in CaptchaActionType]?: Partial<SmsCaptchaOption>;
    };
    [CaptchaType.EMAIL]?: {
        [key in CaptchaActionType]?: Partial<EmailCaptchaOption>;
    };
    age: number;
    limit: number;
}

export type SmsSendWorkResult = {
    jobId: string;
    returnvalue: { type: 'sms' | 'email'; data: SendResult };
};
