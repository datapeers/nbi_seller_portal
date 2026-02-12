import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('seller_roles')
export class SellerRole {
    @PrimaryColumn()
    code: number;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 150 })
    email: string;

    @Column({ length: 20 })
    rolename: string;
}
