import { BaseRepository } from '@/modules/database/base';
import { CustomRepository } from '@/modules/database/decorators';

import { CodeEntity } from '../entities/code.entity';

@CustomRepository(CodeEntity)
export class CodeRepository extends BaseRepository<CodeEntity> {
    protected _qbName = 'code';

    buildBaseQuery() {
        return this.createQueryBuilder(this.qbName).orderBy(`${this.qbName}.createdAt`, 'DESC');
    }
}
