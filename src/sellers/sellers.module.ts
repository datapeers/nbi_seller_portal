import { Module } from '@nestjs/common';
import { SellersService } from './sellers.service';
import { SellersController } from './sellers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seller } from './entities/seller.entity';
import { SellerRole } from './entities/seller-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Seller, SellerRole], 'postgresConnection')],
  controllers: [SellersController],
  providers: [SellersService],
  exports: [SellersService],
})
export class SellersModule { }
