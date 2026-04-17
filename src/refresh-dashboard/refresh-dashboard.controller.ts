import { Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RefreshDashboardService } from './refresh-dashboard.service';

@Controller('dashboard/refresh')
export class RefreshDashboardController {
  constructor(
    private readonly refreshDashboardService: RefreshDashboardService,
    private readonly configService: ConfigService,
  ) {}

  @Post('Operational')
  async refreshOperational(): Promise<{ message: string }> {
    const url = this.configService.get<string>('FLUJO_ADMIN');
    await this.refreshDashboardService.triggerFlow(url);
    return { message: 'Operational dashboard refresh triggered successfully' };
  }

  @Post('Management')
  async refreshManagement(): Promise<{ message: string }> {
    const url = this.configService.get<string>('FLUJO_VENDORS');
    await this.refreshDashboardService.triggerFlow(url);
    return { message: 'Management dashboard refresh triggered successfully' };
  }
}
