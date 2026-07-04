import { IsString, IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { DrugType } from './create-medicine.dto';

export class GetMedicinesQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(DrugType)
  drug_type?: DrugType;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  supplier_id?: number;
}
