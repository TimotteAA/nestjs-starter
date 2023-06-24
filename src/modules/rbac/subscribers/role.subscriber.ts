import { isNil } from 'lodash';
import { EventSubscriber, EntitySubscriberInterface, DataSource } from 'typeorm';

import { RoleEntity } from '../entities';

/**
 * role订阅者
 * 数据库没有label字段，设置name为label字段
 */
@EventSubscriber()
export class RoleSubscriber implements EntitySubscriberInterface<RoleEntity> {
    constructor(private dataSource: DataSource) {
        this.dataSource.subscribers.push(this);
    }

    listenTo() {
        return RoleEntity;
    }

    afterLoad(entity: RoleEntity): void | Promise<any> {
        if (isNil(entity.label)) {
            entity.label = entity.name;
        }
    }
}
