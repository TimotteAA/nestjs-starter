import { PickType } from '@nestjs/swagger';

import { DtoValidation } from '@/modules/core/decorators';

import { CaptchaDtoGroups } from '../constants';

import { UserCommonDto } from './common.dto';

/**
 * 手机或邮箱验证码dto
 */
export class CaptchaDto extends PickType(UserCommonDto, ['phone', 'email']) {}

/**
 * 手机发送验证码dto
 */
export class PhoneCaptchaDto extends PickType(CaptchaDto, ['phone']) {}

/**
 * 邮箱发送验证码dto
 */
export class EmailCaptchaDto extends PickType(CaptchaDto, ['email']) {}

/**
 * 通过已登录账户发送验证码消息
 */
export class UserCaptchaMessageDto extends PickType(UserCommonDto, ['type']) {}

/**
 * 通过用户凭证发送验证码消息
 */
export class CredentialCaptchaMessageDto extends PickType(UserCommonDto, ['credential']) {}

/**
 * 发送登录验证码短信
 */
@DtoValidation({ groups: [CaptchaDtoGroups.SMS_LOGIN] })
export class LoginPhoneCaptchaDto extends PhoneCaptchaDto {}

/**
 * 发送登录验证码邮件
 */
@DtoValidation({ groups: [CaptchaDtoGroups.EMAIL_LOGIN] })
export class LoginEmailCaptchaDto extends EmailCaptchaDto {}

/**
 * 发送注册验证码短信
 */
@DtoValidation({ groups: [CaptchaDtoGroups.SMS_REGISTER] })
export class RegisterPhoneCaptchaDto extends PhoneCaptchaDto {}

/**
 * 发送注册验证码邮件
 */
@DtoValidation({ groups: [CaptchaDtoGroups.EMAIL_REGISTER] })
export class RegisterEmailCaptchaDto extends EmailCaptchaDto {}

/**
 * 发送找回密码短信
 */
@DtoValidation({ groups: [CaptchaDtoGroups.RETRIEVE_SMS] })
export class RetrievePasswordPhoneCaptchaDto extends PhoneCaptchaDto {}

/**
 * 发送找回密码邮件
 */
@DtoValidation({ groups: [CaptchaDtoGroups.RETRIEVE_EMAIL] })
export class RetrievePasswordEmailCaptchaDto extends EmailCaptchaDto {}

/**
 * 发送手机绑定短信
 */
@DtoValidation({ groups: [CaptchaDtoGroups.BOUND_SMS] })
export class BoundPhoneCaptchaDto extends PhoneCaptchaDto {}

/**
 * 发送邮箱绑定邮件
 */
@DtoValidation({ groups: [CaptchaDtoGroups.BOUND_EMAIL] })
export class BoundEmailCaptchaDto extends EmailCaptchaDto {}
