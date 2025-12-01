import { Injectable } from '@nestjs/common';
import { CreateCashFlowVersionDto } from './dto/create-cash-flow-version.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CashFlowVersion } from './entities/cash-flow-version.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CashFlowVersionsService {
    constructor(
        @InjectRepository(CashFlowVersion, 'postgresConnection')
        private readonly cashFlowVersionRepository: Repository<CashFlowVersion>,
    ) { }

    async create(createCashFlowVersionDto: CreateCashFlowVersionDto) {
        const newVersion = this.cashFlowVersionRepository.create(
            createCashFlowVersionDto,
        );
        return await this.cashFlowVersionRepository.save(newVersion);
    }

    async findAll() {
        return await this.cashFlowVersionRepository.find();
    }

    async findOne(id: number) {
        return await this.cashFlowVersionRepository.findOne({ where: { id } });
    }

    async findBySellerCode(sellerCode: string) {
        return await this.cashFlowVersionRepository.find({ where: { sellerCode } });
    }

    async remove(id: number) {
        return await this.cashFlowVersionRepository.delete(id);
    }
}
