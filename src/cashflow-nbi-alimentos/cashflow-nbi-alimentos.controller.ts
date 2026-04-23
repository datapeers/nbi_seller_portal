import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CashflowNbiAlimentosService } from './cashflow-nbi-alimentos.service';
import { QueryParams } from 'src/dashboard/types/queryParams.type';
import { UserDecorator } from 'src/auth/decorators/user.decorator';
import { LocalAuthGuard } from 'src/auth/guard/local.guard';

@Controller('cashflow-nbi-alimentos')
export class CashflowNbiAlimentosController {
  constructor(
    private readonly cashflowNbiAlimentosService: CashflowNbiAlimentosService,
  ) {}

  @Post('collections')
  @UseGuards(LocalAuthGuard)
  async getCollections(
    @Body() query: QueryParams,
    @UserDecorator() user: any,
  ): Promise<any[]> {
    return await this.cashflowNbiAlimentosService.executeQuery(
      { name: 'Collections NBIAlimentos', params: query.params },
      user,
    );
  }

  @Post('billings-latam')
  @UseGuards(LocalAuthGuard)
  async getBillingsLatam(
    @Body() query: QueryParams,
    @UserDecorator() user: any,
  ): Promise<any[]> {
    return await this.cashflowNbiAlimentosService.executeQuery(
      { name: 'Billings Latam NBIAlimentos', params: query.params },
      user,
    );
  }

  @Post('billings-domestic')
  @UseGuards(LocalAuthGuard)
  async getBillingsDomestic(
    @Body() query: QueryParams,
    @UserDecorator() user: any,
  ): Promise<any[]> {
    return await this.cashflowNbiAlimentosService.executeQuery(
      { name: 'Billings Domestic NBIAlimentos', params: query.params },
      user,
    );
  }

  @Post('meat-purchases')
  @UseGuards(LocalAuthGuard)
  async getMeatPurchases(
    @Body() query: QueryParams,
    @UserDecorator() user: any,
  ): Promise<any[]> {
    return await this.cashflowNbiAlimentosService.executeQuery(
      { name: 'Meat Purchases NBIAlimentos', params: query.params },
      user,
    );
  }

  @Post('othercost-latam')
  @UseGuards(LocalAuthGuard)
  async getOthercostLatam(
    @Body() query: QueryParams,
    @UserDecorator() user: any,
  ): Promise<any[]> {
    return await this.cashflowNbiAlimentosService.executeQuery(
      { name: 'Othercost Latam NBIAlimentos', params: query.params },
      user,
    );
  }

  @Post('othercost-domestic')
  @UseGuards(LocalAuthGuard)
  async getOthercostDomestic(
    @Body() query: QueryParams,
    @UserDecorator() user: any,
  ): Promise<any[]> {
    return await this.cashflowNbiAlimentosService.executeQuery(
      { name: 'Othercost Domestic NBIAlimentos', params: query.params },
      user,
    );
  }
}
