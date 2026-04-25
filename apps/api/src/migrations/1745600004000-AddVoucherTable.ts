import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVoucherTable1745600004000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "vouchers" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "code" character varying NOT NULL,
        "discountPercent" integer NOT NULL,
        "expiresAt" TIMESTAMP,
        "usedById" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_vouchers_code" UNIQUE ("code"),
        CONSTRAINT "PK_vouchers" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "vouchers"`);
  }
}
