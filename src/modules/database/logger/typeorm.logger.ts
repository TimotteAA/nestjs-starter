import { Logger, QueryRunner } from 'typeorm';

import { LoggerService } from '@/modules/logger/services';

export class TypeOrmLogger implements Logger {
    private logger: LoggerService; // your logger service

    constructor(logger: LoggerService) {
        this.logger = logger;
    }

    log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner): any {
        switch (level) {
            case 'log':
                this.logger.log(message);
                break;
            case 'info':
                this.logger.info(message);
                break;
            case 'warn':
                this.logger.warn(message);
                break;
        }
    }

    logMigration(message: string, queryRunner?: QueryRunner): any {
        this.logger.info(message);
    }

    logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner): any {
        this.logger.log(`Query: ${query}. Parameters: ${parameters}`);
    }

    logQueryError(
        error: string,
        query: string,
        parameters?: any[],
        queryRunner?: QueryRunner,
    ): any {
        this.logger.error(`Query "${query}" failed. Parameters: ${parameters}. Error: ${error}`);
    }

    logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner): any {
        this.logger.warn(`Query "${query}" took ${time} ms. Parameters: ${parameters}`);
    }

    logSchemaBuild(message: string, queryRunner?: QueryRunner): any {
        this.logger.info(message);
    }
}
