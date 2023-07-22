import { extname } from 'path';

import { Injectable, NotFoundException } from '@nestjs/common';

import { isNil } from 'lodash';
import { DataSource, In, ObjectLiteral } from 'typeorm';

import { Configure } from '@/modules/core/configure';
import { BaseService } from '@/modules/database/base';

import { CosService } from '@/modules/tencent-os/services';
import { UserService } from '@/modules/user/services';

import { MediaEntity } from '../entities';
import { MediaRepository } from '../repositorys';

import { CreateFileOptions, CreateMultiFileOptions } from '../types';

@Injectable()
export class MediaService extends BaseService<MediaEntity, MediaRepository> {
    constructor(
        protected configure: Configure,
        protected dataSource: DataSource,
        protected userService: UserService,
        protected cosService: CosService,
        protected repository: MediaRepository,
    ) {
        super(repository);
    }

    /**
     * 上传文件
     * @param param0
     */
    async upload<E extends ObjectLiteral>({ file, relation, prefix, user }: CreateFileOptions<E>) {
        if (isNil(file)) throw new NotFoundException('Have not any file to upload!');
        // const uploader: UploadFileType = {
        //     filename: file.filename,
        //     mimetype: file.mimetype,
        //     value: (await file.toBuffer()).toString('base64'),
        // };
        const item = new MediaEntity();
        const ossKey = await this.cosService.generateKey(file.filename);
        item.key = ossKey;
        item.ext = file.mimetype ?? extname(item.key);
        item.prefix = prefix;
        if (user) {
            item.user = await this.userService.detail(user.id);
        }
        await MediaEntity.save(item);
        // 上传到cos中
        await this.cosService.upload(file, ossKey);
        // return this.repository.findOneByOrFail({ id: item.id });

        if (!isNil(relation)) {
            const { entity, id, multi = false, replace = false, field, removeIds = [] } = relation;
            // 另一个entity的字段

            // e.g: userRepo
            const relationRepo = this.dataSource.getRepository(entity);
            // user
            const relationItem = await relationRepo.findOneOrFail({
                relations: [field],
                where: { id } as any,
            });
            if (!multi) {
                // 只关联一个媒体实体
                const oldMedia = relationItem[field] as MediaEntity;
                if (replace && relationItem[field]) {
                    // 取消旧的关联关系
                    await relationRepo
                        .createQueryBuilder()
                        .relation(entity, field)
                        .of(relationItem)
                        .set(null);
                }
                await relationRepo
                    .createQueryBuilder()
                    .relation(entity, field)
                    .of(relationItem)
                    .set(item);
                if (!isNil(oldMedia)) {
                    // 删除cos中的记录
                    await this.cosService.delete(oldMedia.prefix, oldMedia.key);
                    // 删除数据库
                    await oldMedia.remove();
                }
            } else {
                // 老的关联字段
                const oldMedias = (relationItem[field] ?? []) as MediaEntity[];
                // 替换则是新的，否则则是露出removeId后，再加上item
                const newMedias = replace
                    ? [item]
                    : [...oldMedias.filter((m) => !removeIds.includes(m.id)), item];
                await relationRepo
                    .createQueryBuilder()
                    .relation(entity, field)
                    .of(relationItem)
                    .addAndRemove(
                        newMedias.map((media) => media.id),
                        // replace的话全部删了
                        replace ? oldMedias.map((media) => media.id) : [removeIds],
                    );
                if (replace) {
                    if (Array.isArray(oldMedias) && oldMedias.length) {
                        await this.cosService.deleteMulti(
                            oldMedias.map((media) => ({
                                prefix: media.prefix,
                                key: media.key,
                            })),
                        );
                        // 删除数据库字段
                        await this.repository.remove(oldMedias);
                    }
                } else {
                    if (Array.isArray(removeIds) && removeIds.length) {
                        const mediasToRemove = oldMedias.filter((media) =>
                            removeIds.includes(media.id),
                        );
                        if (mediasToRemove.length) {
                            await this.cosService.deleteMulti(
                                mediasToRemove.map((media) => ({
                                    prefix: media.prefix,
                                    key: media.key,
                                })),
                            );
                            // 删除数据库字段
                            await this.repository.remove(mediasToRemove);
                        }
                    }
                }
            }
        }

        return this.repository.findOneByOrFail({ id: item.id });
    }

    /**
     * 批量上传文件
     * @param param0
     */
    async uploadMultiple<E extends ObjectLiteral>({ tasks }: CreateMultiFileOptions<E>) {
        if (!tasks || !tasks.length) throw new NotFoundException('Have not any files to upload!');

        // 使用Promise.all以并行方式运行所有的上传任务
        const uploadTasks = tasks.map(({ file, prefix, relation, user }) =>
            this.upload({ file, prefix, relation, user }),
        );

        // 等待所有的上传任务完成，然后返回结果
        const results = await Promise.all(uploadTasks);

        return results;
    }

    async delete(ids: string[], trash?: boolean): Promise<MediaEntity[]> {
        const items = await this.repository.find({
            where: {
                id: In(ids),
            },
        });
        await this.cosService.deleteMulti(
            items.map((item) => ({ prefix: item.prefix, key: item.key })),
        );
        return super.delete(ids, false);
    }
}
