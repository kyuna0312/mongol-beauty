import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('blog_posts')
export class BlogPost {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  title: string;

  @Field()
  @Index({ unique: true })
  @Column()
  slug: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  excerpt: string | null;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  contentHtml: string | null;

  @Field({ nullable: true })
  @Column({ nullable: true })
  coverImageUrl: string | null;

  @Field()
  @Column({ default: false })
  isPublished: boolean;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date | null;

  @Field({ nullable: true })
  @Column({ nullable: true })
  authorId: string | null;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
