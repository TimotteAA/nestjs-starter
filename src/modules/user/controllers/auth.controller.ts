import {
    Body,
    Controller,
    Patch,
    Post,
    Request,
    SerializeOptions,
    UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Depends } from '@/modules/restful/decorators';

import { CaptchaType } from '../constants';
import { Guest, ReqUser } from '../decorators';
import {
    BoundEmailDto,
    BoundPhoneDto,
    CredentialDto,
    EmailLoginDto,
    EmailRegisterDto,
    EmailRetrievePasswordDto,
    PhoneLoginDto,
    PhoneRegisterDto,
    PhoneRetrievePasswordDto,
    RegisterDto,
    UpdatePasswordDto,
} from '../dtos';
import { UserEntity } from '../entities';
import { LocalAuthGuard } from '../guards';
import { AuthService } from '../services';
import { UserModule } from '../user.module';

/**
 * 账户中心控制器
 */

@ApiTags('账户操作')
@Depends(UserModule)
@Controller('auth')
export class AuthController {
    constructor(protected readonly authService: AuthService) {}

    @Post('login')
    @ApiOperation({ summary: '用户通过凭证(可以是用户名,邮箱,手机号等)+密码登录' })
    @Guest()
    @UseGuards(LocalAuthGuard)
    async login(@ReqUser() user: ClassToPlain<UserEntity>, @Body() _data: CredentialDto) {
        return { token: await this.authService.createToken(user.id) };
    }

    /**
     * 注销登录
     * @param req
     */
    @Post('logout')
    @ApiOperation({ summary: '用户登出账户' })
    @ApiBearerAuth()
    async logout(@Request() req: any) {
        return this.authService.logout(req);
    }

    /**
     * 使用用户名密码注册
     * @param data
     */
    @Post('register')
    @ApiOperation({ summary: '通过用户名+密码注册账户' })
    @Guest()
    async register(
        @Body()
        data: RegisterDto,
    ) {
        return this.authService.register(data);
    }

    /**
     * 更改密码
     * @param user
     * @param data
     */
    @Patch('reset-passowrd')
    @ApiOperation({ summary: '重置密码' })
    @SerializeOptions({
        groups: ['user-detail'],
    })
    async resetPassword(
        @ReqUser() user: ClassToPlain<UserEntity>,
        @Body() data: UpdatePasswordDto,
    ): Promise<UserEntity> {
        return this.authService.updatePassword(user, data);
    }

    @Post('register-sms')
    @ApiOperation({
        summary: '手机注册',
    })
    @Guest()
    async registerSms(@Body() data: PhoneRegisterDto) {
        return this.authService.registerSms(data);
    }

    /**
     * 手机验证码登录
     * @param data
     */
    @Post('login-sms')
    @ApiOperation({
        summary: '手机验证码登录',
    })
    @Guest()
    async loginSms(@Body() data: PhoneLoginDto) {
        return this.authService.loginSms(data);
    }

    /**
     * 手机验证码重设密码
     * 其实就是更新密码...
     * @param */
    @Patch('retrieve-password-sms')
    @ApiOperation({
        summary: '手机重设密码',
    })
    @Guest()
    async retrievePasswordSms(@Body() data: PhoneRetrievePasswordDto) {
        const { password, code, phone } = data;
        return this.authService.retrievePassword(password, code, phone, CaptchaType.SMS);
    }

    /** ******** **********************email操作***************************** */
    /**
     * 邮箱注册
     * @param data
     */
    @Post('register-email')
    @ApiOperation({
        summary: '邮箱注册',
    })
    @Guest()
    async registerEmail(@Body() data: EmailRegisterDto) {
        return this.authService.registerEmail(data);
    }

    /**
     * 邮箱验证码登录
     */
    @Post('login-email')
    @ApiOperation({
        summary: '邮箱登录',
    })
    @Guest()
    async loginEmail(@Body() data: EmailLoginDto) {
        return this.authService.loginEmail(data);
    }

    /**
     * 邮箱验证码重设密码
     * 其实就是更新密码...
     * @param */
    @Patch('retrieve-password-email')
    @ApiOperation({
        summary: '邮箱重设密码',
    })
    @Guest()
    async retrievePasswordEmail(@Body() data: EmailRetrievePasswordDto) {
        const { password, code, email } = data;
        return this.authService.retrievePassword(password, code, email, CaptchaType.EMAIL);
    }

    /**
     * 登录状态下绑定手机
     * @param user
     * @param data
     */
    @Patch('bound-phone')
    @ApiOperation({
        summary: '绑定手机',
    })
    @ApiBearerAuth()
    async boundPhone(@ReqUser() user: ClassToPlain<UserEntity>, @Body() data: BoundPhoneDto) {
        return this.authService.bound(user, data, CaptchaType.SMS);
    }

    /**
     * 登录状态下绑定邮箱
     * @param user
     * @param data
     */
    @Patch('bound-email')
    @ApiOperation({
        summary: '绑定邮箱',
    })
    @ApiBearerAuth()
    async boundEmail(@ReqUser() user: ClassToPlain<UserEntity>, @Body() data: BoundEmailDto) {
        return this.authService.bound(user, data, CaptchaType.EMAIL);
    }
}
