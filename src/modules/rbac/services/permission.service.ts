import { Injectable } from '@nestjs/common';
import { isNil } from 'lodash';
import { SelectQueryBuilder } from 'typeorm';

import { BaseService } from '@/modules/database/base';
import { QueryHook } from '@/modules/database/types';

import { QueryPermissionDto } from '../dtos';
import { PermissionEntity } from '../entities';
import { PermissionRepository } from '../repository';

type FindParams = {
    [key in keyof Omit<QueryPermissionDto, 'page' | 'limit'>]: QueryPermissionDto[key];
};

/**
 * 权限服务类
 * 只支持查询，不支持别的操作
 */
@Injectable()
export class PermissionService extends BaseService<
    PermissionEntity,
    PermissionRepository,
    FindParams
> {
    constructor(protected repo: PermissionRepository) {
        super(repo);
    }

    /**
     * 查询某个角色的权限
     * @param qb
     * @param options
     * @param callback
     */
    protected async buildListQB(
        qb: SelectQueryBuilder<PermissionEntity>,
        options: FindParams,
        callback?: QueryHook<PermissionEntity>,
    ): Promise<SelectQueryBuilder<PermissionEntity>> {
        const { role } = options;
        if (!isNil(role)) {
            const { qbName } = this.repo;
            const roleQb = this.repo
                .createQueryBuilder(qbName)
                .innerJoin(`${qbName}.roles`, 'pRoles', 'pRoles.id IN (:...ids)', {
                    ids: [role],
                })
                .orderBy(`${qbName}.customOrder`, 'ASC');
            return super.buildListQB(roleQb, options, callback);
        }
        return super.buildListQB(qb, options, callback);
    }
}
