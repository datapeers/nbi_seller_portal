import { Module } from '@nestjs/common';
import { PiersService } from './piers.service';
import { PiersController } from './piers.controller';
import { QueryModule } from 'src/query/query.module';

@Module({
  imports: [QueryModule],
  controllers: [PiersController],
  providers: [PiersService],
  exports: [PiersService],
})
export class PiersModule {}
