import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsNumber,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { DrugType } from './create-medicine.dto';

export class UpdateMedicineDto {
  @IsInt()
  @IsOptional()
  supplier_id?: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  generic_name?: string;

  @IsString()
  @IsOptional()
  manufacturer?: string;

  @IsEnum(DrugType, {
    message:
      'drug_type must be one of: tablet, capsule, syrup, injection, gel, powder, ointment, drop, other',
  })
  @IsOptional()
  drug_type?: DrugType;

  @IsString()
  @IsOptional()
  batch_no?: string;

  @IsDateString()
  @IsOptional()
  expiry_date?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  purchase_price?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  selling_price?: number;
}
