import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('pages')
export class Page {
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

  @Field()
  @Column({ type: 'text', default: '' })
  content: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  metaTitle?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  metaDescription?: string;

  @Field()
  @Column({ default: true })
  isPublished: boolean;

  @Field()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
