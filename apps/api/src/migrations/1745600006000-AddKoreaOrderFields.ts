import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddKoreaOrderFields1745600006000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "supplierName" varchar`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "koreaTrackingId" varchar`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "estimatedDays" varchar`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "estimatedDays"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "koreaTrackingId"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "supplierName"`);
  }
}
