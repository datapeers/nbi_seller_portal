import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BulkCreatePoSellerAssignmentDto } from './dto/bulk-create-po-seller-assignment.dto';
import { PoSellerAssignmentsService } from './po-seller-assignments.service';

@Controller('po-seller-assignments')
export class PoSellerAssignmentsController {
  constructor(private readonly service: PoSellerAssignmentsService) {}

  @Post()
  bulkCreate(@Body() dto: BulkCreatePoSellerAssignmentDto) {
    return this.service.bulkCreate(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':poNumber')
  findByPoNumber(@Param('poNumber') poNumber: string) {
    return this.service.findByPoNumber(poNumber);
  }
}
