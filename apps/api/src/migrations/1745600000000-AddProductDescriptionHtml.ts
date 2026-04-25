import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductDescriptionHtml1745600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" ADD COLUMN "descriptionHtml" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "descriptionHtml"`);
  }
}
