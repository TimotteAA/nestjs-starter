import { BaseTreeRepository } from '@/modules/database/base';
import { CustomRepository } from '@/modules/database/decorators';

import { PermissionEntity } from '../entities';

@CustomRepository(PermissionEntity)
export class PermissionRepository extends BaseTreeRepository<PermissionEntity> {
    protected _qbName = 'permission';

    buildBaseQuery() {
        return (
            this.createQueryBuilder(this.qbName)
                // .leftJoinAndSelect(`${this.qbName}.roles`, 'roles')
                .leftJoinAndSelect(`${this.qbName}.children`, 'children')
                .orderBy(`${this.qbName}.customOrder`, 'ASC')
        );
    }
}
