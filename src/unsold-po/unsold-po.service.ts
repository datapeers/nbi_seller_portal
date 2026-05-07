import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { QueryService } from 'src/query/query.service';
import { DataSource } from 'typeorm';

type AssignmentStatus = 'No' | 'Partial' | 'Full';

@Injectable()
export class UnsoldPoService {
  constructor(
    @InjectDataSource('mssqlConnection')
    private readonly mssqlDataSource: DataSource,
    private readonly queryService: QueryService,
  ) {}

  async getByBuyer(buyerCode: number) {
    // Run all three sources in parallel — each uses its own connection/pool
    const [poRows, assignmentRows, sellerRows] = await Promise.all([
      this.runMssqlNamedQuery('Unsold PO By buyer', [buyerCode]),
      this.loadAssignments(),
      this.runMssqlNamedQuery('Sellers Info', []),
    ]);

    // jobCode -> total assigned lbs across all sellers
    const jobAssignedLbs = new Map<string, number>();
    // jobCode -> ordered list of { seller code, per-seller lbs }
    const jobSellerEntries = new Map<string, { code: number; lbs: number }[]>();

    for (const row of assignmentRows) {
      const jobCode = String(row.jobCode ?? '');
      const lbs = row.assignedLbs;
      const sellerCode = Number(row.sellerCode);

      jobAssignedLbs.set(jobCode, (jobAssignedLbs.get(jobCode) ?? 0) + lbs);

      if (!jobSellerEntries.has(jobCode)) jobSellerEntries.set(jobCode, []);
      jobSellerEntries.get(jobCode)!.push({ code: sellerCode, lbs });
    }

    // sellerCode -> seller name
    const sellerNameMap = new Map<number, string>();
    for (const s of sellerRows) {
      const code = Number(s.SellerCode ?? s.sellerCode ?? s.Code ?? s.code);
      const name = String(s.SellerName ?? s.sellerName ?? s.Name ?? s.name ?? code);
      if (!isNaN(code)) sellerNameMap.set(code, name);
    }

    return poRows.map((row) =>
      this.enrichRow(row, jobAssignedLbs, jobSellerEntries, sellerNameMap),
    );
  }

  private enrichRow(
    row: any,
    jobAssignedLbs: Map<string, number>,
    jobSellerEntries: Map<string, { code: number; lbs: number }[]>,
    sellerNameMap: Map<number, string>,
  ) {
    const jobCode = String(row.JobCode ?? row.jobCode ?? '');
    const poundsAvailable = parseFloat(row.PoundsAvailable ?? row.poundsAvailable ?? 0) || 0;

    const assignedLbs = jobAssignedLbs.get(jobCode) ?? 0;
    const remainingAvailable = parseFloat(
      Math.max(poundsAvailable - assignedLbs, 0).toFixed(4),
    );

    const entries = jobSellerEntries.get(jobCode) ?? [];
    const assignedSellerNames = entries
      .map(({ code }) => sellerNameMap.get(code) ?? String(code))
      .join(',');
    const sellerWeight = entries
      .map(({ lbs }) => lbs)
      .join(',');

    let assignmentStatus: AssignmentStatus;
    if (assignedLbs === 0) {
      assignmentStatus = 'No';
    } else if (assignedLbs < poundsAvailable) {
      assignmentStatus = 'Partial';
    } else {
      assignmentStatus = 'Full';
    }

    return {
      ...row,
      AssignedLbs: assignedLbs,
      RemainingAvailable: remainingAvailable,
      AssignedSellerNames: assignedSellerNames,
      SellerWeight: sellerWeight,
      AssignmentStatus: assignmentStatus,
    };
  }

  // Fetches SQL text from the query_model table (PostgreSQL) then runs it on MSSQL
  private async runMssqlNamedQuery(name: string, params: any[]): Promise<any[]> {
    const queryModel = await this.queryService.getQuery(name);
    const runner = this.mssqlDataSource.createQueryRunner();
    await runner.connect();
    try {
      return await runner.query(
        queryModel.query,
        params.length ? params : undefined,
      );
    } catch (error) {
      throw new InternalServerErrorException(`Named query "${name}" failed`);
    } finally {
      await runner.release();
    }
  }

  // Aggregates assignment rows from MSSQL Datapeers
  private async loadAssignments(): Promise<{ jobCode: string; sellerCode: number; assignedLbs: number }[]> {
    const runner = this.mssqlDataSource.createQueryRunner();
    await runner.connect();
    try {
      const rows = await runner.query(`
        SELECT
          jobcode,
          sellercode,
          SUM(assignedlbs) AS assignedlbs
        FROM PO_SellerAssignments
        GROUP BY jobcode, sellercode
      `);

      return rows.map((row: any) => ({
        jobCode: String(row.jobcode ?? ''),
        sellerCode: Number(row.sellercode),
        assignedLbs: Number(row.assignedlbs) || 0,
      }));
    } catch (error) {
      throw new InternalServerErrorException('Failed to load assignments');
    } finally {
      await runner.release();
    }
  }
}
