import { SelectQueryBuilder } from 'typeorm';

import { BaseTreeRepository } from '@/modules/database/base';
import { CustomRepository } from '@/modules/database/decorators';

import { MenuEntity } from '../entities';

@CustomRepository(MenuEntity)
export class MenuRepository extends BaseTreeRepository<MenuEntity> {
    protected _qbName = 'menu';

    buildBaseQB(): SelectQueryBuilder<MenuEntity> {
        return super.createQueryBuilder(this.qbName);
    }
}
