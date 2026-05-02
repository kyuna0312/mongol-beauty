import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { User } from '../user/user.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  WAITING_PAYMENT = 'WAITING_PAYMENT',
  // Keep persisted value as CONFIRMED for DB compatibility.
  PAID_CONFIRMED = 'CONFIRMED',
  SHIPPING = 'SHIPPING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
}

registerEnumType(PaymentMethod, { name: 'PaymentMethod' });

@ObjectType()
@Entity('orders')
@Index('IDX_orders_userId_createdAt', ['userId', 'createdAt'])
export class Order {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => [OrderItem])
  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items: OrderItem[];

  @Field()
  @Column('int')
  totalPrice: number;

  @Field(() => OrderStatus)
  @Index()
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.WAITING_PAYMENT,
  })
  status: OrderStatus;

  @Field({ nullable: true })
  @Column({ nullable: true })
  paymentReceiptUrl: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  deliveryAddress: string;

  @Column({ nullable: true, unique: true })
  idempotencyKey?: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.orders, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @Field(() => [String])
  @Column({ type: 'simple-array', default: '' })
  notes: string[];

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  deliveryFee: number;

  @Field(() => PaymentMethod)
  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.BANK_TRANSFER,
  })
  paymentMethod: PaymentMethod;

  @Field({ nullable: true })
  @Column({ nullable: true })
  supplierName?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  koreaTrackingId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  estimatedDays?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  deliveryNote: string | null;

  @Field()
  @Index()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
