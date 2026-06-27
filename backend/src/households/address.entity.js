import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('Addresses')
export class Address {
  @PrimaryColumn({ name: 'AddressID', type: 'int' })
  AddressID;

  @Column({ name: 'Barangay', type: 'nvarchar', length: '255', nullable: true })
  Barangay;

  @Column({ name: 'HouseNo', type: 'nvarchar', length: '100', nullable: true })
  HouseNo;

  @Column({ name: 'Street', type: 'nvarchar', length: '255', nullable: true })
  Street;

  @Column({ name: 'ResidencyLength', type: 'varchar', length: '100', nullable: true })
  ResidencyLength;

  @Column({ name: 'HouseholdType', type: 'varchar', length: '100', nullable: true })
  HouseholdType;

  @Column({ name: 'Status', type: 'varchar', length: '50', nullable: true })
  Status;
}
