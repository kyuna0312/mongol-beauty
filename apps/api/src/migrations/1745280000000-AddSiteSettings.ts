import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSiteSettings1745280000000 implements MigrationInterface {
  name = 'AddSiteSettings1745280000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "site_settings" (
        "id"          character varying   NOT NULL DEFAULT 'default',
        "bankName"    character varying   NOT NULL DEFAULT 'ХХБ',
        "bankAccount" character varying   NOT NULL DEFAULT '1234567890',
        "bankOwner"   character varying   NOT NULL DEFAULT 'Mongol Beauty LLC',
        "phone"       character varying   NOT NULL DEFAULT '9911-2233',
        "updatedAt"   TIMESTAMP           NOT NULL DEFAULT now(),
        CONSTRAINT "PK_site_settings" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      INSERT INTO "site_settings" ("id", "bankName", "bankAccount", "bankOwner", "phone")
      VALUES ('default', 'ХХБ', '1234567890', 'Mongol Beauty LLC', '9911-2233')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "site_settings"`);
  }
}
