import Email from 'email-templates';
import { Attachment } from 'nodemailer/lib/mailer';

/**
 * SMTP邮件发送配置
 */
export type SmtpOptions<T extends NestedRecord = RecordNever> = {
    host: string;
    user: string;
    password: string;
    // Email模板总路径
    resource: string;
    from?: string;
    port?: number;
    secure?: boolean;
} & T;

/**
 * 公共发送接口配置
 */
export interface SmtpSendParams {
    // 模板名称
    name?: string;
    // 发信地址
    from?: string;
    // 主题
    subject?: string;
    // 目标地址
    to: string | string[];
    // 回信地址
    reply?: string;
    // 是否加载html模板
    html?: boolean;
    // 是否加载text模板
    text?: boolean;
    // 模板变量
    vars?: Record<string, any>;
    // 是否预览
    preview?: boolean | Email.PreviewEmailOpts;
    // 主题前缀
    subjectPrefix?: string;
    // 附件
    attachments?: Attachment[];
}
