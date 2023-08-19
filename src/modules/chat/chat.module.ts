import { ModuleBuilder } from '../core/decorators';
import { DatabaseModule } from '../database/database.module';
import { addEntities } from '../database/helpers';

import * as entityMap from './entities';
import * as repoMap from './repositorys';
import * as serviceMap from './services';

const entities = Object.values(entityMap);
const repos = Object.values(repoMap);
const services = Object.values(serviceMap);

@ModuleBuilder(async (configure) => ({
    providers: [...services],
    exports: [...services],
    imports: [
        await addEntities(configure, [...entities]),
        DatabaseModule.forRepository(Object.values(repos)),
    ],
}))
export class ChatModule {}
