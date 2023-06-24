import { Type } from '@nestjs/common';

import { PERMISSION_CHECKERS } from '../constants';
import { PermissionChecker } from '../types';

/**
 * 在路由方法上添加权限校验器
 */
export const ManualPermission = (
    target: Type<any>,
    method: string,
    checkers: PermissionChecker[],
) => {
    // console.log("....")
    // console.log("target prototype", target, target.prototype, method)
    Reflect.defineMetadata(PERMISSION_CHECKERS, checkers, target.prototype, method);
};
