import { SelectQueryBuilder } from 'typeorm';

import { BaseRepository } from '@/modules/database/base';
import { CustomRepository } from '@/modules/database/decorators';

import { MediaEntity } from '../entities';

@CustomRepository(MediaEntity)
export class MediaRepository extends BaseRepository<MediaEntity> {
    protected _qbName = 'media';

    buildBaseQB(): SelectQueryBuilder<MediaEntity> {
        return this.createQueryBuilder(this.qbName).orderBy(`${this.qbName}.createdAt`, 'ASC');
    }
}
