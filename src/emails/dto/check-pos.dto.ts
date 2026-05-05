import { ArrayMinSize, IsArray, IsNumber } from 'class-validator';

export class CheckPosDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  pos: number[];
}
