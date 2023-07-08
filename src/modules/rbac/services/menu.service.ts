import { BadRequestException, Injectable } from '@nestjs/common';

import { isNil } from 'lodash';

import { In } from 'typeorm';

import { BaseService } from '@/modules/database/base';

import { CreateMenuDto, QueryMenuTreeDto } from '../dtos';
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
            console.log(menu);
            return this.repo.findDescendantsTree(menu);
        }
        return this.repo.findTrees();
    }

    async delete(ids: string[], trash?: boolean): Promise<MenuEntity[]> {
        const menus = await this.repo.find({
            where: {
                id: In(ids),
            },
            withDeleted: true,
        });
        for (const menu of menus) {
            if (menu.systemd) {
                throw new BadRequestException('不能删除系统菜单');
            }
        }
        return super.delete(ids, false);
    }

    async create(data: CreateMenuDto): Promise<MenuEntity> {
        const { parent, ...rest } = data;
        const menu = await this.repo.save({
            ...rest,
            systemd: false,
            parent: !isNil(parent) ? await this.repo.findOne({ where: { id: parent } }) : null,
        });
        return menu;
    }
}
