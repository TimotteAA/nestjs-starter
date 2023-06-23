import { ModuleBuilder } from "../core/decorators";

import { RedisService } from "./services";
import { RedisConfig } from "./types";

@ModuleBuilder(async (configure) => ({
    global: true,
    providers: [
        {
            provide: RedisService,
            useFactory: async () => {
                const options = await configure.get<RedisConfig>('redis');
                const service = new RedisService(options);
                await service.createClients();
                return service;
            }
        }
    ],
    exports: [RedisService]
}))
export class RedisModule {}