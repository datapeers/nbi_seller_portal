import { IsEmail, IsNumber, IsNumberString, IsString } from 'class-validator';

export class CreateSellerDto {
  @IsNumberString()
  code: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
