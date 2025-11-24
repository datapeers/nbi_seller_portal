import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PiersService } from './piers.service';
import { UserDecorator } from 'src/auth/decorators/user.decorator';
import { QueryParams } from 'src/dashboard/types/queryParams.type';
import { LocalAuthGuard } from 'src/auth/guard/local.guard';

@Controller('piers')
export class PiersController {
  constructor(private readonly piersService: PiersService) {}

  @Post()
  @UseGuards(LocalAuthGuard)
  async getData(
    @Body() query: QueryParams,
    @UserDecorator() user: any,
  ): Promise<any[]> {
    return await this.piersService.getViewDate(query, user);
  }
}
