import { Module } from '@nestjs/common';
import { QueryModule } from 'src/query/query.module';
import { UnsoldPoController } from './unsold-po.controller';
import { UnsoldPoService } from './unsold-po.service';

@Module({
  imports: [QueryModule],
  controllers: [UnsoldPoController],
  providers: [UnsoldPoService],
})
export class UnsoldPoModule {}
