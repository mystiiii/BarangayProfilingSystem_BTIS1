import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('Residents')
export class Resident {
  @PrimaryColumn({ name: 'ResidentID', type: 'int' })
  ResidentID;

  @Column({ name: 'Name', type: 'nvarchar', length: '255', nullable: true })
  Name;

  @Column({ name: 'BirthDate', type: 'date', nullable: true })
  BirthDate;

  @Column({ name: 'Age', type: 'tinyint', nullable: true })
  Age;

  @Column({ name: 'Sex', type: 'varchar', length: '50', nullable: true })
  Sex;

  @Column({ name: 'ContactNo', type: 'char', length: '20', nullable: true })
  ContactNo;

  @Column({ name: 'Occupation', type: 'varchar', length: '255', nullable: true })
  Occupation;

  @Column({ name: 'Citizenship', type: 'varchar', length: '100', nullable: true })
  Citizenship;

  @Column({ name: 'CivilStatus', type: 'varchar', length: '50', nullable: true })
  CivilStatus;

  @Column({ name: 'Status', type: 'varchar', length: '50', nullable: true })
  Status;
}
