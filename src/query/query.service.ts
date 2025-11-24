import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryModel } from './entities/query.entity';
import { Repository } from 'typeorm';

@Injectable()
export class QueryService {
  constructor(
    @InjectRepository(QueryModel, 'postgresConnection')
    private readonly queryModelRepository: Repository<QueryModel>,
  ) {}

  async getQuery(name: string): Promise<QueryModel> {
    return this.queryModelRepository.findOne({
      where: { name },
    });
  }
}
