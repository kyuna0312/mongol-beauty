import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Order } from '../order/order.entity';

export enum UserType {
  USER = 'USER',
  SUBSCRIBED_USER = 'SUBSCRIBED_USER',
  ADMIN = 'ADMIN',
}

registerEnumType(UserType, {
  name: 'UserType',
});

@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ nullable: true })
  @Column({ nullable: true, unique: true })
  phone: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true, unique: true })
  email: string;

  @Column({ nullable: true })
  password: string; // Hashed password, not exposed in GraphQL

  @Field(() => UserType)
  @Column({ type: 'enum', enum: UserType, default: UserType.USER })
  userType: UserType;

  @Field()
  @Column({ default: false })
  isAdmin: boolean; // Keep for backward compatibility

  @Column({ nullable: true })
  passwordResetToken: string;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires: Date;

  @Field(() => [Order])
  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @Field()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
