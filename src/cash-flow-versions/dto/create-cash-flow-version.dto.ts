import { IsNotEmpty, IsString, IsObject, IsOptional } from 'class-validator';

export class CreateCashFlowVersionDto {
    @IsString()
    @IsNotEmpty()
    nameVersion: string;

    @IsObject()
    @IsNotEmpty()
    data: any;

    @IsString()
    @IsNotEmpty()
    sellerCode: string;
}
