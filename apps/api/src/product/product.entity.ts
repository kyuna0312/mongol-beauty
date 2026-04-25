import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { Category } from '../category/category.entity';

export enum SkinType {
  OILY = 'OILY',
  DRY = 'DRY',
  COMBINATION = 'COMBINATION',
  SENSITIVE = 'SENSITIVE',
  NORMAL = 'NORMAL',
}

export enum Feature {
  ANTI_AGING = 'ANTI_AGING',
  HYDRATING = 'HYDRATING',
  BRIGHTENING = 'BRIGHTENING',
  ACNE_FIGHTING = 'ACNE_FIGHTING',
  SUNSCREEN = 'SUNSCREEN',
  ORGANIC = 'ORGANIC',
}

registerEnumType(SkinType, { name: 'SkinType' });
registerEnumType(Feature, { name: 'Feature' });

@ObjectType()
export class ProductsPage {
  @Field(() => [Product])
  items: Product[];

  @Field(() => Int)
  totalCount: number;
}

@ObjectType()
@Entity('products')
@Index('IDX_products_categoryId_createdAt', ['categoryId', 'createdAt'])
export class Product {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Index()
  @Column()
  name: string;

  @Field(() => Category)
  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  categoryId: string;

  @Field()
  @Column('int')
  price: number;

  @Field({ nullable: true })
  discountedPrice?: number; // Calculated field for subscribed users

  @Field()
  @Column('int', { default: 0 })
  stock: number;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  descriptionHtml?: string;

  @Field(() => [SkinType])
  @Column('simple-array', { default: '' })
  skinType: SkinType[];

  @Field(() => [Feature])
  @Column('simple-array', { default: '' })
  features: Feature[];

  @Field(() => [String])
  @Column('simple-array', { default: '' })
  images: string[];

  @Field()
  @Column({ default: false })
  isKoreanProduct: boolean;

  @Field()
  @Index()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Index()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
