import { Expose } from 'class-transformer';
import { PrimaryGeneratedColumn, BaseEntity as TypeormBaseEntity } from 'typeorm';

/**
 * 对同一封装id
 *
 */
export class BaseEntity extends TypeormBaseEntity {
    @Expose()
    @PrimaryGeneratedColumn('uuid')
    id: string;
    // @Expose()
    // @PrimaryColumn('uuid')
    // id: string;
}
