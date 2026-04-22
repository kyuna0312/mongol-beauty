import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSiteSettingsContact1745280001000 implements MigrationInterface {
  name = 'AddSiteSettingsContact1745280001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "site_settings"
        ADD COLUMN IF NOT EXISTS "email"   character varying NOT NULL DEFAULT 'info@incellderm.mn',
        ADD COLUMN IF NOT EXISTS "address" character varying NOT NULL DEFAULT 'Улаанбаатар хот, Монгол улс'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "email"`);
    await queryRunner.query(`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "address"`);
  }
}
