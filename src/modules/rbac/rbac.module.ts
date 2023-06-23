import { DataSource } from "typeorm";
import { forwardRef } from "@nestjs/common";
import { getDataSourceToken } from "@nestjs/typeorm";

import { addEntities } from "../database/helpers";
import { DatabaseModule } from "../database/database.module";
import * as entityMaps from "./entities";
import * as repoMaps from "./repository";
import * as subscriberMaps from "./subscribers";
import * as serviceMaps from "./services";
// import * as controllerMaps from "./controllers";
import { RbacResolver } from "./rbac.resolver";
import { UserModule } from "../user/user.module";
import { RbacGuard, RbacWsGuard } from "./guards";
import { ModuleBuilder } from "../core/decorators";

const entities = Object.values(entityMaps);
const repos = Object.values(repoMaps);
const subscribers = Object.values(subscriberMaps);
const services = Object.values(serviceMaps);
// const controllers = Object.values(controllerMaps);

@ModuleBuilder(async configure => ({
  // controllers,
  imports: [(await addEntities(configure, entities)), DatabaseModule.forRepository(repos), forwardRef(() => UserModule)],
  providers: [...subscribers, ...services,         
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
    RbacWsGuard
  ],
  exports: [DatabaseModule.forRepository(repos), ...services, RbacResolver, RbacGuard, RbacWsGuard]
}))
export class RbacModule {
}