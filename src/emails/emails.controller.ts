import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CheckPosDto } from './dto/check-pos.dto';
import { GenerateEmailDto } from './dto/generate-email.dto';
import { EmailsService } from './emails.service';

@Controller('emails')
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  @Post('generate')
  generate(@Body() dto: GenerateEmailDto) {
    return this.emailsService.generate(dto);
  }

  @Post('check-pos')
  checkPos(@Body() dto: CheckPosDto) {
    return this.emailsService.checkPos(dto);
  }

  @Get(':id_email')
  findById(@Param('id_email', ParseIntPipe) idEmail: number) {
    return this.emailsService.findById(idEmail);
  }
}
