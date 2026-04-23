import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CashflowNorthernService } from './cashflow-northern.service';
import { QueryParams } from 'src/dashboard/types/queryParams.type';
import { UserDecorator } from 'src/auth/decorators/user.decorator';
import { LocalAuthGuard } from 'src/auth/guard/local.guard';

@Controller('cashflow-northern')
export class CashflowNorthernController {
  constructor(
    private readonly cashflowNorthernService: CashflowNorthernService,
  ) {}

  @Post('collections')
  @UseGuards(LocalAuthGuard)
  async getCollections(
    @Body() query: QueryParams,
    @UserDecorator() user: any,
  ): Promise<any[]> {
    return await this.cashflowNorthernService.executeQuery(
      { name: 'Collections', params: query.params },
      user,
    );
  }

  @Post('billings-latam')
  @UseGuards(LocalAuthGuard)
  async getBillingsLatam(
    @Body() query: QueryParams,
    @UserDecorator() user: any,
  ): Promise<any[]> {
    return await this.cashflowNorthernService.executeQuery(
      { name: 'Billings Latam', params: query.params },
      user,
    );
  }

  @Post('billings-domestic')
  @UseGuards(LocalAuthGuard)
  async getBillingsDomestic(
    @Body() query: QueryParams,
    @UserDecorator() user: any,
  ): Promise<any[]> {
    return await this.cashflowNorthernService.executeQuery(
      { name: 'Billings Domestic', params: query.params },
      user,
    );
  }

  @Post('meat-purchases')
  @UseGuards(LocalAuthGuard)
  async getMeatPurchases(
    @Body() query: QueryParams,
    @UserDecorator() user: any,
  ): Promise<any[]> {
    return await this.cashflowNorthernService.executeQuery(
      { name: 'Meat Purchases', params: query.params },
      user,
    );
  }

  @Post('othercost-latam')
  @UseGuards(LocalAuthGuard)
  async getOthercostLatam(
    @Body() query: QueryParams,
    @UserDecorator() user: any,
  ): Promise<any[]> {
    return await this.cashflowNorthernService.executeQuery(
      { name: 'Othercost Latam', params: query.params },
      user,
    );
  }

  @Post('othercost-domestic')
  @UseGuards(LocalAuthGuard)
  async getOthercostDomestic(
    @Body() query: QueryParams,
    @UserDecorator() user: any,
  ): Promise<any[]> {
    return await this.cashflowNorthernService.executeQuery(
      { name: 'Othercost Domestic', params: query.params },
      user,
    );
  }
}
