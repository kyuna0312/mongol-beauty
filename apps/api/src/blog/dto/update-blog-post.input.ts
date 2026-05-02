import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateBlogPostInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  excerpt?: string;

  @Field({ nullable: true })
  contentHtml?: string;

  @Field({ nullable: true })
  coverImageUrl?: string;

  @Field({ nullable: true })
  isPublished?: boolean;
}
