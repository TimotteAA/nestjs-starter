import { bootApp } from '@/modules/core/helpers/app';

import { creator } from './creator';

import { LoggerService } from './modules/logger/services';
import { echoApi } from './modules/restful/helpers';
import { Restful } from './modules/restful/restful';

bootApp(creator, ({ app, configure }) => async () => {
    const restful = app.get(Restful);
    const logger = app.get(LoggerService);
    echoApi(configure, restful, logger);
});
