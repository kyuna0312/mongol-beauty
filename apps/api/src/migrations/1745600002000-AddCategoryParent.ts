import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoryParent1745600002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "parentId" uuid REFERENCES "categories"("id") ON DELETE SET NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "parentId"`);
  }
}
