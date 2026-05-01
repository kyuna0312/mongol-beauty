import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeliverySettingsToSiteSettings1745600007000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "deliveryFee" integer NOT NULL DEFAULT 5000`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "freeDeliveryThreshold" integer NOT NULL DEFAULT 200000`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "freeDeliveryThreshold"`);
    await queryRunner.query(`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "deliveryFee"`);
  }
}
