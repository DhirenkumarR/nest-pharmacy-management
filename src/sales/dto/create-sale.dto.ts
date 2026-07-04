import {
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSaleItemDto {
  @IsInt()
  @IsNotEmpty()
  medicine_id: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  quantity: number;
}

export class CreateSaleDto {
  @IsInt()
  @IsNotEmpty()
  customer_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];
}
