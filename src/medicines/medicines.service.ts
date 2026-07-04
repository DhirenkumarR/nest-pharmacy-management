import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medicine } from './entities/medicine.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { GetMedicinesQueryDto } from './dto/get-medicines-query.dto';
import { GetMedicinesDropdownQueryDto } from './dto/get-medicines-dropdown-query.dto';

@Injectable()
export class MedicinesService {
  constructor(
    @InjectRepository(Medicine)
    private readonly medicineRepository: Repository<Medicine>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async create(createMedicineDto: CreateMedicineDto): Promise<Medicine> {
    const { supplier_id, expiry_date, ...rest } = createMedicineDto;

    const medicine = this.medicineRepository.create({
      ...rest,
      expiry_date: expiry_date ? new Date(expiry_date) : null,
    });

    if (supplier_id) {
      const supplier = await this.supplierRepository.findOne({
        where: { supplier_id },
      });
      if (!supplier) {
        throw new NotFoundException(
          `Supplier with ID ${supplier_id} not found.`,
        );
      }
      medicine.supplier_id = supplier_id;
      medicine.supplier = supplier;
    } else {
      medicine.supplier_id = null;
      medicine.supplier = null;
    }

    return this.medicineRepository.save(medicine);
  }

  async findAll(query: GetMedicinesQueryDto) {
    const { page = 1, limit = 10, search, drug_type, supplier_id } = query;

    const queryBuilder = this.medicineRepository
      .createQueryBuilder('medicine')
      .leftJoinAndSelect('medicine.supplier', 'supplier');

    if (search) {
      queryBuilder.andWhere(
        '(medicine.name ILike :search OR medicine.generic_name ILike :search OR medicine.manufacturer ILike :search OR medicine.batch_no ILike :search)',
        { search: `%${search}%` },
      );
    }

    if (drug_type) {
      queryBuilder.andWhere('medicine.drug_type = :drug_type', { drug_type });
    }

    if (supplier_id) {
      queryBuilder.andWhere('medicine.supplier_id = :supplier_id', {
        supplier_id,
      });
    }

    queryBuilder.orderBy('medicine.created_at', 'DESC');
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

  async getDropdownList(query: GetMedicinesDropdownQueryDto) {
    const { page = 1, limit = 20, search } = query;

    const queryBuilder = this.medicineRepository
      .createQueryBuilder('medicine')
      .select([
        'medicine.medicine_id',
        'medicine.name',
        'medicine.generic_name',
        'medicine.selling_price',
        'medicine.quantity',
        'medicine.batch_no',
        'medicine.expiry_date',
      ]);

    if (search) {
      queryBuilder.andWhere(
        '(medicine.name ILike :search OR medicine.generic_name ILike :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('medicine.name', 'ASC');
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

  async findOne(id: number): Promise<Medicine> {
    const medicine = await this.medicineRepository.findOne({
      where: { medicine_id: id },
      relations: { supplier: true },
    });

    if (!medicine) {
      throw new NotFoundException(`Medicine with ID ${id} not found.`);
    }

    return medicine;
  }

  async update(
    id: number,
    updateMedicineDto: UpdateMedicineDto,
  ): Promise<Medicine> {
    const medicine = await this.findOne(id);
    const { supplier_id, expiry_date, ...rest } = updateMedicineDto;

    if (supplier_id !== undefined) {
      if (supplier_id === null) {
        medicine.supplier_id = null;
        medicine.supplier = null;
      } else {
        const supplier = await this.supplierRepository.findOne({
          where: { supplier_id },
        });
        if (!supplier) {
          throw new NotFoundException(
            `Supplier with ID ${supplier_id} not found.`,
          );
        }
        medicine.supplier_id = supplier_id;
        medicine.supplier = supplier;
      }
    }

    if (rest.name !== undefined) {
      medicine.name = rest.name;
    }
    if (rest.generic_name !== undefined) {
      medicine.generic_name = rest.generic_name;
    }
    if (rest.manufacturer !== undefined) {
      medicine.manufacturer = rest.manufacturer;
    }
    if (rest.drug_type !== undefined) {
      medicine.drug_type = rest.drug_type;
    }
    if (rest.batch_no !== undefined) {
      medicine.batch_no = rest.batch_no;
    }
    if (expiry_date !== undefined) {
      medicine.expiry_date = expiry_date ? new Date(expiry_date) : null;
    }
    if (rest.quantity !== undefined) {
      medicine.quantity = rest.quantity;
    }
    if (rest.purchase_price !== undefined) {
      medicine.purchase_price = rest.purchase_price;
    }
    if (rest.selling_price !== undefined) {
      medicine.selling_price = rest.selling_price;
    }

    return this.medicineRepository.save(medicine);
  }

  async remove(id: number): Promise<void> {
    const medicine = await this.findOne(id);
    await this.medicineRepository.remove(medicine);
  }
}
