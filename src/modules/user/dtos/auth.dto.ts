import { Injectable } from '@nestjs/common';
import { ApiProperty, PickType } from '@nestjs/swagger';

import { Length } from 'class-validator';

import { IsPassword } from '@/modules/core/constraints';

import { DtoValidation } from '@/modules/core/decorators';

import { CaptchaDtoGroups, UserValidateGroups } from '../constants';

import { UserCommonDto } from './common.dto';

/**
 * 更改用户密码
 */
export class UpdatePasswordDto extends PickType(UserCommonDto, ['password', 'plainPassword']) {
    @ApiProperty({
        description: '旧密码:用户在更改密码时需要输入的原密码',
        minLength: 8,
        maxLength: 50,
    })
    @IsPassword(5, {
        message: '密码必须由小写字母,大写字母,数字以及特殊字符组成',
        always: true,
    })
    @Length(8, 50, {
        message: '密码长度不得少于$constraint1',
        always: true,
    })
    oldPassword!: string;
}

/**
 * 普通方式注册用户
 */
@DtoValidation({ groups: [UserValidateGroups.REGISTER] })
export class RegisterDto extends PickType(UserCommonDto, [
    'username',
    'nickname',
    'password',
    'plainPassword',
] as const) {}

/**
 * 用户、邮箱、手机+密码登录
 */
@Injectable()
@DtoValidation()
export class CredentialDto extends PickType(UserCommonDto, ['credential', 'password']) {}

/**
 * 手机、验证码登录
 */
@DtoValidation({ groups: [CaptchaDtoGroups.SMS_LOGIN] })
export class PhoneLoginDto extends PickType(UserCommonDto, ['phone', 'code']) {}

/**
 * 邮箱、验证码登录
 */
@DtoValidation({ groups: [CaptchaDtoGroups.EMAIL_LOGIN] })
export class EmailLoginDto extends PickType(UserCommonDto, ['email', 'code']) {}

/**
 * 手机、验证码注册
 */
@DtoValidation({ groups: [CaptchaDtoGroups.SMS_REGISTER] })
export class PhoneRegisterDto extends PickType(UserCommonDto, ['phone', 'code']) {}

/**
 * 邮箱、验证码注册
 */
@DtoValidation({ groups: [CaptchaDtoGroups.EMAIL_REGISTER] })
export class EmailRegisterDto extends PickType(UserCommonDto, ['email', 'code']) {}

/**
 * 手机找回密码
 */
@DtoValidation({ groups: [CaptchaDtoGroups.RETRIEVE_SMS] })
export class PhoneRetrievePasswordDto extends PickType(UserCommonDto, [
    'phone',
    'code',
    'password',
    'plainPassword',
]) {}

/**
 * 邮箱找回密码
 */
@DtoValidation({ groups: [CaptchaDtoGroups.RETRIEVE_EMAIL] })
export class EmailRetrievePasswordDto extends PickType(UserCommonDto, [
    'email',
    'code',
    'password',
    'plainPassword',
]) {}

/**
 * 凭证找回密码
 */
@DtoValidation()
export class CredentialRetrievePasswordDto extends PickType(UserCommonDto, [
    'email',
    'code',
    'password',
    'plainPassword',
]) {}

/**
 * 登录状态下修改密码
 */

/**
 * 登录状态下绑定手机
 */
@DtoValidation({ groups: [CaptchaDtoGroups.BOUND_SMS] })
export class BoundPhoneDto extends PickType(UserCommonDto, ['code', 'phone']) {}

/**
 * 登录状态下绑定邮箱
 */
@DtoValidation({ groups: [CaptchaDtoGroups.BOUND_SMS] })
export class BoundEmailDto extends PickType(UserCommonDto, ['code', 'email']) {}

// /**
//  * 上传文件
//  */
// @DtoValidation({ groups: ['create'] })
// export class UploadAvatarDto extends PickType(UploadFileDto, ['image']) {}
