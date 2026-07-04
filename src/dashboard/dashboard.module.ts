import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Medicine } from '../medicines/entities/medicine.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Sale } from '../sales/entities/sale.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Medicine, Supplier, Customer, Sale])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
