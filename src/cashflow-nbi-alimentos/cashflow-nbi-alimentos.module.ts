import { Module } from '@nestjs/common';
import { CashflowNbiAlimentosService } from './cashflow-nbi-alimentos.service';
import { CashflowNbiAlimentosController } from './cashflow-nbi-alimentos.controller';
import { QueryModule } from 'src/query/query.module';

@Module({
  imports: [QueryModule],
  controllers: [CashflowNbiAlimentosController],
  providers: [CashflowNbiAlimentosService],
})
export class CashflowNbiAlimentosModule {}
