/**
 * 用户列表查询排序方式
 */
export enum UserOrderType {
    CREATED = 'createdAt',
    UPDATED = 'updatedAt',
}

/**
 * 用户请求DTO验证组
 */
export enum UserValidateGroups {
    CREATE = 'user-create',
    UPDATE = 'user-update',
    REGISTER = 'user-register',
}

/** ************** 验证码 ****************** */
/**
 * 验证码行为
 */
export enum CaptchaActionType {
    // 登录
    LOGIN = 'login',
    // 注册
    REGISTER = 'register',
    // 找回密码
    RETRIEVE_PASSWORD = 'retrieve_password',
    // 重置密码
    RESET_PASSWORD = 'reset_password',
    // 绑定手机或邮箱
    BOUND = 'bound',
}

/**
 * 验证码类型：手机还是邮箱
 */
export enum CaptchaType {
    SMS = 'sms',
    EMAIL = 'email',
}

/**
 * 所有的验证码操作
 */
export enum CaptchaDtoGroups {
    // 手机登录
    SMS_LOGIN = 'sms_login',
    // 邮箱登录
    EMAIL_LOGIN = 'email_login',
    // 手机注册
    SMS_REGISTER = 'sms_register',
    // 邮箱注册
    EMAIL_REGISTER = 'email_register',
    // 绑定手机
    BOUND_SMS = 'bound_sms',
    // 绑定邮箱
    BOUND_EMAIL = 'bound_email',
    // 手机找回密码
    RETRIEVE_SMS = 'retrieve_sms',
    // 邮箱找回密码
    RETRIEVE_EMAIL = 'retrieve_email',
    // 手机重置密码
    RESET_SMS = 'reset_sms',
    // 邮箱重置密码
    RESET_EMAIL = 'reset_email',
}

/** *****************queue****** */
/**
 * 发送验证码异步列队名称
 */
export const SEND_CAPTCHA_QUEUE = 'send-captcha-queue';

/**
 * 发送短信验证码任务处理名称
 */
export const SMS_CAPTCHA_JOB = 'sms-captcha-job';

/**
 * 发送邮件验证码任务处理名称
 */
export const EMAIL_CAPTCHA_JOB = 'mail-captcha-job';

/**
 * websocket相关内容
 */
export const SAVE_MESSAGE_QUEUE = 'save-message-queue';
