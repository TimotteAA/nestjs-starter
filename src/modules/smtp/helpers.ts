import path from 'path';

import { ConfigureRegister, ConfigureFactory } from '../core/types';

import { SmtpOptions } from './types';

export const createSmtpConfig: (
    register: ConfigureRegister<Partial<SmtpOptions>>,
) => ConfigureFactory<Partial<SmtpOptions>, SmtpOptions> = (register) => ({
    register,
    defaultRegister: (configure) => ({
        host: configure.env('SMTP_HOST'),
        user: configure.env('SMTP_USER'),
        password: configure.env('SMTP_PASSWORD'),
        from: configure.env('SMTP_FROM'),
        port: configure.env('SMTP_PORT', (v) => Number(v), 25),
        secure: configure.env('SMTP_SSL', (v) => JSON.parse(v), false),
        // Email模板路径
        resource: path.resolve(__dirname, '../../assets/emails'),
    }),
});
