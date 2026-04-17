import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RefreshDashboardController } from './refresh-dashboard.controller';
import { RefreshDashboardService } from './refresh-dashboard.service';

@Module({
  imports: [HttpModule],
  controllers: [RefreshDashboardController],
  providers: [RefreshDashboardService],
})
export class RefreshDashboardModule {}
