import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { GetSuppliersQueryDto } from './dto/get-suppliers-query.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    const supplier = this.supplierRepository.create(createSupplierDto);
    return this.supplierRepository.save(supplier);
  }

  async findAll(query: GetSuppliersQueryDto) {
    const { page = 1, limit = 10, search } = query;

    const where = search
      ? [
          { name: ILike(`%${search}%`) },
          { email: ILike(`%${search}%`) },
          { contact_no: ILike(`%${search}%`) },
        ]
      : {};

    const [data, total] = await this.supplierRepository.findAndCount({
      where,
      order: {
        created_at: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

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

  async getDropdownList() {
    return this.supplierRepository.find({
      select: {
        supplier_id: true,
        name: true,
      },
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { supplier_id: id },
    });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found.`);
    }
    return supplier;
  }

  async update(
    id: number,
    updateSupplierDto: UpdateSupplierDto,
  ): Promise<Supplier> {
    const supplier = await this.findOne(id);

    if (updateSupplierDto.name !== undefined) {
      supplier.name = updateSupplierDto.name;
    }
    if (updateSupplierDto.contact_no !== undefined) {
      supplier.contact_no = updateSupplierDto.contact_no;
    }
    if (updateSupplierDto.email !== undefined) {
      supplier.email = updateSupplierDto.email;
    }
    if (updateSupplierDto.address !== undefined) {
      supplier.address = updateSupplierDto.address;
    }

    return this.supplierRepository.save(supplier);
  }

  async remove(id: number): Promise<void> {
    const supplier = await this.findOne(id);
    await this.supplierRepository.remove(supplier);
  }
}
