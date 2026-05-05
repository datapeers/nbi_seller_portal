import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class EmailDetailItemDto {
  @IsNumber()
  PO: number;

  @IsOptional()
  @IsString()
  Product?: string;

  @IsOptional()
  @IsString()
  Vendor?: string;

  @IsOptional()
  @IsString()
  Consignee?: string;

  @IsOptional()
  @IsString()
  ShipDate?: string;

  @IsOptional()
  @IsString()
  DeliveryType?: string;

  @IsOptional()
  @IsObject()
  extraData?: Record<string, any>;
}

export class GenerateEmailDto {
  @IsOptional()
  @IsString()
  BuyerCode?: string;

  @IsOptional()
  @IsString()
  BuyerName?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => EmailDetailItemDto)
  details: EmailDetailItemDto[];
}
