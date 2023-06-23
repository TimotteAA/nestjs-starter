import { ExecutionContext } from "@nestjs/common";
import { ModuleRef, Reflector } from "@nestjs/core";
import { FastifyRequest as Request } from "fastify";

import { RbacResolver } from "../rbac.resolver";
import { PermissionChecker } from "../types";
import { PERMISSION_CHECKERS } from "../constants";
import { UserEntity } from "@/modules/user/entities";
import { PermissionEntity } from "../entities";
import { createMongoAbility, MongoAbility } from "@casl/ability";
import { isNil } from "lodash";


type CheckerParams = {
  resolver: RbacResolver;
  checkers: PermissionChecker[];
  moduleRef: ModuleRef;
  user: ClassToPlain<UserEntity>;
  request?: any;
}

export const getCheckers = (context: ExecutionContext, reflector: Reflector) => {
    // console.log("class", context.getClass());
    // console.log("name", context.getHandler().name)
    const crudCheckers = Reflect.getMetadata(
        PERMISSION_CHECKERS,
        context.getClass().prototype,
        context.getHandler().name,
        // "list"
    ) as PermissionChecker[];
    const defaultCheckers = reflector.getAllAndOverride<PermissionChecker[]>(PERMISSION_CHECKERS, [
        context.getHandler(),
        context.getClass(),
    ]);
    // console.log(crudCheckers, defaultCheckers)
    return crudCheckers ?? defaultCheckers;
}

/**
 * 从resolver中根据权限创建校验器，并进行校验
 * @param param0 
 */
export const solveChecker = async ({
  checkers,
  moduleRef,
  resolver,
  user,
  request
}: CheckerParams) => {
  let permissions = user.permissions as PermissionEntity[];
  for (const role of user.roles) {
    permissions = [...permissions, ...role.permissions];
  }
  // 权限去重
  permissions = permissions.reduce<PermissionEntity[]>((o, n) => {
    if (o.find(item => item.name === n.name)) return o;
    return [...o, n];
  }, []);
  // console.log("permissions", permissions);
  // 创建ability
  const ability = createMongoAbility(
    permissions.map(permission => {
      const { rule, name } = permission;
      // 根据权限名称找到内存中的rule.conditions
      const resolve = resolver.permissions.find(p => p.name === name);
      if (!isNil(resolve) && !isNil(resolve.rule.conditions)) {
        return { ...rule, conditions: resolve.rule.conditions(user) }
      };
      return rule;
    })
  );
  // console.log("permissions", permissions);
  // console.log(ability);.
  const results = await Promise.all(
    checkers.map(async (checker) => execChecker(checker, ability, moduleRef, request))
  );
  // 是否都通过
  return results.every(r => !!r);
}

const execChecker = (
  checker: PermissionChecker,
  ability: MongoAbility,
  moduleRef: ModuleRef,
  request?: Request
) => {
  if (typeof checker === "function") return checker(ability, moduleRef, request);
  return checker.handle(ability, moduleRef, request);
}