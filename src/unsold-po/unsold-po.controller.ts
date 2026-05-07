import { Body, Controller, Post } from '@nestjs/common';
import { UnsoldPoQueryDto } from './dto/unsold-po-query.dto';
import { UnsoldPoService } from './unsold-po.service';

@Controller('unsold-po')
export class UnsoldPoController {
  constructor(private readonly service: UnsoldPoService) {}

  @Post('by-buyer')
  getByBuyer(@Body() dto: UnsoldPoQueryDto) {
    return this.service.getByBuyer(dto.buyerCode);
  }
}
