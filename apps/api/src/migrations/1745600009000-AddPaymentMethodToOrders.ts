import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentMethodToOrders1745600009000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DO $$ BEGIN
         IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
           CREATE TYPE payment_method AS ENUM ('BANK_TRANSFER', 'CASH');
         END IF;
       END $$`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "paymentMethod" payment_method NOT NULL DEFAULT 'BANK_TRANSFER'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "paymentMethod"`);
    await queryRunner.query(`DROP TYPE IF EXISTS payment_method`);
  }
}
