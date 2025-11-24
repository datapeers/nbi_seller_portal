import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { QueryService } from 'src/query/query.service';
import { DataSource } from 'typeorm';
import { QueryParams } from './types/queryParams.type';

@Injectable()
export class DashboardService {
  constructor(
    @InjectDataSource('mssqlConnection') // In
    private readonly dataSource: DataSource,
    private readonly queryService: QueryService,
  ) {}

  async getViewDate(query: QueryParams, user: any): Promise<any[]> {
    const queryRunner = this.dataSource.createQueryRunner();

    const queryCode = await this.queryService.getQuery(query.name);

    try {
      await queryRunner.connect(); // Conectar al QueryRunner
      const result = await queryRunner.query(queryCode.query, query.params);
      return result;
    } catch (error) {
      console.log(error);
    } finally {
      await queryRunner.release(); // Liberar la conexión
    }
  }

  async getRawData(query: QueryParams, user: any): Promise<any[]> {
    const queryRunner = this.dataSource.createQueryRunner();

    const queryCode = await this.queryService.getQuery(query.name);

    try {
      await queryRunner.connect(); // Conectar al QueryRunner
      const result = await queryRunner.query(
        `${queryCode.query}${query.params[0]}`,
      );
      return result;
    } catch (error) {
      console.log(error);
    } finally {
      await queryRunner.release(); // Liberar la conexión
    }
  }

  async getQuery(name: string): Promise<any> {
    return await this.queryService.getQuery(name);
  }
}
