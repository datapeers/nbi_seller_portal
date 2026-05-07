import { IsInt } from 'class-validator';

export class UnsoldPoQueryDto {
  @IsInt()
  buyerCode: number;
}
