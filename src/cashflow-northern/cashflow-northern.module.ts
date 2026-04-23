import { Module } from '@nestjs/common';
import { CashflowNorthernService } from './cashflow-northern.service';
import { CashflowNorthernController } from './cashflow-northern.controller';
import { QueryModule } from 'src/query/query.module';

@Module({
  imports: [QueryModule],
  controllers: [CashflowNorthernController],
  providers: [CashflowNorthernService],
})
export class CashflowNorthernModule {}
