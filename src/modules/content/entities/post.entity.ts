import { Exclude, Expose, Type } from 'class-transformer';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne,
    UpdateDateColumn,
} from 'typeorm';

import { BaseEntity } from '@/modules/database/base';

import { MediaEntity } from '@/modules/media/entities';
import { UserEntity } from '@/modules/user/entities';

import { PostBodyType } from '../constants';

import { CategoryEntity } from './category.entity';
import { CommentEntity } from './comment.entity';

/**
 * 文章模型
 */
@Exclude()
@Entity('content_posts')
export class PostEntity extends BaseEntity {
    @Expose()
    @Column({ comment: '文章标题' })
    @Index({ fulltext: true })
    title: string;

    @Expose({ groups: ['post-detail'] })
    @Column({ comment: '文章内容', type: 'longtext' })
    @Index({ fulltext: true })
    body: string;

    @Expose()
    @Column({ comment: '文章描述', nullable: true })
    @Index({ fulltext: true })
    summary?: string;

    @Expose()
    @Column({ comment: '关键字', type: 'simple-array', nullable: true })
    keywords?: string[];

    @Expose()
    @Column({
        comment: '文章类型',
        type: 'enum',
        enum: PostBodyType,
        default: PostBodyType.MD,
    })
    type: PostBodyType;

    @Expose()
    @Column({
        comment: '发布时间',
        type: 'varchar',
        nullable: true,
    })
    publishedAt?: Date | null;

    @Expose()
    @Column({ comment: '自定义文章排序', default: 0 })
    customOrder: number;

    @Expose()
    @Type(() => Date)
    @CreateDateColumn({
        comment: '创建时间',
    })
    createdAt: Date;

    @Expose()
    @Type(() => Date)
    @UpdateDateColumn({
        comment: '更新时间',
    })
    updatedAt: Date;

    @Expose()
    commentCount: number;

    @Expose()
    @Type(() => CategoryEntity)
    @ManyToMany(() => CategoryEntity, (category) => category.posts, {
        // 在新增文章时,如果所属分类不存在则直接创建
        cascade: true,
    })
    @JoinTable()
    categories: CategoryEntity[];

    @OneToMany((type) => CommentEntity, (comment) => comment.post, {
        cascade: true,
    })
    comments: CommentEntity[];

    @Expose()
    @Type(() => Date)
    @DeleteDateColumn({
        comment: '删除时间',
    })
    deletedAt: Date;

    @Expose()
    @ManyToOne(() => UserEntity, (user: UserEntity) => user.posts, {
        nullable: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    author!: UserEntity;

    @OneToOne(() => MediaEntity, (media) => media.coverPost, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        nullable: true,
    })
    @JoinColumn()
    coverImg?: MediaEntity;

    @OneToMany(() => MediaEntity, (media) => media.bodyPost)
    @JoinTable()
    bodyImgs?: MediaEntity[];
}
