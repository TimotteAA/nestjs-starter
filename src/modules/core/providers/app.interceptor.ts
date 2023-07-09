import {
    CallHandler,
    ClassSerializerInterceptor,
    ClassSerializerInterceptorOptions,
    ExecutionContext,
    Injectable,
    PlainLiteralObject,
    StreamableFile,
} from '@nestjs/common';
import { ClassTransformOptions } from '@nestjs/common/interfaces/external/class-transform-options.interface';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { isArray, isNil, isObject } from 'lodash';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { LoggerService } from '@/modules/logger/services';

/**
 * 全局拦截器,用于序列化数据
 */
@Injectable()
export class AppIntercepter extends ClassSerializerInterceptor {
    constructor(
        protected reflector: Reflector,
        protected options: ClassSerializerInterceptorOptions,
        private readonly logger: LoggerService,
    ) {
        super(reflector, options);
    }

    /**
     * 添加分页序列化
     * @param response
     * @param options
     */
    serialize(
        response: PlainLiteralObject | Array<PlainLiteralObject>,
        options: ClassTransformOptions,
    ): PlainLiteralObject | PlainLiteralObject[] {
        if ((!isObject(response) && !isArray(response)) || response instanceof StreamableFile) {
            return response;
        }
        // 如果是响应数据是数组,则遍历对每一项进行序列化
        if (isArray(response)) {
            return (response as PlainLiteralObject[]).map((item) =>
                !isObject(item) ? item : this.transformToPlain(item, options),
            );
        }
        // 如果是分页数据,则对items中的每一项进行序列化
        if ('meta' in response && 'items' in response) {
            const items = !isNil(response.items) && isArray(response.items) ? response.items : [];
            return {
                ...response,
                items: (items as PlainLiteralObject[]).map((item) => {
                    return !isObject(item) ? item : this.transformToPlain(item, options);
                }),
            };
        }
        // 如果响应是个对象则直接序列化
        return this.transformToPlain(response, options);
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest<FastifyRequest>();
        const response = httpContext.getResponse();

        const { method } = request;
        const { url } = request;
        const clientIp = request.ip;
        const userAgent = request.headers['user-agent'] || '';

        const now = Date.now();
        return next.handle().pipe(
            tap(() => {
                const executionTime = Date.now() - now;
                const { statusCode } = response;

                const message = `${method} ${url} ${statusCode} ${executionTime}ms ${clientIp} ${userAgent}`;

                if (statusCode >= 400 && statusCode < 600) {
                    this.logger.error(message, context.getClass().name);
                } else {
                    this.logger.log(message, context.getClass().name);
                }
            }),
        );
    }
}
