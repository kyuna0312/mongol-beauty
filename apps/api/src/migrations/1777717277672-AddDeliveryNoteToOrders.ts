import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeliveryNoteToOrders1777717277672 implements MigrationInterface {
    name = 'AddDeliveryNoteToOrders1777717277672'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "deliveryNote" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "deliveryNote"`);
    }

}
