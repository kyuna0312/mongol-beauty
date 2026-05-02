import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsVisibleToProducts1746000003000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "isVisible" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "isVisible"`);
  }
}
