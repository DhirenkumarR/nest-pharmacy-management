import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { Admin } from '../../admins/entities/admin.entity';
import { SaleItem } from './sale-item.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn()
  sale_id: number;

  @Column()
  customer_id: number;

  @ManyToOne(() => Customer, (customer) => customer.sales)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column()
  admin_id: number;

  @ManyToOne(() => Admin)
  @JoinColumn({ name: 'admin_id' })
  admin: Admin;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount: number;

  @OneToMany(() => SaleItem, (item) => item.sale, {
    cascade: true,
  })
  items: SaleItem[];

  @CreateDateColumn()
  sale_date: Date;
}