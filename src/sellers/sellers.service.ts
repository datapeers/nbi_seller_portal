import { Injectable } from '@nestjs/common';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Seller } from './entities/seller.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SellersService {
  constructor(
    @InjectRepository(Seller, 'postgresConnection')
    private readonly sellerRepository: Repository<Seller>,
  ) {}

  create(createSellerDto: CreateSellerDto) {
    const newSeller = this.sellerRepository.create({
      ...createSellerDto,
      password: bcrypt.hashSync(createSellerDto.password, 10),
    });

    try {
      return this.sellerRepository.save(newSeller);
    } catch (error) {
      throw new Error(error);
    }
  }

  findAll() {
    return `This action returns all sellers`;
  }

  async find(email: string) {
    const seller = await this.sellerRepository.findOne({
      where: { email: email },
    });

    return seller;
  }

  async findByName(name: string) {
    const seller = await this.sellerRepository.findOne({
      where: { name },
    });

    return seller;
  }

  async findByCode(code: string) {
    const seller = await this.sellerRepository.findOne({
      where: { code },
    });

    return seller;
  }

  async findById(id: string) {
    const seller = await this.sellerRepository.findOne({
      where: { id },
    });

    return seller;
  }

  findOne(id: number) {
    return `This action returns a #${id} seller`;
  }

  update(id: number, updateSellerDto: UpdateSellerDto) {
    return `This action updates a #${id} seller`;
  }

  remove(id: number) {
    return `This action removes a #${id} seller`;
  }
}
