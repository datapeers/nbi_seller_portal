import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { QueryService } from 'src/query/query.service';
import { DataSource } from 'typeorm';
import { QueryParams } from 'src/dashboard/types/queryParams.type';

@Injectable()
export class CashflowNorthernService {
  constructor(
    @InjectDataSource('mssqlConnection')
    private readonly dataSource: DataSource,
    private readonly queryService: QueryService,
  ) {}

  async executeQuery(query: QueryParams, user: any): Promise<any[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    const queryCode = await this.queryService.getQuery(query.name);

    try {
      await queryRunner.connect();
      const result = await queryRunner.query(queryCode.query, query.params);
      return result;
    } catch (error) {
      console.log(error);
    } finally {
      await queryRunner.release();
    }
  }
}
