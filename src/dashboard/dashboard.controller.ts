import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { QueryParams } from './types/queryParams.type';
import { UserDecorator } from 'src/auth/decorators/user.decorator';
import { LocalAuthGuard } from 'src/auth/guard/local.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  @UseGuards(LocalAuthGuard)
  async getData(
    @Body() query: QueryParams,
    @UserDecorator() user: any,
  ): Promise<any[]> {
    return await this.dashboardService.getViewDate(query, user);
  }

  @Post('open')
  async getDate(
    @Body() query: QueryParams,
    @UserDecorator() user: any,
  ): Promise<any[]> {
    if (!['Fiscal year and month', 'Fiscal week'].includes(query.name)) {
      throw new UnauthorizedException(
        'No tienes permisos para acceder a esta consulta',
      );
    }
    return await this.dashboardService.getViewDate(query, user);
  }

  @Post('raw')
  @UseGuards(LocalAuthGuard)
  async getRaw(
    @Body() query: QueryParams,
    @UserDecorator() user: any,
  ): Promise<any[]> {
    return await this.dashboardService.getRawData(query, user);
  }
}
