import { LoggerModule } from '../logger/logger.module';

import { Configure } from './configure';

import { ModuleBuilder } from './decorators';

/**
 * 全局核心模块
 */
@ModuleBuilder(async (configure) => ({
    global: true,
    providers: [
        {
            provide: Configure,
            useValue: configure,
        },
    ],
    exports: [Configure],
    imports: [LoggerModule.forRoot({ level: 'info' })],
}))
export class CoreModule {}
