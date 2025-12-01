import { Module } from '@nestjs/common';
import { CashFlowVersionsService } from './cash-flow-versions.service';
import { CashFlowVersionsController } from './cash-flow-versions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashFlowVersion } from './entities/cash-flow-version.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CashFlowVersion], 'postgresConnection')],
    controllers: [CashFlowVersionsController],
    providers: [CashFlowVersionsService],
    exports: [CashFlowVersionsService],
})
export class CashFlowVersionsModule { }
