import { PrimaryColumn, BaseEntity as TypeormBaseEntity } from 'typeorm';

/**
 * 对同一封装id
 *
 */
export class BaseEntity extends TypeormBaseEntity {
    @PrimaryColumn({ type: 'varchar', generated: 'uuid', length: 36 })
    id: string;
}
