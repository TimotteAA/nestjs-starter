import { BaseRepository } from '@/modules/database/base';
import { CustomRepository } from '@/modules/database/decorators';

import { MessageReceiver } from '../entities';

@CustomRepository(MessageReceiver)
export class MessageReceiveRepository extends BaseRepository<MessageReceiver> {
    protected _qbName = 'message-receive';

    buildBaseQuery() {
        return this.createQueryBuilder(this.qbName);
    }
}
