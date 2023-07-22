import { ModuleMetadata } from '@nestjs/common';

import { ModuleBuilder } from '../core/decorators';

import { DatabaseModule } from '../database/database.module';
import { addEntities } from '../database/helpers';

import { TecentOsModule } from '../tencent-os/tecent-os.module';
import { UserModule } from '../user/user.module';

import * as entityMap from './entities';
import * as repoMap from './repositorys';
import * as serviceMap from './services';

@ModuleBuilder(async (configure) => {
    const providers: ModuleMetadata['providers'] = [...Object.values(serviceMap)];
    const imports: ModuleMetadata['imports'] = [
        await addEntities(configure, Object.values(entityMap)),
        DatabaseModule.forRepository(Object.values(repoMap)),
        UserModule,
        TecentOsModule,
    ];
    const exports: ModuleMetadata['exports'] = [...Object.values(serviceMap)];

    return {
        providers,
        imports,
        exports,
    };
})
export class MediaModule {}
