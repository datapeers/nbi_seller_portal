import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueryModule } from 'src/query/query.module';
import { PoSellerAssignment } from './entities/po-seller-assignment.entity';
import { PoSellerAssignmentsController } from './po-seller-assignments.controller';
import { PoSellerAssignmentsService } from './po-seller-assignments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PoSellerAssignment], 'mssqlConnection'),
    QueryModule,
  ],
  controllers: [PoSellerAssignmentsController],
  providers: [PoSellerAssignmentsService],
})
export class PoSellerAssignmentsModule {}
