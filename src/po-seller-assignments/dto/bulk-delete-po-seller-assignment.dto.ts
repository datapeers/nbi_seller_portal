import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsString, ValidateNested } from 'class-validator';

export class DeleteAssignmentItemDto {
  @IsString()
  jobCode: string;

  @IsInt()
  sellerCode: number;
}

export class BulkDeletePoSellerAssignmentDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DeleteAssignmentItemDto)
  assignments: DeleteAssignmentItemDto[];
}
