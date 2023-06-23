import path from 'node:path';

import { Injectable } from '@nestjs/common';
import Email from 'email-templates';
import { pick } from 'lodash';
import mailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SMTPConnection from 'nodemailer/lib/smtp-connection';

import { deepMerge } from '@/modules/core/helpers';

import { SmtpOptions, SmtpSendParams } from '../types';

@Injectable()
export class SmtpService {
    constructor(private options: SmtpOptions) {}

    protected makeClient(options: SmtpOptions) {
        const { host, secure, user, password, port } = options;
        const clientOptions: SMTPConnection.Options = {
            host,
            port: port ?? 25,
            secure: secure ?? false,
            auth: {
                user,
                pass: password,
            },
        };
        return mailer.createTransport(clientOptions);
    }

    /**
     * 合并配置并发送邮件
     * @param params
     * @param options
     */
    async send<T>(params: SmtpSendParams & T, options?: SmtpOptions) {
        const newOptions = deepMerge(this.options, options ?? {}) as SmtpOptions;
        const client = this.makeClient(newOptions);
        return this.makeSend(client, params, newOptions);
    }

    /**
     * 转义通用发送参数为NodeMailer发送参数
     * @param client
     * @param params
     * @param options
     */
    protected async makeSend(client: Mail, params: SmtpSendParams, options: SmtpOptions) {
        const tplPath = path.resolve(options.resource, params.name ?? 'custom');
        const textOnly = !params.html && params.text;
        const noHtmlToText = params.html && params.text;
        const configd: Email.EmailConfig = {
            preview: params.preview ?? false,
            send: !params.preview,
            message: { from: params.from ?? options.from ?? options.user },
            transport: client,
            subjectPrefix: params.subjectPrefix,
            textOnly,
            juiceResources: {
                preserveImportant: true,
                webResources: {
                    relativeTo: tplPath,
                },
            },
        };
        if (noHtmlToText) configd.htmlToText = false;
        const email = new Email(configd);
        const message = {
            ...pick(params, ['from', 'to', 'reply', 'attachments', 'subject']),
        };
        await email.send({
            template: tplPath,
            message,
            locals: params.vars,
        });

        return {
            ok: true,
            message: '发送成功',
        };
    }
}
