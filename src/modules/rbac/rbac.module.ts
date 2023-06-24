import { forwardRef } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { ModuleBuilder } from '../core/decorators';
import { DatabaseModule } from '../database/database.module';
import { addEntities } from '../database/helpers';
import { UserModule } from '../user/user.module';

import * as entityMaps from './entities';
import { RbacGuard } from './guards';
import { RbacResolver } from './rbac.resolver';
import * as repoMaps from './repository';
import * as serviceMaps from './services';
import * as subscriberMaps from './subscribers';
// import * as controllerMaps from "./controllers";

const entities = Object.values(entityMaps);
const repos = Object.values(repoMaps);
const subscribers = Object.values(subscriberMaps);
const services = Object.values(serviceMaps);
// const controllers = Object.values(controllerMaps);

@ModuleBuilder(async (configure) => ({
    // controllers,
    imports: [
        await addEntities(configure, entities),
        DatabaseModule.forRepository(repos),
        forwardRef(() => UserModule),
    ],
    providers: [
        ...subscribers,
        ...services,
        {
            provide: RbacResolver,
            useFactory: async (dataSource: DataSource) => {
                const resolver = new RbacResolver(dataSource, configure);
                resolver.setOptions({});
                return resolver;
            },
            inject: [getDataSourceToken()],
        },
        RbacGuard,
    ],
    exports: [DatabaseModule.forRepository(repos), ...services, RbacResolver, RbacGuard],
}))
export class RbacModule {}
