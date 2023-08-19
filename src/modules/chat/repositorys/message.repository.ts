import { BaseRepository } from '@/modules/database/base';
import { CustomRepository } from '@/modules/database/decorators';

import { MessageEntity } from '../entities';

@CustomRepository(MessageEntity)
export class MessageRepository extends BaseRepository<MessageEntity> {
    protected _qbName = 'message';

    buildBaseQuery() {
        return this.createQueryBuilder(this.qbName).orderBy(`${this.qbName}.createdAt`, 'DESC');
    }
}
