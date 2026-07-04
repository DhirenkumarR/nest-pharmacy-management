import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsNumber,
  IsDateString,
  IsEnum,
} from 'class-validator';

export enum DrugType {
  TABLET = 'tablet',
  CAPSULE = 'capsule',
  SYRUP = 'syrup',
  INJECTION = 'injection',
  GEL = 'gel',
  POWDER = 'powder',
  OINTMENT = 'ointment',
  DROP = 'drop',
  OTHER = 'other',
}

export class CreateMedicineDto {
  @IsInt()
  @IsOptional()
  supplier_id?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

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
  @IsNotEmpty()
  drug_type: DrugType;

  @IsString()
  @IsOptional()
  batch_no?: string;

  @IsDateString()
  @IsOptional()
  expiry_date?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  quantity?: number = 0;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  purchase_price: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  selling_price: number;
}
