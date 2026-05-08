import { IsInt, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class AssignmentItemDto {
  @IsString()
  poNumber: string;

  @IsString()
  jobCode: string;

  @IsInt()
  sellerCode: number;

  @IsNumber()
  @IsPositive()
  assignedLbs: number;

  @IsInt()
  buyerCode: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  availableLbs?: number;
}
