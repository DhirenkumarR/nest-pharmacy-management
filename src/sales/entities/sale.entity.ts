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
import { ColumnNumericTransformer } from '../../common/transformers/column-numeric.transformer';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn()
  sale_id: number;

  @Column()
  customer_id: number;

  // Sale belongs to Customer
  @ManyToOne(() => Customer, (customer) => customer.sales, {
    nullable: false,
    onDelete: 'RESTRICT', // Prevent deleting a customer if they have sales history
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column()
  admin_id: number;

  // Sale belongs to Admin
  @ManyToOne(() => Admin, {
    nullable: false,
    onDelete: 'RESTRICT', // Prevent deleting an admin if they have registered sales
  })
  @JoinColumn({ name: 'admin_id' })
  admin: Admin;

  // Total amount is decimal. We use ColumnNumericTransformer to map it to a JS number.
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  total_amount: number;

  // Sale has many SaleItems (cascade ensures items are saved/updated automatically when Sale is saved)
  @OneToMany(() => SaleItem, (item) => item.sale, {
    cascade: true,
  })
  items: SaleItem[];

  @CreateDateColumn()
  sale_date: Date;
}
