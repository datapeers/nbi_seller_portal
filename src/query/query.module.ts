import { Module } from '@nestjs/common';
import { QueryService } from './query.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueryModel } from './entities/query.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QueryModel], 'postgresConnection')],
  providers: [QueryService],
  exports: [QueryService],
})
export class QueryModule {}
