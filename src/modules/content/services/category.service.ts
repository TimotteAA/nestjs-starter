import { Injectable } from '@nestjs/common';
import { isNil, omit } from 'lodash';
import { EntityNotFoundError } from 'typeorm';

import { BaseService } from '@/modules/database/base';

import { SelectTrashMode } from '../../database/constants';
import {
    ManageCreateCategoryDto,
    ManageUpdateCategoryDto,
    ManageQueryCategoryTreeDto,
} from '../dtos/manage';
import { CategoryEntity } from '../entities';

import { CategoryRepository } from '../repositories';

/**
 * 分类数据操作
 */
@Injectable()
export class CategoryService extends BaseService<CategoryEntity, CategoryRepository> {
    protected enableTrash = true;

    constructor(protected repository: CategoryRepository) {
        super(repository);
    }

    /**
     * 查询分类树
     */
    async findTrees(options: ManageQueryCategoryTreeDto) {
        const { trashed = SelectTrashMode.NONE } = options;
        return this.repository.findTrees({
            withTrashed: trashed === SelectTrashMode.ALL || trashed === SelectTrashMode.ONLY,
            onlyTrashed: trashed === SelectTrashMode.ONLY,
        });
    }

    /**
     * 新增分类
     * @param data
     */
    async create(data: ManageCreateCategoryDto) {
        const item = await this.repository.save({
            ...data,
            parent: await this.getParent(undefined, data.parent),
        });
        return this.detail(item.id);
    }

    /**
     * 更新分类
     * @param data
     */
    async update(data: ManageUpdateCategoryDto) {
        const parent = await this.getParent(data.id, data.parent);
        const querySet = omit(data, ['id', 'parent']);
        if (Object.keys(querySet).length > 0) {
            await this.repository.update(data.id, querySet);
        }
        const cat = await this.detail(data.id);
        const shouldUpdateParent =
            (!isNil(cat.parent) && !isNil(parent) && cat.parent.id !== parent.id) ||
            (isNil(cat.parent) && !isNil(parent)) ||
            (!isNil(cat.parent) && isNil(parent));
        // 父分类单独更新
        if (parent !== undefined && shouldUpdateParent) {
            cat.parent = parent;
            await this.repository.save(cat);
        }
        return cat;
    }

    async delete(ids: string[], trash?: boolean) {
        console.log('ids', ids, trash);
        return super.delete(ids, trash);
    }

    /**
     *
     * @param current
     * @param parentId 父分类id
     */
    protected async getParent(current?: string, parentId?: string) {
        if (current === parentId) return undefined;
        let parent: CategoryEntity | undefined;
        if (parentId !== undefined) {
            if (parentId === null) return null;
            parent = await this.repository.findOne({ where: { id: parentId } });
            if (!parent)
                throw new EntityNotFoundError(
                    CategoryEntity,
                    `Parent category ${parentId} not exists!`,
                );
        }
        return parent;
    }
}
