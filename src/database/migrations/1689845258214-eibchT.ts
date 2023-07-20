import { MigrationInterface, QueryRunner } from "typeorm";

export class EibchT1689845258214 implements MigrationInterface {
    name = 'EibchT1689845258214'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`rbac_permission_roles_rbac_roles\` DROP FOREIGN KEY \`FK_6915858cb1d029e3fc8989644a1\``);
        await queryRunner.query(`ALTER TABLE \`rbac_roles_users_users\` DROP FOREIGN KEY \`FK_3c933e8c0950496fa3a616e4b27\``);
        await queryRunner.query(`ALTER TABLE \`users_roles_rbac_roles\` DROP FOREIGN KEY \`FK_c97d36f8e1fd7c78d13b8787185\``);
        await queryRunner.query(`ALTER TABLE \`rbac_roles\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`rbac_roles\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`rbac_roles\` ADD \`id\` varchar(36) NOT NULL PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`rbac_permission_roles_rbac_roles\` ADD CONSTRAINT \`FK_6915858cb1d029e3fc8989644a1\` FOREIGN KEY (\`rbacRolesId\`) REFERENCES \`rbac_roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rbac_roles_users_users\` ADD CONSTRAINT \`FK_3c933e8c0950496fa3a616e4b27\` FOREIGN KEY (\`rbacRolesId\`) REFERENCES \`rbac_roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`users_roles_rbac_roles\` ADD CONSTRAINT \`FK_c97d36f8e1fd7c78d13b8787185\` FOREIGN KEY (\`rbacRolesId\`) REFERENCES \`rbac_roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users_roles_rbac_roles\` DROP FOREIGN KEY \`FK_c97d36f8e1fd7c78d13b8787185\``);
        await queryRunner.query(`ALTER TABLE \`rbac_roles_users_users\` DROP FOREIGN KEY \`FK_3c933e8c0950496fa3a616e4b27\``);
        await queryRunner.query(`ALTER TABLE \`rbac_permission_roles_rbac_roles\` DROP FOREIGN KEY \`FK_6915858cb1d029e3fc8989644a1\``);
        await queryRunner.query(`ALTER TABLE \`rbac_roles\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`rbac_roles\` ADD \`id\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`rbac_roles\` ADD PRIMARY KEY (\`id\`)`);
        await queryRunner.query(`ALTER TABLE \`users_roles_rbac_roles\` ADD CONSTRAINT \`FK_c97d36f8e1fd7c78d13b8787185\` FOREIGN KEY (\`rbacRolesId\`) REFERENCES \`rbac_roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rbac_roles_users_users\` ADD CONSTRAINT \`FK_3c933e8c0950496fa3a616e4b27\` FOREIGN KEY (\`rbacRolesId\`) REFERENCES \`rbac_roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`rbac_permission_roles_rbac_roles\` ADD CONSTRAINT \`FK_6915858cb1d029e3fc8989644a1\` FOREIGN KEY (\`rbacRolesId\`) REFERENCES \`rbac_roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
