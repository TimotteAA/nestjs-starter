import { Injectable, ExecutionContext} from "@nestjs/common";
import { ModuleRef, Reflector } from "@nestjs/core";

import { JwtWsGuard } from "@/modules/user/guards";
import { RbacResolver } from "../rbac.resolver";
import { UserRepository } from "@/modules/user/repositorys";
import { TokenService } from "@/modules/user/services";
import { isNil } from "lodash";
import { getCheckers, solveChecker } from "./checker";
import { UserEntity } from "@/modules/user/entities";

@Injectable()
export class RbacWsGuard extends JwtWsGuard {
  constructor(   
    protected reflector: Reflector,
    protected resolver: RbacResolver,
    protected tokenService: TokenService,
    protected userRepo: UserRepository,
    protected moduleRef: ModuleRef) {
    super(tokenService)
  }

  async canActivate(context: ExecutionContext) {
    // 先进行jwt校验
    const result = await super.canActivate(context);
    if (!result) return false;
    const { token } = context.switchToWs().getData() ?? {};
    const accessToken = await this.tokenService.findAccessToken(token);
    const tokenUser = (await this.tokenService.verifyAccessToken(accessToken.value)) as ClassToPlain<UserEntity>;
    // 权限校验器
    const checkers = getCheckers(context, this.reflector);
    // console.log(checkers)
    if (isNil(checkers) || checkers.length <= 0) return true;
    const user = await this.userRepo.findOneOrFail({
      where: {
        id: tokenUser.id
      },
      relations: ['roles.permissions', 'permissions']
    });
    return solveChecker({
      checkers,
      user,
      moduleRef: this.moduleRef,
      resolver: this.resolver,
    })
  }
}