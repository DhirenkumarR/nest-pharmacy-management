import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Medicine } from '../../medicines/entities/medicine.entity';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn()
  supplier_id: number;

  @Column()
  name: string;

  // These fields are optional/nullable in the DB, so their TS type includes '| null'.
  // We specify type: 'varchar' explicitly because reflect-metadata infers union types (like string | null) as 'Object' which TypeORM doesn't support for basic columns.
  @Column({ type: 'varchar', nullable: true })
  contact_no: string | null;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  address: string | null;

  // Supplier can have many medicines associated with it
  @OneToMany(() => Medicine, (medicine) => medicine.supplier)
  medicines: Medicine[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
