import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Sale } from '../../sales/entities/sale.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  customer_id: number;

  @Column()
  name: string;

  // Optional fields inside the DB, typed as 'string | null' in TS
  // Specify type: 'varchar' explicitly to avoid union type metadata inference issues
  @Column({ type: 'varchar', nullable: true })
  contact_no: string | null;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  address: string | null;

  // Customer has a OneToMany relationship to Sales
  @OneToMany(() => Sale, (sale) => sale.customer)
  sales: Sale[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
