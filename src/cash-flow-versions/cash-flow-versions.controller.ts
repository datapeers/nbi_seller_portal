import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
} from '@nestjs/common';
import { CashFlowVersionsService } from './cash-flow-versions.service';
import { CreateCashFlowVersionDto } from './dto/create-cash-flow-version.dto';

@Controller('cash-flow-versions')
export class CashFlowVersionsController {
    constructor(
        private readonly cashFlowVersionsService: CashFlowVersionsService,
    ) { }

    @Post()
    create(@Body() createCashFlowVersionDto: CreateCashFlowVersionDto) {
        return this.cashFlowVersionsService.create(createCashFlowVersionDto);
    }

    @Get()
    findAll() {
        return this.cashFlowVersionsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.cashFlowVersionsService.findOne(+id);
    }

    @Get('seller/:sellerCode')
    findBySellerCode(@Param('sellerCode') sellerCode: string) {
        return this.cashFlowVersionsService.findBySellerCode(sellerCode);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.cashFlowVersionsService.remove(+id);
    }
}
