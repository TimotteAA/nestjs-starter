import { BullModule } from '@nestjs/bullmq';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { Configure } from '../core/configure';

import { EnvironmentType } from '../core/constants';

import { ModuleBuilder } from '../core/decorators';
import { DatabaseModule } from '../database/database.module';
import { addEntities, addSubscribers } from '../database/helpers';

import { SEND_CAPTCHA_QUEUE } from './constants';
import * as entities from './entities';
import * as guards from './guards';
import { getUserConfig } from './helpers';
import * as queues from './queue';
import * as repositories from './repositories';
import { UserRepository } from './repositories';
import * as services from './services';
import { JwtStrategy, LocalStrategy } from './strategies';
import * as subscribers from './subscribers';
import { UserConfig } from './types';

const jwtModuleRegister = (configure: Configure) => async (): Promise<JwtModuleOptions> => {
    const config = await configure.get<UserConfig>('user');
    const isProd = configure.getRunEnv() === EnvironmentType.PRODUCTION;
    const option: JwtModuleOptions = {
        secret: config.jwt.secret,
        verifyOptions: {
            ignoreExpiration: !isProd,
        },
    };
    if (isProd) option.signOptions.expiresIn = `${config.jwt.token_expired}s`;
    return option;
};

@ModuleBuilder(async (configure) => ({
    imports: [
        PassportModule,
        JwtModule.registerAsync({
            useFactory: jwtModuleRegister(configure),
        }),
        BullModule.registerQueue({ name: SEND_CAPTCHA_QUEUE }),
        // BullModule.registerQueue({name: SAVE_MESSAGE_QUEUE}),
        await addEntities(configure, Object.values(entities)),
        DatabaseModule.forRepository(Object.values(repositories)),
    ],
    providers: [
        ...Object.values(services),
        ...(await addSubscribers(configure, Object.values(subscribers))),
        ...Object.values(guards),
        ...Object.values(queues),
        LocalStrategy,
        {
            provide: JwtStrategy,
            async useFactory(userRepo: UserRepository) {
                const secret = await getUserConfig<string>('jwt.secret');
                // console.log('secret', secret);
                const jwtStrategy = new JwtStrategy(userRepo, secret);
                return jwtStrategy;
            },
            inject: [UserRepository],
        },
    ],
    exports: [
        ...Object.values(services),
        DatabaseModule.forRepository(Object.values(repositories)),
        ...Object.values(queues),
    ],
}))
export class UserModule {}
