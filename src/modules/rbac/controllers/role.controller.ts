import { Controller } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { Crud, Depends } from "@/modules/restful/decorators";
import { BaseController } from "@/modules/restful/controller";
import { PermissionAction } from "../constants";
import { RoleEntity } from "../entities";
import { RoleService } from "../services";
import { CreateRoleDto, UpdateRoleDto, QueryRoleDto } from "../dtos";
import { PermissionChecker } from "../types";
import { simpleCrudOptions } from "../helpers";
import { RbacModule } from "../rbac.module";

// 文章的后台管理权限
const permissions: PermissionChecker[] = [
  async ab => ab.can(PermissionAction.MANAGE, RoleEntity.name)
]

@ApiTags("角色管理")
@ApiBearerAuth()
@Depends(RbacModule)
@Crud(async () => ({
  id: "role",
  enabled: [
    { name: "create", options: simpleCrudOptions(permissions, "创建角色") },
    { name: "list", options: simpleCrudOptions(permissions, "分页查询角色") },
    { name: "update", options: simpleCrudOptions(permissions, "更新指定角色") },
    { name: "delete", options: simpleCrudOptions(permissions, "删除角色，支持批量删除") },
    { name: "detail", options: simpleCrudOptions(permissions, "查看角色详情") },
    { name: "restore", options: simpleCrudOptions(permissions, "恢复软删除角色，支持批量恢复") }
  ],
  dtos: {
    query: QueryRoleDto,
    create: CreateRoleDto,
    update: UpdateRoleDto
  }
}))
@Controller("roles")
export class RoleController extends BaseController<RoleService> {
  constructor(
    protected roleService: RoleService
  ) {
    super(roleService)
  }
}