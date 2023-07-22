import { MultipartFile } from '@fastify/multipart';
import { EntityTarget, ObjectLiteral } from 'typeorm';

import { DynamicRelation } from '../database/types';

import { UserEntity } from '../user/entities';

/**
 * 媒体模块配置
 */
export interface MediaConfig {
    /**
     * 动态关联
     */
    relations?: DynamicRelation[];
    // /**
    //  * 文件上传路径
    //  */
    // upload?: string;
}

/**
 * 上传的文件实例选项
 */
export interface UploadFileType {
    /**
     * 文件名称
     */
    filename: string;
    /**
     * 文件的mimetype
     */
    mimetype: string;
    /**
     * 文件的buffer字符
     */
    value: string;
}

/**
 * 创建文件数据的选项
 */
export interface CreateFileOptions<E extends ObjectLiteral> {
    /**
     * 上传的文件
     */
    file: MultipartFile;
    /**
     * 存放桶路径
     */
    prefix: string;
    /**
     * 用户模型实例转化的用户数据对象
     */
    user?: ClassToPlain<UserEntity>;
    /**
     * 需要关联操作的选项
     */
    relation?: {
        /**
         * 关联表的ID
         */
        id: string;
        /**
         * 关联的模型
         */
        entity: EntityTarget<E>;
        /**
         * 关联的字段,默认为media
         */
        field: string;
        /**
         * 是否操作多个
         */
        multi?: boolean;
        /**
         * 是否删除与media的字段关系
         */
        replace?: boolean;
        /**
         * 一对多时，指定特定的删除id
         */
        removeIds?: string[];
    };
}

/**
 * 创建文件数据的选项
 */
export type CreateMultiFileOptions<E extends ObjectLiteral> = {
    tasks: CreateFileOptions<E>[];
};
