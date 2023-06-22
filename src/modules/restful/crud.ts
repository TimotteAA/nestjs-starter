import { Delete, Get, Patch, Post, SerializeOptions, Type } from '@nestjs/common';
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import { ClassTransformOptions } from 'class-transformer';
import { isNil } from 'lodash';

import { BaseController, BaseControllerWithTrash } from './base';
import { ALLOW_GUEST } from './constants';

import { DeleteDto, RestoreDto } from './dtos';
import { CrudItem, CrudOptions } from './types';

export const registerCrud = async <T extends BaseController<any> | BaseControllerWithTrash<any>>(
    Target: Type<T>,
    options: CrudOptions,
) => {
    const { id, enabled, dtos } = options;
    const methods: CrudItem[] = [];
    // 添加启用的CRUD方法
    for (const value of enabled) {
        const item = (typeof value === 'string' ? { name: value } : value) as CrudItem;
        if (
            methods.map(({ name }) => name).includes(item.name) ||
            !isNil(Object.getOwnPropertyDescriptor(Target.prototype, item.name))
        )
            continue;
        methods.push(item);
    }
    // 添加控制器方法的具体实现,参数的DTO类型,方法及路径装饰器,序列化选项,是否允许匿名访问等metadata
    // 添加其它回调函数
    // console.log(Target, methods);
    for (const { name, option = {} } of methods) {
        if (isNil(Object.getOwnPropertyDescriptor(Target.prototype, name))) {
            const descriptor =
                Target instanceof BaseControllerWithTrash
                    ? Object.getOwnPropertyDescriptor(BaseControllerWithTrash.prototype, name)
                    : Object.getOwnPropertyDescriptor(BaseController.prototype, name);

            Object.defineProperty(Target.prototype, name, {
                ...descriptor,
                value: {
                    async [name](...args: any[]) {
                        return descriptor.value.apply(this, args);
                    },
                }[name],
            });
        }

        const descriptor = Object.getOwnPropertyDescriptor(Target.prototype, name);
        // console.log(Target, name, descriptor);
        const [_, ...params] =
            Reflect.getMetadata('design:paramtypes', Target.prototype, name) ?? [];

        if (name === 'create' && !isNil(dtos.create)) {
            Reflect.defineMetadata(
                'design:paramtypes',
                [dtos.create, ...params],
                Target.prototype,
                name,
            );
            ApiBody({ type: dtos.create })(Target, name, descriptor);
        } else if (name === 'update' && !isNil(dtos.update)) {
            Reflect.defineMetadata(
                'design:paramtypes',
                [dtos.update, ...params],
                Target.prototype,
                name,
            );
            ApiBody({ type: dtos.update })(Target, name, descriptor);
        } else if (name === 'list' && !isNil(dtos.list)) {
            Reflect.defineMetadata(
                'design:paramtypes',
                [dtos.list, ...params],
                Target.prototype,
                name,
            );
            ApiQuery({ type: dtos.list })(Target, name, descriptor);
        } else if (name === 'delete') {
            // add api for delete
            ApiBody({ type: DeleteDto })(Target, name, descriptor);
        } else if (name === 'restore') {
            ApiBody({ type: RestoreDto })(Target, name, descriptor);
        }

        let serialize: ClassTransformOptions = {};
        if (isNil(option.serialize)) {
            if (['detail', 'store', 'update', 'delete', 'restore'].includes(name)) {
                serialize = { groups: [`${id}-detail`] };
            } else if (['list'].includes(name)) {
                serialize = { groups: [`${id}-list`] };
            }
        } else if (option.serialize === 'noGroup') {
            serialize = {};
        } else {
            serialize = option.serialize;
        }
        SerializeOptions(serialize)(Target, name, descriptor);

        switch (name) {
            case 'list':
                Get()(Target, name, descriptor);
                break;
            case 'detail':
                Get(':id')(Target, name, descriptor);
                break;
            case 'create':
                Post()(Target, name, descriptor);
                break;
            case 'update':
                Patch()(Target, name, descriptor);
                break;
            case 'delete':
                Delete()(Target, name, descriptor);
                break;
            case 'restore':
                Patch('restore')(Target, name, descriptor);
                break;
            default:
                break;
        }
        // console.log('name', name, Target.prototype, option.allowGuest);
        if (option.allowGuest) Reflect.defineMetadata(ALLOW_GUEST, true, Target.prototype, name);

        if (!isNil(option.hook)) option.hook(Target, name);

        const handlerDescriptor = Object.getOwnPropertyDescriptor(Target.prototype, name);

        if (handlerDescriptor && handlerDescriptor.value) {
            // const handlerName = handlerDescriptor.value.name;
            // console.log('handlerName', handlerName);
            // console.log('Target', Target.prototype, name);
            saveMethodName(Target.prototype, name); // 将方法名称保存为元数据
            // 将 handlerName 用于你的逻辑
        }
    }
};

// 保存方法名称的工具函数
export function saveMethodName(target: any, methodName: string) {
    // Reflect.defineMetadata('methodName', methodName, target);
    Reflect.defineMetadata('methodName', methodName, target, methodName);
}

// 获取方法名称的工具函数
export function getMethodName(target: any): string | undefined {
    return Reflect.getMetadata('methodName', target);
}
