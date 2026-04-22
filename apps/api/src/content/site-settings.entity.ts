import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('site_settings')
export class SiteSettings {
  @Field()
  @PrimaryColumn({ default: 'default' })
  id: string;

  @Field()
  @Column({ default: 'ХХБ' })
  bankName: string;

  @Field()
  @Column({ default: '1234567890' })
  bankAccount: string;

  @Field()
  @Column({ default: 'Mongol Beauty LLC' })
  bankOwner: string;

  @Field()
  @Column({ default: '9911-2233' })
  phone: string;

  @Field()
  @Column({ default: 'info@incellderm.mn' })
  email: string;

  @Field()
  @Column({ default: 'Улаанбаатар хот, Монгол улс' })
  address: string;

  @Field()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
