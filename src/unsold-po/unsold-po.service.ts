import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { QueryService } from 'src/query/query.service';
import { DataSource } from 'typeorm';

@Injectable()
export class UnsoldPoService {
  constructor(
    @InjectDataSource('mssqlConnection')
    private readonly mssqlDataSource: DataSource,
    private readonly queryService: QueryService,
  ) { }

  async getByBuyer(buyerCode: number) {
    const [poRows, assignmentRows, sellerRows] = await Promise.all([
      this.runMssqlNamedQuery('Unsold PO By buyer', [buyerCode]),
      this.runMssqlNamedQuery('PO SellerAssignments', []),
      this.runMssqlNamedQuery('Sellers Info', []),
    ]);

    // jobCode -> aggregated assignment data (multiple rows per JobCode when multiple sellers)
    const assignmentByJob = new Map<string, { totalSellerWeight: number; spCodes: string[]; sellerWeights: number[]; source: string | null; calculatedProfit: number | null }>();
    for (const row of assignmentRows) {
      const jobCode = String(row.JobCode ?? row.jobCode ?? '');
      if (!jobCode) continue;
      const entry = assignmentByJob.get(jobCode);
      const lbs = Number(row.SellerWeight || 0);
      const spCode = String(row.SPCode ?? '').trim();
      const source = row.Source ?? row.source ?? null;
      const profit = row.CalculatedProfit ?? row.calculatedProfit ?? row.calculatedprofit ?? null;
      const profitValue = profit !== null ? Number(profit) : null;
      if (entry) {
        entry.totalSellerWeight += lbs;
        if (spCode) entry.spCodes.push(spCode);
        entry.sellerWeights.push(lbs);
        if (entry.source === null && source !== null) entry.source = source;
        if (entry.calculatedProfit === null && profitValue !== null) entry.calculatedProfit = profitValue;
      } else {
        assignmentByJob.set(jobCode, {
          totalSellerWeight: lbs,
          spCodes: spCode ? [spCode] : [],
          sellerWeights: [lbs],
          source,
          calculatedProfit: profitValue,
        });
      }
    }

    // sellerCode -> seller name
    const sellerNameMap = new Map<number, string>();
    for (const s of sellerRows) {
      const code = Number(s.SellerCode ?? s.sellerCode ?? s.Code ?? s.code);
      const name = String(s.SellerName ?? s.sellerName ?? s.Name ?? s.name ?? code);
      if (!isNaN(code)) sellerNameMap.set(code, name);
    }

    return poRows.map((row) =>
      this.enrichRow(row, assignmentByJob, sellerNameMap),
    );
  }

  private enrichRow(
    row: any,
    assignmentByJob: Map<string, { totalSellerWeight: number; spCodes: string[]; sellerWeights: number[]; source: string | null; calculatedProfit: number | null }>,
    sellerNameMap: Map<number, string>,
  ) {
    const jobCode = String(row.JobCode ?? row.jobCode ?? '');
    const assignment = assignmentByJob.get(jobCode);
    const poundsAvailable = Number(row.PoundsAvailable ?? row.poundsAvailable ?? 0) || 0;

    // Strip all profit field variants from the row to avoid duplicates in the response
    const { CalculatedProft, CalculatedProfit: _cp1, calculatedProfit: _cp2, calculatedprofit: _cp3, ...baseRow } = row;
    const rowProfit = CalculatedProft ?? _cp1 ?? _cp2 ?? _cp3 ?? null;

    if (!assignment) {
      return {
        ...baseRow,
        AssignedLbs: 0,
        RemainingAvailable: poundsAvailable,
        AssignedSellerNames: '',
        SellerWeight: '',
        AssignmentStatus: 'No' as const,
        Source: null,
        CalculatedProfit: rowProfit,
      };
    }

    const assignedLbs = assignment.totalSellerWeight;
    const remainingAvailable = Math.max(poundsAvailable - assignedLbs, 0);

    const assignedSellerNames = assignment.spCodes
      .map((c) => {
        const code = Number(c);
        return isNaN(code) ? c : (sellerNameMap.get(code) ?? c);
      })
      .join(',');

    const assignmentStatus: 'No' | 'Partial' | 'Full' =
      assignedLbs <= 0 ? 'No' : remainingAvailable > 0 ? 'Partial' : 'Full';

    return {
      ...baseRow,
      AssignedLbs: assignment.sellerWeights.join(','),
      RemainingAvailable: remainingAvailable,
      AssignedSellerNames: assignedSellerNames,
      SellerWeight: assignment.sellerWeights.join(','),
      AssignmentStatus: assignmentStatus,
      Source: assignment.source,
      CalculatedProfit: assignment.calculatedProfit != null
        ? assignment.calculatedProfit
        : rowProfit,
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
}
