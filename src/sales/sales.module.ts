import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Medicine } from '../medicines/entities/medicine.entity';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, SaleItem, Customer, Medicine])],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [TypeOrmModule],
})
export class SalesModule {}
