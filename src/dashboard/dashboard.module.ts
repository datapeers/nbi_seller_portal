import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { QueryModule } from 'src/query/query.module';

@Module({
  imports: [QueryModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
