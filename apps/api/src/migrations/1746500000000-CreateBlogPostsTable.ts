import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBlogPostsTable1746500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "blog_posts" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "excerpt" text,
        "contentHtml" text,
        "coverImageUrl" character varying,
        "isPublished" boolean NOT NULL DEFAULT false,
        "publishedAt" TIMESTAMP,
        "authorId" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_blog_posts_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_blog_posts" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_blog_posts_isPublished" ON "blog_posts" ("isPublished")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_blog_posts_isPublished"`);
    await queryRunner.query(`DROP TABLE "blog_posts"`);
  }
}
