import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { QueryService } from 'src/query/query.service';
import { DataSource, Repository } from 'typeorm';
import { BulkCreatePoSellerAssignmentDto } from './dto/bulk-create-po-seller-assignment.dto';
import { BulkDeletePoSellerAssignmentDto } from './dto/bulk-delete-po-seller-assignment.dto';
import { AssignmentItemDto } from './dto/assignment-item.dto';
import { PoSellerAssignment } from './entities/po-seller-assignment.entity';

@Injectable()
export class PoSellerAssignmentsService {
  constructor(
    @InjectRepository(PoSellerAssignment, 'mssqlConnection')
    private readonly repository: Repository<PoSellerAssignment>,
    @InjectDataSource('mssqlConnection')
    private readonly dataSource: DataSource,
    private readonly queryService: QueryService,
  ) { }

  async bulkCreate(dto: BulkCreatePoSellerAssignmentDto) {

    await this.validateAvailability(dto.assignments);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const inserted: PoSellerAssignment[] = [];

      for (const item of dto.assignments) {
        const row = this.repository.create({
          poNumber: item.poNumber.trim(),
          jobCode: item.jobCode.trim(),
          sellerCode: item.sellerCode,
          assignedLbs: item.assignedLbs,
          buyerCode: item.buyerCode,
        });
        inserted.push(await queryRunner.manager.save(PoSellerAssignment, row));
      }

      await queryRunner.commitTransaction();
      return inserted;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to save assignments',
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async validateAvailability(assignments: AssignmentItemDto[]) {
    const byJob = new Map<string, { newLbs: number; buyerCode: number }>();

    for (const item of assignments) {
      const jobCode = item.jobCode.trim();
      const entry = byJob.get(jobCode);
      if (entry) {
        entry.newLbs += item.assignedLbs;
      } else {
        byJob.set(jobCode, { newLbs: item.assignedLbs, buyerCode: item.buyerCode });
      }
    }

    for (const [jobCode, { newLbs, buyerCode }] of byJob) {
      const [totalInventory, { currentAssigned }] = await Promise.all([
        this.getTotalInventoryFromMssql(buyerCode, jobCode),
        this.repository
          .createQueryBuilder('a')
          .select('COALESCE(SUM(CAST(a.assignedLbs AS FLOAT)), 0)', 'currentAssigned')
          .where('a.jobCode = :jobCode', { jobCode })
          .getRawOne(),
      ]);

      const current = parseFloat(currentAssigned) || 0;

      if (current + newLbs > totalInventory) {
        throw new BadRequestException(
          `Job "${jobCode}": would assign ${current + newLbs} lbs but only ${totalInventory} available`,
        );
      }
    }
  }

  private async getTotalInventoryFromMssql(buyerCode: number, jobCode: string): Promise<number> {
    const queryModel = await this.queryService.getQuery('Unsold PO By buyer');
    if (!queryModel) {
      throw new InternalServerErrorException('Named query "Unsold PO By buyer" not found');
    }

    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    try {
      const rows = await runner.query(queryModel.query, [buyerCode]);
      const row = rows.find((r: any) => {
        const jc = String(r.JobCode ?? r.jobCode ?? '').trim();
        return jc === jobCode;
      });

      if (!row) {
        throw new BadRequestException(
          `Job "${jobCode}" not found in available inventory for buyer ${buyerCode}`,
        );
      }

      return parseFloat(row.PoundsAvailable ?? row.poundsAvailable ?? 0) || 0;
    } finally {
      await runner.release();
    }
  }

  async bulkDelete(dto: BulkDeletePoSellerAssignmentDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalDeleted = 0;

      for (const item of dto.assignments) {
        const result = await queryRunner.manager.delete(PoSellerAssignment, {
          jobCode: item.jobCode.trim(),
          sellerCode: item.sellerCode,
        });
        totalDeleted += result.affected ?? 0;
      }

      await queryRunner.commitTransaction();
      return { deleted: totalDeleted };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to delete assignments',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return await this.repository.find({ order: { createdDate: 'DESC' } });
  }

  async findByPoNumber(poNumber: string) {
    const rows = await this.repository.find({
      where: { poNumber },
      order: { jobCode: 'ASC', createdDate: 'ASC' },
    });

    const byJob = new Map<string, { totalAssigned: number; assignments: PoSellerAssignment[] }>();
    for (const row of rows) {
      if (!byJob.has(row.jobCode)) {
        byJob.set(row.jobCode, { totalAssigned: 0, assignments: [] });
      }
      const entry = byJob.get(row.jobCode)!;
      entry.totalAssigned = parseFloat(
        (entry.totalAssigned + parseFloat(row.assignedLbs as any)).toFixed(4),
      );
      entry.assignments.push(row);
    }

    return {
      poNumber,
      jobs: Array.from(byJob.entries()).map(([jobCode, data]) => ({
        jobCode,
        totalAssigned: data.totalAssigned,
        assignments: data.assignments,
      })),
    };
  }
}
