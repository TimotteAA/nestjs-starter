import { ModuleRef } from "@nestjs/core";
import { AbilityTuple, MongoQuery, RawRuleFrom, MongoAbility } from "@casl/ability";
import { FastifyRequest as Request } from "fastify";
import { UserEntity } from "../user/entities";

import { CrudMethodOption, CrudMethod, CrudOptions } from "@/modules/restful/types";
import { RoleEntity, PermissionEntity } from "./entities";

/**
 * 角色类型：角色名、别名、描述、权限
 */
export type Role = Pick<ClassToPlain<RoleEntity>, "name" | "label" | "description"> & {
  permissions: string[]
}

/**
 * 权限类型：名称、别名、描述、具体的rule，去掉了casl中的conditions，自定义了conditions
 */
export type PermissionType<A extends AbilityTuple, C extends MongoQuery> = Pick<
  ClassToPlain<PermissionEntity<A, C>>,
  'name'
> & Partial<Pick<ClassToPlain<PermissionEntity<A, C>>, "label" | "description" | "customOrder">> & {
  rule: Omit<RawRuleFrom<A, C>, 'conditions'> & {
    conditions?: (user: ClassToPlain<UserEntity>) => Record<string, any>;
  } 
}

/**
 * 权限校验器类
 */
interface PermissionCheckerClass {
  handle(ability: MongoAbility, ref: ModuleRef, request?: Request): Promise<boolean>;
}

/**
 * 权限校验函数
 */
type PermissionCheckerCallback = (
  ability: MongoAbility,
  ref: ModuleRef,
  request?: Request,
) => Promise<boolean>;

/**
 * 类或函数校验器
 */
export type PermissionChecker = PermissionCheckerClass | PermissionCheckerCallback;

export type RbacCrudOption = CrudMethodOption & { rbac?: PermissionChecker[] }
export interface RbacCrudItem {
  name: CrudMethod;
  options?: RbacCrudOption;
}
/**
 * rbac装饰器
 */
export type RbacCrudOptions = Omit<CrudOptions, "enabled"> & {
  enabled: Array<CrudMethod | RbacCrudItem>
}