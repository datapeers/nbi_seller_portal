import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { QueryParams } from 'src/dashboard/types/queryParams.type';
import { QueryService } from 'src/query/query.service';
import { DataSource } from 'typeorm';

@Injectable()
export class PiersService {
  constructor(
    @InjectDataSource('postgresConnectionPierce') // In
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
}
