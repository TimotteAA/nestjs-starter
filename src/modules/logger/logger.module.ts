import { DynamicModule, ModuleMetadata } from '@nestjs/common';

import { ModuleBuilder } from '../core/decorators';

import { LoggerService } from './services';
import { LoggerModuleOptions } from './types';

@ModuleBuilder((configure) => ({}))
export class LoggerModule {
    static forRoot(options: LoggerModuleOptions): DynamicModule {
        const providers: ModuleMetadata['providers'] = [];
        providers.push({
            provide: LoggerService,
            useFactory() {
                return new LoggerService(options);
            },
        });

        return {
            global: true,
            providers,
            module: LoggerModule,
            exports: [LoggerService],
        };
    }
}
