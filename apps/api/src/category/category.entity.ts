import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Product } from '../product/product.entity';

@ObjectType()
@Entity('categories')
export class Category {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Index()
  @Column()
  name: string;

  @Field()
  @Index()
  @Column({ unique: true })
  slug: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  imageUrl: string;

  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category, (cat) => cat.children, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parentId' })
  parent?: Category;

  @Column({ nullable: true })
  parentId?: string;

  @Field(() => [Category])
  @OneToMany(() => Category, (cat) => cat.parent)
  children: Category[];

  @Field(() => [Product])
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
