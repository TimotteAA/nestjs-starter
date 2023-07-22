import { ModuleBuilder } from '../core/decorators';

import { CosService, SmsService } from './services';
import { CosStsOptions, SmsSdkOptions } from './types';

@ModuleBuilder(async (configure) => ({
    global: true,
    providers: [
        {
            provide: SmsService,
            useFactory: async () => {
                const config = await configure.get<SmsSdkOptions>('sms');
                return new SmsService(config);
            },
        },
        {
            provide: CosService,
            useFactory: async () => {
                const config = await configure.get<CosStsOptions>('cos');
                return new CosService(config);
            },
        },
    ],
    exports: [SmsService, CosService],
}))
export class TecentOsModule {}
