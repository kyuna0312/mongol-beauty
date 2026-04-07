import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpsertPageInput {
  @Field()
  slug: string;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field({ nullable: true })
  metaTitle?: string;

  @Field({ nullable: true })
  metaDescription?: string;

  @Field({ nullable: true })
  isPublished?: boolean;
}
