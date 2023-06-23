import { CustomRepository } from "@/modules/database/decorators";
import { RoleEntity } from "../entities";
import { BaseRepository } from "@/modules/database/crud";

@CustomRepository(RoleEntity)
export class RoleRepository extends BaseRepository<RoleEntity> {
  protected alias = "role";

  buildBaseQuery() {
    return this.createQueryBuilder(this.alias).leftJoinAndSelect(`${this.alias}.permissions`, 'permissions')
  }
}