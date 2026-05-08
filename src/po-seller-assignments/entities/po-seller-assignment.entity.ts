import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('PO_SellerAssignments')
export class PoSellerAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'po_number', length: 100 })
  poNumber: string;

  @Column({ name: 'jobcode', length: 100 })
  jobCode: string;

  @Column({ name: 'sellercode', type: 'int' })
  sellerCode: number;

  @Column({ name: 'assignedlbs', type: 'decimal', precision: 12, scale: 4 })
  assignedLbs: number;

  @Column({ name: 'buyercode', type: 'int' })
  buyerCode: number;

  @CreateDateColumn({ name: 'createddate' })
  createdDate: Date;
}
