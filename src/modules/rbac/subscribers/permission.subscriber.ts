import { isNil } from 'lodash';
import { EventSubscriber } from 'typeorm';

import { BaseSubscriber } from '@/modules/database/base';

import { PermissionEntity } from '../entities';

/**
 * permission订阅者
 * 数据库没有label字段，设置name为label字段
 */
@EventSubscriber()
export class PermissionSubscriber extends BaseSubscriber<PermissionEntity> {
    protected entity = PermissionEntity;

    listenTo() {
        return PermissionEntity;
    }

    async afterLoad(entity: PermissionEntity): Promise<void> {
        if (isNil(entity.label)) {
            entity.label = entity.name;
        }
    }
}
