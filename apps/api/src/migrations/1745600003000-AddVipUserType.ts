import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVipUserType1745600003000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Must run outside transaction — PostgreSQL does not allow ADD VALUE inside a transaction block
    await queryRunner.query(
      `ALTER TYPE "public"."users_usertype_enum" ADD VALUE IF NOT EXISTS 'VIP_USER'`,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL does not support removing enum values; no-op
  }
}
