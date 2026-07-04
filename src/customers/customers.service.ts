import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { GetCustomersQueryDto } from './dto/get-customers-query.dto';
import { GetCustomersDropdownQueryDto } from './dto/get-customers-dropdown-query.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customerRepository.create(createCustomerDto);
    return this.customerRepository.save(customer);
  }

  async findAll(query: GetCustomersQueryDto) {
    const { page = 1, limit = 10, search } = query;

    const queryBuilder = this.customerRepository.createQueryBuilder('customer');

    if (search) {
      queryBuilder.andWhere(
        '(customer.name ILike :search OR customer.email ILike :search OR customer.contact_no ILike :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('customer.created_at', 'DESC');
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

  async getDropdownList(query: GetCustomersDropdownQueryDto) {
    const { page = 1, limit = 20, search } = query;

    const queryBuilder = this.customerRepository
      .createQueryBuilder('customer')
      .select(['customer.customer_id', 'customer.name']);

    if (search) {
      queryBuilder.andWhere('customer.name ILike :search', {
        search: `%${search}%`,
      });
    }

    queryBuilder.orderBy('customer.name', 'ASC');
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

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { customer_id: id },
    });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found.`);
    }
    return customer;
  }

  async update(
    id: number,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const customer = await this.findOne(id);

    if (updateCustomerDto.name !== undefined) {
      customer.name = updateCustomerDto.name;
    }
    if (updateCustomerDto.contact_no !== undefined) {
      customer.contact_no = updateCustomerDto.contact_no;
    }
    if (updateCustomerDto.email !== undefined) {
      customer.email = updateCustomerDto.email;
    }
    if (updateCustomerDto.address !== undefined) {
      customer.address = updateCustomerDto.address;
    }

    return this.customerRepository.save(customer);
  }

  async remove(id: number): Promise<void> {
    const customer = await this.findOne(id);
    await this.customerRepository.remove(customer);
  }
}
