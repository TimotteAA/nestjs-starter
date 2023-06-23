import { ModuleBuilder } from '../core/decorators';

import { SmtpService } from './services/smtp.service';
import { SmtpOptions } from './types';

@ModuleBuilder(async (configure) => ({
    global: true,
    providers: [
        {
            provide: SmtpService,
            useFactory: async () => {
                const config = await configure.get<SmtpOptions>('smtp');
                return new SmtpService(config);
            },
        },
    ],
    exports: [SmtpService],
}))
export class SmtpModule {}
