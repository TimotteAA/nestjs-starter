import { MigrationInterface, QueryRunner } from "typeorm";

export class SdJWfV1692425584521 implements MigrationInterface {
    name = 'SdJWfV1692425584521'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`chat_messages\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL COMMENT '消息标题，用于后台管理系统', \`type\` varchar(255) NOT NULL COMMENT '消息类型，与title一起使用', \`body\` varchar(255) NULL COMMENT '消息内容', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`senderId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`chat_message_reveiver\` (\`id\` varchar(36) NOT NULL, \`readed\` tinyint NOT NULL COMMENT '消息是否已读' DEFAULT 0, \`messageId\` varchar(36) NULL, \`receiverId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`chat_messages\` ADD CONSTRAINT \`FK_fc6b58e41e9a871dacbe9077def\` FOREIGN KEY (\`senderId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chat_message_reveiver\` ADD CONSTRAINT \`FK_e9864e5fa7c608b0b2f75dc44f9\` FOREIGN KEY (\`messageId\`) REFERENCES \`chat_messages\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chat_message_reveiver\` ADD CONSTRAINT \`FK_a883c02083601a4f3cbe99e56a1\` FOREIGN KEY (\`receiverId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`chat_message_reveiver\` DROP FOREIGN KEY \`FK_a883c02083601a4f3cbe99e56a1\``);
        await queryRunner.query(`ALTER TABLE \`chat_message_reveiver\` DROP FOREIGN KEY \`FK_e9864e5fa7c608b0b2f75dc44f9\``);
        await queryRunner.query(`ALTER TABLE \`chat_messages\` DROP FOREIGN KEY \`FK_fc6b58e41e9a871dacbe9077def\``);
        await queryRunner.query(`DROP TABLE \`chat_message_reveiver\``);
        await queryRunner.query(`DROP TABLE \`chat_messages\``);
    }

}
