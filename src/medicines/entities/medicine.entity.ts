import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Supplier } from '../../suppliers/entities/supplier.entity';

@Entity('medicines')
export class Medicine {
  @PrimaryGeneratedColumn()
  medicine_id: number;

  @Column({ nullable: true })
  supplier_id: number;

  @ManyToOne(() => Supplier, (supplier) => supplier.medicines, {
    nullable: true,
  })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @Column()
  name: string;

  @Column({ nullable: true })
  generic_name: string;

  @Column({ nullable: true })
  manufacturer: string;

  @Column()
  drug_type: string;

  @Column({ nullable: true })
  batch_no: string;

  @Column({ type: 'date', nullable: true })
  expiry_date: Date;

  @Column({ default: 0 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  purchase_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  selling_price: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}