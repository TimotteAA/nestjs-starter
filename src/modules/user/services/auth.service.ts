import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FastifyRequest as Request } from 'fastify';
import { isNil } from 'lodash';
import { ExtractJwt } from 'passport-jwt';

import { App } from '@/modules/core/app';
import { EnvironmentType } from '@/modules/core/constants';
import { getTime } from '@/modules/core/helpers';

import { CaptchaType } from '../constants';
import { PhoneLoginDto, PhoneRegisterDto, RegisterDto, UpdatePasswordDto } from '../dtos';
import { CodeEntity } from '../entities';
import { UserEntity } from '../entities/user.entity';
import { decrypt, getUserConfig } from '../helpers';

import { CodeRepository, UserRepository } from '../repositories';
import { UserConfig } from '../types';

import { TokenService } from './token.service';

import { UserService } from './user.service';

/**
 * 账户与认证服务
 */
@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly tokenService: TokenService,
        protected readonly userRepository: UserRepository,
        private readonly codeRepo: CodeRepository,
    ) {}

    /**
     * localStrategy的用户名验证
     * @param credential
     * @param password
     */
    async validateUser(credential: string, password: string) {
        const user = await this.userService.findOneByCredential(credential, async (query) =>
            query.addSelect('user.password'),
        );
        if (user && decrypt(password, user.password)) {
            return user;
        }
        return false;
    }

    /**
     * 登录用户,并生成新的token和refreshToken
     * @param user
     */
    async login(user: UserEntity) {
        const now = await getTime();
        const { accessToken } = await this.tokenService.generateAccessToken(user, now);
        return accessToken.value;
    }

    /**
     * 注销登录
     * @param req
     */
    async logout(req: Request) {
        const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req as any);
        if (accessToken) {
            await this.tokenService.removeAccessToken(accessToken);
        }

        return {
            msg: 'logout_success',
        };
    }

    /**
     * 根据用户id创建一对新的token
     * @param id
     */
    async createToken(id: string) {
        const now = await getTime();
        let user: UserEntity;
        try {
            user = await this.userService.detail(id);
        } catch (error) {
            throw new ForbiddenException();
        }
        const { accessToken } = await this.tokenService.generateAccessToken(user, now);
        return accessToken.value;
    }

    /**
     * 使用用户名密码注册用户
     * @param data
     */
    async register(data: RegisterDto) {
        const { username, nickname, password } = data;
        const user = await this.userService.create({
            username,
            nickname,
            password,
            actived: true,
        } as any);
        return this.userService.findOneByCondition({ id: user.id });
    }

    /**
     * 手机验证码注册
     * @param data
     */
    async registerSms(data: PhoneRegisterDto) {
        const { code, phone } = data;
        const isValid = await this.checkIsCaptchaValid(code, CaptchaType.SMS, phone);
        if (!isValid) throw new BadRequestException('验证码已过期');
        // 创建user
        const user = new UserEntity();
        user.phone = phone;
        user.actived = true;
        // 保存user
        await user.save();
        return this.userService.findOneByCondition({ id: user.id });
    }

    /**
     * 手机登录
     * @param data
     */
    async loginSms(data: PhoneLoginDto) {
        const { code, phone } = data;
        const isValid = await this.checkIsCaptchaValid(code, CaptchaType.SMS, phone);
        if (!isValid) throw new BadRequestException('验证码已过期');
        // 查询用户的condition
        const condition = { phone };
        const user = await this.userService.findOneByCondition(condition);
        const { accessToken } = await this.tokenService.generateAccessToken(user, await getTime());
        return { token: accessToken.value };
    }

    /**
    // 手机或者邮箱找回
     * 找回密码
     */
    async retrievePassword(password: string, code: string, media: string, type: CaptchaType) {
        const isValid = await this.checkIsCaptchaValid(code, type, media);
        if (!isValid) throw new BadRequestException('验证码已过期');
        // 查询用户
        const key = type === CaptchaType.EMAIL ? 'email' : 'phone';
        // 根据手机或邮箱查询user
        const condition = { [key]: media };
        // console.log(condition);
        const user = await this.userService.findOneByCondition(condition);
        if (isNil(user))
            throw new UnauthorizedException(
                UserEntity,
                `user with ${key} of ${media} does not exist`,
            );

        // 更新用户的密码
        user.password = password;
        await user.save();
        return this.userService.findOneByCondition({ id: user.id });
    }

    /**
     * 更新用户密码
     * @param user
     * @param param1
     */
    async updatePassword(user: UserEntity, { password, oldPassword }: UpdatePasswordDto) {
        const item = await this.userRepository.findOneOrFail({
            select: ['password'],
            where: { id: user.id },
        });
        if (decrypt(item.password, oldPassword))
            throw new ForbiddenException('old password not matched');
        item.password = password;
        await this.userRepository.save(item);
        return this.userService.findOneByCondition({ id: item.id });
    }

    protected async checkIsCaptchaValid(code: string, type: CaptchaType, media: string) {
        const condition = { code, type, media };
        // console.log(condition);
        console.log(code, media);
        const captcha = await this.codeRepo.findOne({ where: condition });
        if (isNil(captcha)) throw new BadRequestException(CodeEntity, '验证码不正确');
        // console.log(getTime({date: captcha.updatedAt}).add(timeObj.limit, "second"))
        // console.log(getTime());

        const age = await getUserConfig<number>('captcha.age');
        console.log(age);
        const isValid = (await getTime({ date: captcha.updatedAt }))
            .add(age, 'second')
            .isAfter(await getTime());
        return isValid;
    }

    /**
     * 导入Jwt模块
     */
    static jwtModuleFactory() {
        return JwtModule.registerAsync({
            useFactory: async () => {
                const config = await getUserConfig<UserConfig>();
                return {
                    secret: config.jwt.secret,
                    ignoreExpiration: App.configure.getRunEnv() === EnvironmentType.DEVELOPMENT,
                    signOptions: { expiresIn: `${config.jwt.token_expired}s` },
                };
            },
        });
    }
}
