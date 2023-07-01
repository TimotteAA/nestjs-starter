import { ExecutionContext, Injectable } from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { isNil } from 'lodash';
import { ExtractJwt } from 'passport-jwt';

import { JwtAuthGuard } from '@/modules/user/guards';

import { UserRepository } from '@/modules/user/repositories';

import { TokenService } from '@/modules/user/services';

import { RbacResolver } from '../rbac.resolver';

import { getCheckers, solveChecker } from './checker';

@Injectable()
export class RbacGuard extends JwtAuthGuard {
    constructor(
        protected reflector: Reflector,
        protected resolver: RbacResolver,
        protected tokenService: TokenService,
        protected userRepo: UserRepository,
        protected moduleRef: ModuleRef,
    ) {
        super(reflector, tokenService);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // 先校验jwt
        const authCheck = await super.canActivate(context);
        // console.log("cnmgb")
        let request = context.switchToHttp().getRequest();
        const requestToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        // console.log("authCheck", authCheck)
        if (!authCheck) return false;
        // 匿名访问
        if (authCheck && isNil(requestToken)) return true;
        // 从路由context中获得定义的checkers
        // jwt校验通过或者匿名访问
        const checkers = getCheckers(context, this.reflector);
        // 没有checkers
        console.log('checkers', checkers);
        if (isNil(checkers) || checkers.length <= 0) return true;
        // console.log(checkers)
        // 通过jwt校验后会有user
        request = context.switchToHttp().getRequest();
        if (isNil(request.user)) return false;
        const user = await this.userRepo.findOneOrFail({
            where: {
                id: request.user.id,
            },
            relations: ['roles.permissions', 'permissions'],
        });

        // console.log('user', user);
        return solveChecker({
            checkers,
            resolver: this.resolver,
            moduleRef: this.moduleRef,
            user,
            request,
        });
    }
}
