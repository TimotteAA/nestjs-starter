import { Expose } from 'class-transformer';
import { BaseEntity as TypeormBaseEntity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * 对同一封装id
 *
 */
export class BaseEntity extends TypeormBaseEntity {
    @Expose()
    @PrimaryGeneratedColumn('uuid')
    id: string;
}
