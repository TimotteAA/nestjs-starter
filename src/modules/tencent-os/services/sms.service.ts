import { Injectable } from '@nestjs/common';
import * as tencentcloud from 'tencentcloud-sdk-nodejs';
import { SendSmsRequest } from 'tencentcloud-sdk-nodejs/tencentcloud/services/sms/v20210111/sms_models';

import { deepMerge } from '@/modules/core/helpers';

import { SendResult, SmsSdkOptions } from '../types';

const SmsClient = tencentcloud.sms.v20210111.Client;

// type SendParams = Omit<Partial<SendSmsRequest>, "SmsSdkAppId" | "SignName">

@Injectable()
export class SmsService {
    constructor(protected options: SmsSdkOptions) {}

    /**
     * 创建发信客户端
     */
    protected makeClient(options: SmsSdkOptions) {
        const { secretId, secretKey, region, endpoint } = options;
        // console.log("region", region)
        return new SmsClient({
            credential: {
                secretId,
                secretKey,
            },
            region,
            profile: {
                httpProfile: {
                    endpoint,
                },
            },
        });
    }

    /**
     * 发送短信
     * @param params
     * @param options
     */
    async send(params: SendSmsRequest, options?: SmsSdkOptions): Promise<SendResult> {
        // console.log('params', params);

        const settings = deepMerge(this.options, options ?? {}) as SmsSdkOptions;
        // console.log("settings", settings);
        const client = this.makeClient(settings);
        // console.log({...params, SmsSdkAppId: settings.appid, SignName: settings.sign})
        const res = await client.SendSms({
            ...params,
            SmsSdkAppId: settings.appid,
            SignName: settings.sign,
        });
        console.log('sms res', res);
        // 超时处理
        if (res.SendStatusSet[0].Code.includes('LimitExceeded')) {
            // console.log('1234');
            return {
                ok: false,
                message: `手机号：${params.PhoneNumberSet[0]}已达发送频率上限，请一小时后再尝试`,
                // res: null,
            };
        }
        // console.log('res', res);
        return {
            ok: true,
            // res,
            message: '发送成功',
        };
    }
}
