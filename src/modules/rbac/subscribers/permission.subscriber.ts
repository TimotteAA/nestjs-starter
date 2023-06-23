import {
  EventSubscriber,
  EntitySubscriberInterface,
  DataSource
} from 'typeorm';
import { isNil } from 'lodash';
import { PermissionEntity } from '../entities';

/**
 * permission订阅者
 * 数据库没有label字段，设置name为label字段
 */
@EventSubscriber()
export class PermissionSubscriber implements EntitySubscriberInterface<PermissionEntity> {
  constructor(private dataSource: DataSource) {
      this.dataSource.subscribers.push(this);
  }

  listenTo() {
      return PermissionEntity;
  }

  afterLoad(entity: PermissionEntity): void | Promise<any> {
    if (isNil(entity.label)) {
      entity.label = entity.name;
    }
  }
}
