import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job, Worker } from 'bullmq';
import { omit } from 'lodash';
import { Repository } from 'typeorm';

import { panic } from '@/modules/core/helpers';
import { SmtpService } from '@/modules/smtp/services/smtp.service';
import { SmtpSendParams } from '@/modules/smtp/types';
import { SmsService } from '@/modules/tencent-os/services';

import { SendResult } from '@/modules/tencent-os/types';

import { EMAIL_CAPTCHA_JOB, SEND_CAPTCHA_QUEUE, SMS_CAPTCHA_JOB } from '../constants';
import { CodeEntity } from '../entities';
import { SendCaptchaQueueJob, SmsCaptchaOption, EmailCaptchaOption } from '../types';

@Injectable()
export class CaptchaWorker {
    constructor(
        // @ts-ignore
        @InjectRepository(CodeEntity) private codeRepo: Repository<CodeEntity>,
        private sms: SmsService,
        private smtp: SmtpService,
    ) {}

    async addWorker() {
        return new Worker(
            SEND_CAPTCHA_QUEUE,
            async (job: Job<SendCaptchaQueueJob>) => {
                const res = await this.sendCode(job);
                return res;
            },
            {
                concurrency: 10,
            },
        );
    }

    /**
     * 发送手机或邮箱验证码
     * @param job
     */
    protected async sendCode(job: Job<SendCaptchaQueueJob>) {
        const { captcha } = job.data;
        // console.log("captcha", captcha);
        const result: {
            type: 'sms' | 'email';
            data: null | SendResult;
        } = {
            type: job.name === SMS_CAPTCHA_JOB ? 'sms' : 'email',
            data: null,
        };
        try {
            if (job.name === EMAIL_CAPTCHA_JOB || job.name === SMS_CAPTCHA_JOB) {
                if (job.name === SMS_CAPTCHA_JOB) {
                    result.data = await this.sendSms(job.data);
                    // console.log(res);
                    // if (!result.ok) throw new BadRequestException(CodeEntity, result.message);
                } else if (job.name === EMAIL_CAPTCHA_JOB) {
                    result.data = await this.sendEmail(job.data);
                }
                // console.log(captcha);
                // 修改验证码的code
                await this.codeRepo.save(omit(captcha, ['createtAt', 'updatetAt']));
            }
            return result;
        } catch (err: any) {
            panic({ error: err, message: '发送验证码失败' });
            throw new Error(err as any);
        }
    }

    /**
     * 利用腾讯云sdk发送短信
     * @param data
     */
    protected async sendSms(data: SendCaptchaQueueJob) {
        const { captcha, option, otherVars } = data;
        const { code, media } = captcha;
        const { templateId } = option as SmsCaptchaOption;
        // console.log(data);
        const result = await this.sms.send({
            PhoneNumberSet: [media.replace('.', '')],
            TemplateId: templateId,
            TemplateParamSet: this.generateParamSet(code, otherVars),
            // 会被覆盖，随便填即可
            SmsSdkAppId: '1',
        });
        return result;
    }

    /**
     * 发送邮件
     * @param data
     */
    protected async sendEmail(data: SendCaptchaQueueJob) {
        const {
            captcha: { action, media, code },
            option,
        } = data;
        const { template, subject } = option as EmailCaptchaOption;
        // name是模板名
        // subject是邮件名
        // to是发送到的对象
        // vars是验证码
        return this.smtp.send<SmtpSendParams & { template?: string }>({
            name: action,
            subject,
            template,
            html: !template,
            to: [media],
            vars: { code },
        });
    }

    protected generateParamSet(
        code: string,
        otherVars: Record<string, any> & { age: number },
    ): string[] {
        const { age } = otherVars;
        return [code, `${age}`];
    }
}
