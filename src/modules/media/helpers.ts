import { isNil } from 'lodash';

import { App } from '../core/app';

import { MediaConfig } from './types';

/**
 * 默认媒体模块配置
 */
export function defaultMediaConfig(): Required<MediaConfig> {
    return {
        relations: [],
    };
}

/**
 * 获取media模块配置的值
 * @param key
 */
export async function getMediaConfig<T>(key?: string): Promise<T> {
    return App.configure.get<T>(isNil(key) ? 'media' : `media.${key}`);
}
