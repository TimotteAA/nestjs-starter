import { Injectable } from '@nestjs/common';

import { isNil } from 'lodash';

import { BaseService } from '@/modules/database/base';

import { QueryMenuTreeDto } from '../dtos';
import { MenuEntity } from '../entities';
import { MenuRepository } from '../repository';

@Injectable()
export class MenuService extends BaseService<MenuEntity, MenuRepository> {
    constructor(private readonly repo: MenuRepository) {
        super(repo);
    }

    async tree(data: QueryMenuTreeDto) {
        const { menuId } = data;
        if (!isNil(menuId)) {
            const menu = await this.repo.findOneByOrFail({ id: menuId });
            return this.repo.findDescendantsTree(menu);
        }
        return this.repo.findTrees();
    }
}
