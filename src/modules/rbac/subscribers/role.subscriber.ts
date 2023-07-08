import { isNil } from 'lodash';
import { EventSubscriber } from 'typeorm';

import { BaseSubscriber } from '@/modules/database/base';

import { RoleEntity } from '../entities';

/**
 * role订阅者
 * 数据库没有label字段，设置name为label字段
 */
@EventSubscriber()
export class RoleSubscriber extends BaseSubscriber<RoleEntity> {
    protected entity = RoleEntity;

    listenTo() {
        return RoleEntity;
    }

    async afterLoad(entity: RoleEntity): Promise<any> {
        if (isNil(entity.label)) {
            entity.label = entity.name;
        }
    }
}
