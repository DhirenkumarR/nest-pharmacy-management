import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Medicine } from '../medicines/entities/medicine.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { GetSalesQueryDto } from './dto/get-sales-query.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createSaleDto: CreateSaleDto, adminId: number): Promise<Sale> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Verify customer exists
      const customer = await queryRunner.manager.findOne(Customer, {
        where: { customer_id: createSaleDto.customer_id },
      });
      if (!customer) {
        throw new NotFoundException(
          `Customer with ID ${createSaleDto.customer_id} not found.`,
        );
      }

      let totalAmount = 0;
      const saleItems: SaleItem[] = [];

      // 2. Validate and process each item
      for (const item of createSaleDto.items) {
        const medicine = await queryRunner.manager.findOne(Medicine, {
          where: { medicine_id: item.medicine_id },
        });

        if (!medicine) {
          throw new NotFoundException(
            `Medicine with ID ${item.medicine_id} not found.`,
          );
        }

        if (medicine.quantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for medicine "${medicine.name}". Available: ${medicine.quantity}, Requested: ${item.quantity}`,
          );
        }

        // Deduct inventory stock
        medicine.quantity -= item.quantity;
        await queryRunner.manager.save(Medicine, medicine);

        const price = medicine.selling_price;
        const subtotal = price * item.quantity;
        totalAmount += subtotal;

        const saleItem = queryRunner.manager.create(SaleItem, {
          medicine_id: medicine.medicine_id,
          medicine_name: medicine.name,
          quantity: item.quantity,
          price,
          subtotal,
        });
        saleItems.push(saleItem);
      }

      // 3. Save the Sale & Items
      const sale = queryRunner.manager.create(Sale, {
        customer_id: createSaleDto.customer_id,
        admin_id: adminId,
        total_amount: totalAmount,
        items: saleItems,
      });

      const savedSale = await queryRunner.manager.save(Sale, sale);

      await queryRunner.commitTransaction();

      // Return details with loaded relations
      return this.findOne(savedSale.sale_id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: GetSalesQueryDto) {
    const { page = 1, limit = 10, search } = query;

    const queryBuilder = this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.customer', 'customer')
      .leftJoinAndSelect('sale.admin', 'admin')
      .leftJoinAndSelect('sale.items', 'items');

    if (search) {
      queryBuilder.andWhere(
        '(customer.name ILike :search OR admin.name ILike :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('sale.sale_date', 'DESC');
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    const last_page = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        last_page,
        limit,
      },
    };
  }

  async findOne(id: number): Promise<Sale> {
    const sale = await this.saleRepository.findOne({
      where: { sale_id: id },
      relations: {
        customer: true,
        admin: true,
        items: true,
      },
    });

    if (!sale) {
      throw new NotFoundException(`Sale transaction with ID ${id} not found.`);
    }

    return sale;
  }
}
