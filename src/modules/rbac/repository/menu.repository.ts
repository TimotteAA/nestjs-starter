import { SelectQueryBuilder } from 'typeorm';

import { BaseTreeRepository } from '@/modules/database/base';
import { TreeChildrenResolve } from '@/modules/database/constants';
import { CustomRepository } from '@/modules/database/decorators';

import { MenuEntity } from '../entities';

@CustomRepository(MenuEntity)
export class MenuRepository extends BaseTreeRepository<MenuEntity> {
    protected _qbName = 'menu';

    protected _childrenResolve = TreeChildrenResolve.DELETE;

    buildBaseQB(): SelectQueryBuilder<MenuEntity> {
        return super.createQueryBuilder(this.qbName);
    }
}
