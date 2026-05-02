import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBrandingFieldsToSiteSettings1746100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "logoUrl" varchar`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "primaryColor" varchar`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "logoUrl"`);
    await queryRunner.query(`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "primaryColor"`);
  }
}
