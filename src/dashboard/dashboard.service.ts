import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medicine } from '../medicines/entities/medicine.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Sale } from '../sales/entities/sale.entity';

interface DailyRawItem {
  date: string;
  revenue: string;
  sales: string;
}

interface WeeklyRawItem {
  week: string;
  revenue: string;
  sales: string;
}

interface MonthlyRawItem {
  month: string;
  revenue: string;
  sales: string;
}

interface RevenueRawResult {
  sum: string | null;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Medicine)
    private readonly medicineRepository: Repository<Medicine>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
  ) {}

  async getStats() {
    // 1. Compile primary dashboard counts
    const totalMedicines = await this.medicineRepository.count();

    const lowStockMedicines = await this.medicineRepository
      .createQueryBuilder('medicine')
      .where('medicine.quantity < 10')
      .getCount();

    const outOfStockMedicines = await this.medicineRepository
      .createQueryBuilder('medicine')
      .where('medicine.quantity = 0')
      .getCount();

    const totalSuppliers = await this.supplierRepository.count();
    const totalCustomers = await this.customerRepository.count();
    const totalSales = await this.saleRepository.count();

    const revenueResult = (await this.saleRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.total_amount)', 'sum')
      .getRawOne()) as RevenueRawResult;
    const totalRevenue = parseFloat(revenueResult?.sum ?? '0') || 0;

    // 2. Fetch Daily sales (past 30 days)
    const dailyRaw = (await this.saleRepository
      .createQueryBuilder('sale')
      .select("TO_CHAR(sale.sale_date, 'YYYY-MM-DD')", 'date')
      .addSelect('SUM(sale.total_amount)', 'revenue')
      .addSelect('COUNT(sale.sale_id)', 'sales')
      .where("sale.sale_date >= NOW() - INTERVAL '30 days'")
      .groupBy("TO_CHAR(sale.sale_date, 'YYYY-MM-DD')")
      .orderBy('date', 'ASC')
      .getRawMany()) as unknown as DailyRawItem[];

    const daily = dailyRaw.map((d) => ({
      date: d.date,
      revenue: parseFloat(d.revenue) || 0,
      sales: parseInt(d.sales, 10) || 0,
    }));

    // 3. Fetch Weekly sales (past 12 weeks)
    const weeklyRaw = (await this.saleRepository
      .createQueryBuilder('sale')
      .select("TO_CHAR(sale.sale_date, 'IYYY-IW')", 'week')
      .addSelect('SUM(sale.total_amount)', 'revenue')
      .addSelect('COUNT(sale.sale_id)', 'sales')
      .where("sale.sale_date >= NOW() - INTERVAL '12 weeks'")
      .groupBy("TO_CHAR(sale.sale_date, 'IYYY-IW')")
      .orderBy('week', 'ASC')
      .getRawMany()) as unknown as WeeklyRawItem[];

    const weekly = weeklyRaw.map((w) => ({
      week: w.week,
      revenue: parseFloat(w.revenue) || 0,
      sales: parseInt(w.sales, 10) || 0,
    }));

    // 4. Fetch Monthly sales (past 12 months)
    const monthlyRaw = (await this.saleRepository
      .createQueryBuilder('sale')
      .select("TO_CHAR(sale.sale_date, 'YYYY-MM')", 'month')
      .addSelect('SUM(sale.total_amount)', 'revenue')
      .addSelect('COUNT(sale.sale_id)', 'sales')
      .where("sale.sale_date >= NOW() - INTERVAL '12 months'")
      .groupBy("TO_CHAR(sale.sale_date, 'YYYY-MM')")
      .orderBy('month', 'ASC')
      .getRawMany()) as unknown as MonthlyRawItem[];

    const monthly = monthlyRaw.map((m) => ({
      month: m.month,
      revenue: parseFloat(m.revenue) || 0,
      sales: parseInt(m.sales, 10) || 0,
    }));

    return {
      stats: {
        totalMedicines,
        lowStockMedicines,
        outOfStockMedicines,
        totalSuppliers,
        totalCustomers,
        totalSales,
        totalRevenue,
      },
      graphs: {
        daily,
        weekly,
        monthly,
      },
    };
  }
}
