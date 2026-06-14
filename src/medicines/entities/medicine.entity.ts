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
import { ColumnNumericTransformer } from '../../common/transformers/column-numeric.transformer';

@Entity('medicines')
export class Medicine {
  @PrimaryGeneratedColumn()
  medicine_id: number;

  // Specify type: 'integer' to avoid union type metadata inference issues
  @Column({ type: 'integer', nullable: true })
  supplier_id: number | null;

  @ManyToOne(() => Supplier, (supplier) => supplier.medicines, {
    nullable: true,
    onDelete: 'SET NULL', // If supplier is deleted, set supplier_id to null
  })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier | null;

  @Column()
  name: string;

  // Specify type: 'varchar' to avoid union type metadata inference issues
  @Column({ type: 'varchar', nullable: true })
  generic_name: string | null;

  @Column({ type: 'varchar', nullable: true })
  manufacturer: string | null;

  @Column()
  drug_type: string;

  @Column({ type: 'varchar', nullable: true })
  batch_no: string | null;

  @Column({ type: 'date', nullable: true })
  expiry_date: Date | null;

  @Column({ default: 0 })
  quantity: number;

  // Decimal columns return as strings in pg. We use ColumnNumericTransformer to convert to number.
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  purchase_price: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  selling_price: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
