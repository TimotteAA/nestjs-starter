import { MigrationInterface, QueryRunner } from "typeorm";

export class GAaRIO1690023102571 implements MigrationInterface {
    name = 'GAaRIO1690023102571'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`medias\` ADD \`bodyPostId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`medias\` ADD CONSTRAINT \`FK_55823af20c627d28bac59dc1193\` FOREIGN KEY (\`bodyPostId\`) REFERENCES \`content_posts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`medias\` DROP FOREIGN KEY \`FK_55823af20c627d28bac59dc1193\``);
        await queryRunner.query(`ALTER TABLE \`medias\` DROP COLUMN \`bodyPostId\``);
    }

}
