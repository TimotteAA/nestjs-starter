import { toNumber } from 'lodash';

import { ConfigureRegister, ConfigureFactory } from '../core/types';

import { SmsSdkOptions, CosStsOptions } from './types';

/**
 * 腾讯云sms模块配置
 * @param register
 */
export const createSmsConfig: (
    register: ConfigureRegister<Partial<SmsSdkOptions>>,
) => ConfigureFactory<Partial<SmsSdkOptions>, SmsSdkOptions> = (register) => ({
    register,
    defaultRegister: (configure) => ({
        secretId: configure.env('SMS_SECRET_ID'),
        secretKey: configure.env('SMS_SECRET_KEY'),
        region: configure.env('SMS_REGION'),
        endpoint: configure.env('SMS_ENDPOINT', 'sms.tencentcloudapi.com'),
        sign: configure.env('SMS_SIGN'),
        appid: configure.env('SMS_APP_ID'),
    }),
});

export const createCosConfig: (
    register: ConfigureRegister<Partial<CosStsOptions>>,
) => ConfigureFactory<Partial<CosStsOptions>, CosStsOptions> = (register) => ({
    register,
    defaultRegister: (configure) => {
        const cosUrl = `qcs::cos:${configure.env('COS_REGION')}:uid/${configure.env(
            'COS_APP_ID',
        )}:${configure.env('COS_BUCKET')}/${configure.env('COS_ALLOW_PREFIX')}`;
        return {
            credential: {
                secretId: configure.env('COS_SECRET_ID'),
                secretKey: configure.env('COS_SECRET_KEY'),
                policy: {
                    version: '2.0',
                    statement: [
                        {
                            action: [
                                // 简单上传
                                'name/cos:PutObject',
                                'name/cos:PostObject',
                                // 分片上传
                                'name/cos:InitiateMultipartUpload',
                                'name/cos:ListMultipartUploads',
                                'name/cos:ListParts',
                                'name/cos:UploadPart',
                                'name/cos:CompleteMultipartUpload',
                                'name/cos:AbortMultipartUpload',
                            ],
                            effect: 'allow',
                            resource: [cosUrl],
                        },
                        // 访问存储桶
                        {
                            action: ['name/cos:GetObject'],
                            effect: 'allow',
                            resource: [cosUrl],
                        },
                        // 删除资源
                        {
                            action: ['name/cos:DeleteObject'],
                            effect: 'allow',
                            resource: [cosUrl],
                        },
                    ],
                },
                durationSeconds: configure.env('SECRET_DURATION', (v) => toNumber(v), 1888),
            },
            region: configure.env('COS_REGION'),
            bucket: configure.env('COS_BUCKET'),
            // bucket文件路径
            avatarPrefix: configure.env('COS_AVATAR_PREFIX'),
            bannerPrefix: configure.env('COS_BANNER_PREFIX'),
            postPrefix: configure.env('COS_POST_PREFIX'),
        };
    },
});
