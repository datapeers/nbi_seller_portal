import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cash_flow_versions')
export class CashFlowVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name_version', length: 100 })
  nameVersion: string;

  @Column({ type: 'jsonb' })
  data: any;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createat: Date;

  @Column({ name: 'sellercode' })
  sellerCode: string;
}
