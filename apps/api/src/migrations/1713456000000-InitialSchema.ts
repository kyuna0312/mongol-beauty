import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1713456000000 implements MigrationInterface {
  name = 'InitialSchema1713456000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enum types
    await queryRunner.query(
      `CREATE TYPE "public"."users_usertype_enum" AS ENUM('USER', 'SUBSCRIBED_USER', 'ADMIN')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_status_enum" AS ENUM('WAITING_PAYMENT', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED')`,
    );

    // categories
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id"          uuid                NOT NULL DEFAULT gen_random_uuid(),
        "name"        character varying   NOT NULL,
        "slug"        character varying   NOT NULL,
        "description" text,
        "imageUrl"    character varying,
        CONSTRAINT "UQ_categories_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_categories"      PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_categories_name" ON "categories" ("name")`);
    await queryRunner.query(`CREATE INDEX "IDX_categories_slug" ON "categories" ("slug")`);

    // users
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"                   uuid                              NOT NULL DEFAULT gen_random_uuid(),
        "phone"                character varying,
        "name"                 character varying,
        "email"                character varying,
        "password"             character varying,
        "userType"             "public"."users_usertype_enum"    NOT NULL DEFAULT 'USER',
        "isAdmin"              boolean                           NOT NULL DEFAULT false,
        "passwordResetToken"   character varying,
        "passwordResetExpires" TIMESTAMP,
        "createdAt"            TIMESTAMP                         NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_phone" UNIQUE ("phone"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users"       PRIMARY KEY ("id")
      )
    `);

    // products
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id"          uuid              NOT NULL DEFAULT gen_random_uuid(),
        "name"        character varying NOT NULL,
        "categoryId"  uuid              NOT NULL,
        "price"       integer           NOT NULL,
        "stock"       integer           NOT NULL DEFAULT 0,
        "description" text,
        "skinType"    text              NOT NULL DEFAULT '',
        "features"    text              NOT NULL DEFAULT '',
        "images"      text              NOT NULL DEFAULT '',
        "createdAt"   TIMESTAMP         NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "PK_products" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_products_name"                  ON "products" ("name")`);
    await queryRunner.query(`CREATE INDEX "IDX_products_createdAt"             ON "products" ("createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_products_updatedAt"             ON "products" ("updatedAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_products_categoryId_createdAt"  ON "products" ("categoryId", "createdAt")`);

    // orders
    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id"                 uuid                           NOT NULL DEFAULT gen_random_uuid(),
        "totalPrice"         integer                        NOT NULL,
        "status"             "public"."orders_status_enum"  NOT NULL DEFAULT 'WAITING_PAYMENT',
        "paymentReceiptUrl"  character varying,
        "deliveryAddress"    character varying,
        "idempotencyKey"     character varying,
        "userId"             uuid,
        "createdAt"          TIMESTAMP                      NOT NULL DEFAULT now(),
        "updatedAt"          TIMESTAMP                      NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_orders_idempotencyKey" UNIQUE ("idempotencyKey"),
        CONSTRAINT "PK_orders"                PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_orders_status"            ON "orders" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_createdAt"         ON "orders" ("createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_userId_createdAt"  ON "orders" ("userId", "createdAt")`);

    // order_items
    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id"        uuid    NOT NULL DEFAULT gen_random_uuid(),
        "orderId"   uuid    NOT NULL,
        "productId" uuid    NOT NULL,
        "quantity"  integer NOT NULL,
        "price"     integer NOT NULL,
        CONSTRAINT "PK_order_items" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_order_items_orderId"   ON "order_items" ("orderId")`);
    await queryRunner.query(`CREATE INDEX "IDX_order_items_productId" ON "order_items" ("productId")`);

    // cart_items
    await queryRunner.query(`
      CREATE TABLE "cart_items" (
        "id"        uuid      NOT NULL DEFAULT gen_random_uuid(),
        "userId"    uuid      NOT NULL,
        "productId" uuid      NOT NULL,
        "quantity"  integer   NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cart_items" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_cart_items_userId_productId" ON "cart_items" ("userId", "productId")`);
    await queryRunner.query(`CREATE INDEX "IDX_cart_items_userId" ON "cart_items" ("userId")`);

    // Foreign keys
    await queryRunner.query(`
      ALTER TABLE "products"
        ADD CONSTRAINT "FK_products_categoryId"
        FOREIGN KEY ("categoryId") REFERENCES "categories"("id")
        ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "orders"
        ADD CONSTRAINT "FK_orders_userId"
        FOREIGN KEY ("userId") REFERENCES "users"("id")
        ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "order_items"
        ADD CONSTRAINT "FK_order_items_orderId"
        FOREIGN KEY ("orderId") REFERENCES "orders"("id")
        ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "order_items"
        ADD CONSTRAINT "FK_order_items_productId"
        FOREIGN KEY ("productId") REFERENCES "products"("id")
        ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "cart_items"
        ADD CONSTRAINT "FK_cart_items_userId"
        FOREIGN KEY ("userId") REFERENCES "users"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "cart_items"
        ADD CONSTRAINT "FK_cart_items_productId"
        FOREIGN KEY ("productId") REFERENCES "products"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cart_items"  DROP CONSTRAINT "FK_cart_items_productId"`);
    await queryRunner.query(`ALTER TABLE "cart_items"  DROP CONSTRAINT "FK_cart_items_userId"`);
    await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_productId"`);
    await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_orderId"`);
    await queryRunner.query(`ALTER TABLE "orders"      DROP CONSTRAINT "FK_orders_userId"`);
    await queryRunner.query(`ALTER TABLE "products"    DROP CONSTRAINT "FK_products_categoryId"`);

    await queryRunner.query(`DROP INDEX "IDX_order_items_productId"`);
    await queryRunner.query(`DROP INDEX "IDX_order_items_orderId"`);
    await queryRunner.query(`DROP TABLE "order_items"`);

    await queryRunner.query(`DROP INDEX "IDX_orders_userId_createdAt"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_createdAt"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_status"`);
    await queryRunner.query(`DROP TABLE "orders"`);

    await queryRunner.query(`DROP INDEX "IDX_products_categoryId_createdAt"`);
    await queryRunner.query(`DROP INDEX "IDX_products_updatedAt"`);
    await queryRunner.query(`DROP INDEX "IDX_products_createdAt"`);
    await queryRunner.query(`DROP INDEX "IDX_products_name"`);
    await queryRunner.query(`DROP TABLE "products"`);

    await queryRunner.query(`DROP INDEX "IDX_cart_items_userId_productId"`);
    await queryRunner.query(`DROP INDEX "IDX_cart_items_userId"`);
    await queryRunner.query(`DROP TABLE "cart_items"`);

    await queryRunner.query(`DROP TABLE "users"`);

    await queryRunner.query(`DROP INDEX "IDX_categories_slug"`);
    await queryRunner.query(`DROP INDEX "IDX_categories_name"`);
    await queryRunner.query(`DROP TABLE "categories"`);

    await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_usertype_enum"`);
  }
}
