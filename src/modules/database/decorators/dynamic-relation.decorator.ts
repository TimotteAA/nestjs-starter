import { ObjectLiteral } from 'typeorm';

import { DYNAMIC_RELATIONS } from '../constants';
import { DynamicRelation } from '../types';

/**
 * 添加动态关联关系的类装饰器
 * @param relations
 */
export function AddRelations(relations: () => Promise<DynamicRelation[]>) {
    return function <E extends ObjectLiteral>(target: E) {
        Reflect.defineMetadata(DYNAMIC_RELATIONS, relations, target);
        return target;
    };
}
