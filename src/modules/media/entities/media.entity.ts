import { Expose, Type } from 'class-transformer';
import { Column, CreateDateColumn, Entity } from 'typeorm';

import { BaseEntity } from '@/modules/database/base';
import { AddRelations } from '@/modules/database/decorators';
import { DynamicRelation } from '@/modules/database/types';

import { getMediaConfig } from '../helpers';

const relations = () => getMediaConfig<DynamicRelation[]>('relations');
@AddRelations(relations)
@Entity('medias')
export class MediaEntity extends BaseEntity {
    // 动态关联字段
    [key: string]: any;

    // @Expose()
    @Column({ comment: '文件类型' })
    ext!: string;

    // @Expose()
    @Column({ comment: '腾讯云cos存储key' })
    key!: string;

    @Column({ comment: '在存储桶中的路径' })
    @Column()
    prefix!: string;

    /**
     * 存储url的虚拟字段
     */
    @Expose()
    url?: string;

    @Type(() => Date)
    @Expose()
    @CreateDateColumn()
    createdAt!: Date;
}
