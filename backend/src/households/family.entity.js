import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('Families')
export class Family {
  @PrimaryColumn({ name: 'FamilyID', type: 'int' })
  FamilyID;

  @Column({ name: 'Head', type: 'int', nullable: true })
  Head;

  @Column({ name: 'MemberCount', type: 'tinyint', nullable: true })
  MemberCount;

  @Column({ name: 'Status', type: 'varchar', length: '50', nullable: true })
  Status;
}
