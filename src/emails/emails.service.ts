import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CheckPosDto } from './dto/check-pos.dto';
import { GenerateEmailDto } from './dto/generate-email.dto';

@Injectable()
export class EmailsService {
  constructor(
    @InjectDataSource('postgresConnection')
    private readonly dataSource: DataSource,
  ) {}

  async generate(dto: GenerateEmailDto): Promise<{ id_email: number }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const headerResult = await queryRunner.query(
        `INSERT INTO emails_generated (buyercode, buyername)
         VALUES ($1, $2)
         RETURNING id_email`,
        [dto.BuyerCode ?? null, dto.BuyerName ?? null],
      );
      const idEmail: number = headerResult[0].id_email;

      for (const detail of dto.details) {
        const { PO, Product, Vendor, Consignee, ShipDate, DeliveryType, extraData } = detail;
        await queryRunner.query(
          `INSERT INTO email_detail (id_email, po, product, vendor, consignee, shipdate, deliverytype, jsondata)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            idEmail,
            PO,
            Product ?? null,
            Vendor ?? null,
            Consignee ?? null,
            ShipDate ?? null,
            DeliveryType ?? null,
            extraData ? JSON.stringify(extraData) : null,
          ],
        );
      }

      await queryRunner.commitTransaction();
      return { id_email: idEmail };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to generate email record');
    } finally {
      await queryRunner.release();
    }
  }

  async checkPos(
    dto: CheckPosDto,
  ): Promise<{ PO: number; hasEmail: boolean; id_email: number | null }[]> {
    const { pos } = dto;
    const placeholders = pos.map((_, i) => `$${i + 1}`).join(', ');
    const rows: { po: number; id_email: number }[] = await this.dataSource.query(
      `SELECT po, id_email FROM email_detail WHERE po IN (${placeholders})`,
      pos,
    );

    const found = new Map<number, number>();
    for (const r of rows) found.set(Number(r.po), r.id_email);

    return pos.map((po) => ({
      PO: po,
      hasEmail: found.has(po),
      id_email: found.get(po) ?? null,
    }));
  }

  async findById(idEmail: number) {
    const rows = await this.dataSource.query(
      `SELECT
         eg.id_email, eg.fecha, eg.buyercode, eg.buyername, eg.status, eg.sentdate,
         ed.id AS detail_id, ed.po, ed.product, ed.vendor, ed.consignee,
         ed.shipdate, ed.deliverytype, ed.jsondata
       FROM emails_generated eg
       LEFT JOIN email_detail ed ON eg.id_email = ed.id_email
       WHERE eg.id_email = $1`,
      [idEmail],
    );

    if (!rows.length) {
      throw new NotFoundException(`Email with id ${idEmail} not found`);
    }

    const { id_email, fecha, buyercode, buyername, status, sentdate } = rows[0];
    return {
      id_email,
      Fecha: fecha,
      BuyerCode: buyercode,
      BuyerName: buyername,
      Status: status,
      SentDate: sentdate,
      details: rows
        .filter((r) => r.detail_id !== null)
        .map((r) => ({
          Id: r.detail_id,
          PO: r.po,
          Product: r.product,
          Vendor: r.vendor,
          Consignee: r.consignee,
          ShipDate: r.shipdate,
          DeliveryType: r.deliverytype,
          JsonData: r.jsondata,
        })),
    };
  }
}
