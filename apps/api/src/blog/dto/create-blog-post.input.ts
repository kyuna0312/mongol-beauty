import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateBlogPostInput {
  @Field()
  title: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  excerpt?: string;

  @Field({ nullable: true })
  contentHtml?: string;

  @Field({ nullable: true })
  coverImageUrl?: string;

  @Field({ nullable: true, defaultValue: false })
  isPublished?: boolean;
}
