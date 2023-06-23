import { CustomRepository } from "@/modules/database/decorators";
import { PermissionEntity } from "../entities";
import { BaseRepository } from "@/modules/database/crud";

@CustomRepository(PermissionEntity)
export class PermissionRepository extends BaseRepository<PermissionEntity> {
    protected alias = "permission";

    buildBaseQuery() {
        return this.createQueryBuilder(this.alias)
            .leftJoinAndSelect(`${this.alias}.roles`, 'roles')
            .orderBy(`${this.alias}.customOrder`, 'ASC')
    }
}