import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Sale } from './sale.entity';
import { Medicine } from '../../medicines/entities/medicine.entity';
import { ColumnNumericTransformer } from '../../common/transformers/column-numeric.transformer';

@Entity('sale_items')
export class SaleItem {
  @PrimaryGeneratedColumn()
  sale_item_id: number;

  @Column()
  sale_id: number;

  // SaleItem belongs to Sale
  @ManyToOne(() => Sale, (sale) => sale.items, {
    nullable: false,
    onDelete: 'CASCADE', // Delete sale items if the main sale is deleted
  })
  @JoinColumn({ name: 'sale_id' })
  sale: Sale;

  @Column()
  medicine_id: number;

  // SaleItem belongs to Medicine
  @ManyToOne(() => Medicine, {
    nullable: false,
    onDelete: 'RESTRICT', // Prevent deleting a medicine if there is sales history referencing it
  })
  @JoinColumn({ name: 'medicine_id' })
  medicine: Medicine;

  @Column()
  medicine_name: string;

  @Column()
  quantity: number;

  // Price and subtotal are decimals. We use ColumnNumericTransformer to map them to JS numbers.
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  price: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  subtotal: number;
}
