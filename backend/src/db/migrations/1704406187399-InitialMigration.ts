import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1704406187399 implements MigrationInterface {
    name = 'InitialMigration1704406187399'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`directories\` (\`uuid\` varchar(255) NOT NULL DEFAULT UUID(), \`name\` varchar(255) NOT NULL, \`isRecycled\` tinyint NULL DEFAULT 0, \`created\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP(), \`updated\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(), \`parent\` varchar(255) NULL, PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`files\` (\`uuid\` varchar(255) NOT NULL DEFAULT UUID(), \`name\` varchar(255) NOT NULL, \`mimeType\` varchar(255) NOT NULL DEFAULT 'application/octet-stream', \`size\` bigint NOT NULL DEFAULT '0', \`isRecycled\` tinyint NOT NULL DEFAULT 0, \`created\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP(), \`updated\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(), \`parent\` varchar(255) NULL, PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`directories\` ADD CONSTRAINT \`FK_b694a803692de09ba05a875fe29\` FOREIGN KEY (\`parent\`) REFERENCES \`directories\`(\`uuid\`) ON DELETE RESTRICT ON UPDATE RESTRICT`);
        await queryRunner.query(`ALTER TABLE \`files\` ADD CONSTRAINT \`FK_ab1c78280af378a90675f0d2b29\` FOREIGN KEY (\`parent\`) REFERENCES \`directories\`(\`uuid\`) ON DELETE RESTRICT ON UPDATE RESTRICT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`files\` DROP FOREIGN KEY \`FK_ab1c78280af378a90675f0d2b29\``);
        await queryRunner.query(`ALTER TABLE \`directories\` DROP FOREIGN KEY \`FK_b694a803692de09ba05a875fe29\``);
        await queryRunner.query(`DROP TABLE \`files\``);
        await queryRunner.query(`DROP TABLE \`directories\``);
    }

}
