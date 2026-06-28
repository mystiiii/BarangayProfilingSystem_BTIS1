import { Injectable, Dependencies } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Resident } from './resident.entity';
import { Address } from '../households/address.entity';

@Injectable()
@Dependencies(getRepositoryToken(Resident), getRepositoryToken(Address))
export class ResidentsService {
  constructor(residentRepository, addressRepository) {
    this.residentRepository = residentRepository;
    this.addressRepository = addressRepository;
  }

  async findAll(query = {}) {
    const rows = await this.buildTableQuery(query).getRawMany();
    return rows.map(row => this.mapTableRow(row));
  }

  async findTable(query = {}) {
    const page = this.toPositiveInt(query.page, 1);
    const limit = Math.min(this.toPositiveInt(query.limit, 10), 100);
    const baseQuery = this.buildTableQuery(query);
    const total = await baseQuery.clone().getCount();
    const rows = await baseQuery
      .skip((page - 1) * limit)
      .take(limit)
      .getRawMany();

    return {
      data: rows.map(row => this.mapTableRow(row)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit))
      }
    };
  }

  async findOne(id) {
    const residentId = this.parseResidentId(id);
    const row = await this.buildTableQuery({ residentId }).getRawOne();
    return row ? this.mapTableRow(row) : null;
  }

  // Example DB insertion: return await this.residentRepository.save(createResidentDto);
  create(createResidentDto) {
    return { message: 'Resident creation placeholder', data: createResidentDto };
  }

  // Example DB update: return await this.residentRepository.update(id, updateResidentDto);
  update(id, updateResidentDto) {
    return { id, message: 'Resident update placeholder', data: updateResidentDto };
  }

  // Example DB deletion: return await this.residentRepository.delete(id);
  remove(id) {
    return { id, message: 'Resident deletion placeholder' };
  }

  buildTableQuery(query = {}) {
    const queryBuilder = this.residentRepository
      .createQueryBuilder('resident')
      .leftJoin(Address, 'address', 'address.AddressID = resident.Address')
      .leftJoin('FamilyRelations', 'familyRelation', 'familyRelation.ResidentID = resident.ResidentID')
      .leftJoin('Families', 'family', 'family.FamilyID = familyRelation.FamilyID')
      .select([
        'resident.ResidentID AS ResidentID',
        'resident.Name AS Name',
        'resident.BirthDate AS BirthDate',
        'resident.Age AS Age',
        'resident.Sex AS Sex',
        'resident.ContactNo AS ContactNo',
        'resident.Occupation AS Occupation',
        'resident.Citizenship AS Citizenship',
        'resident.CivilStatus AS CivilStatus',
        'resident.Status AS ResidencyStatus',
        'resident.Address AS AddressID',
        'address.Barangay AS Barangay',
        'address.HouseNo AS HouseNo',
        'address.Street AS Street',
        'address.ResidencyLength AS ResidencyLength',
        'address.HouseholdType AS HouseholdType',
        'address.Status AS HouseholdStatus',
        'familyRelation.FamilyID AS FamilyID',
        'familyRelation.Relation AS FamilyRelation',
        'family.Head AS FamilyHeadID',
        'family.MemberCount AS FamilyMemberCount',
        'family.Status AS FamilyStatus'
      ])
      .orderBy('resident.ResidentID', 'DESC');

    if (query.residentId) {
      queryBuilder.andWhere('resident.ResidentID = :residentId', {
        residentId: this.parseResidentId(query.residentId)
      });
    }

    const status = query.status || query.residencyStatus;
    if (status) {
      queryBuilder.andWhere('resident.Status = :status', { status });
    }

    const barangay = query.barangay || query.barangaySector;
    if (barangay) {
      queryBuilder.andWhere('address.Barangay = :barangay', { barangay });
    }

    const search = query.search && String(query.search).trim();
    if (search) {
      queryBuilder.andWhere(
        '(resident.Name LIKE :search OR resident.ContactNo LIKE :search OR address.Barangay LIKE :search OR address.Street LIKE :search OR address.HouseNo LIKE :search)',
        { search: `%${search}%` }
      );
    }

    return queryBuilder;
  }

  mapTableRow(row) {
    const nameParts = this.splitName(row.Name);
    const addressLine = [row.HouseNo, row.Street].filter(Boolean).join(' ').trim();
    const residentId = this.formatResidentId(row.ResidentID);
    const householdId = row.AddressID ? this.formatHouseholdId(row.AddressID) : null;
    const familyId = row.FamilyID ? this.formatFamilyId(row.FamilyID) : null;

    return {
      residentId,
      dbResidentId: row.ResidentID,
      firstName: nameParts.firstName,
      middleName: nameParts.middleName,
      lastName: nameParts.lastName,
      fullName: row.Name || '',
      dateOfBirth: this.formatDate(row.BirthDate),
      age: row.Age,
      sex: row.Sex,
      civilStatus: row.CivilStatus,
      contactNumber: row.ContactNo ? String(row.ContactNo).trim() : '',
      occupation: row.Occupation,
      citizenship: row.Citizenship,
      residencyStatus: row.ResidencyStatus,
      streetAddress: addressLine,
      barangaySector: row.Barangay,
      householdId,
      addressId: row.AddressID,
      lengthOfResidency: row.ResidencyLength,
      householdType: row.HouseholdType,
      householdStatus: row.HouseholdStatus,
      familyId,
      familyRelation: row.FamilyRelation,
      familyHeadId: row.FamilyHeadID ? this.formatResidentId(row.FamilyHeadID) : null,
      familyMemberCount: row.FamilyMemberCount,
      familyStatus: row.FamilyStatus,
      isFamilyHead: Number(row.FamilyHeadID) === Number(row.ResidentID)
    };
  }

  splitName(name = '') {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length <= 1) {
      return { firstName: parts[0] || '', middleName: '', lastName: '' };
    }

    return {
      firstName: parts[0],
      middleName: parts.slice(1, -1).join(' '),
      lastName: parts[parts.length - 1]
    };
  }

  formatDate(value) {
    if (!value) return '';
    if (typeof value === 'string') return value.slice(0, 10);
    return value.toISOString().slice(0, 10);
  }

  formatResidentId(id) {
    return `R-${String(id).padStart(4, '0')}`;
  }

  formatHouseholdId(id) {
    return `H-${id}`;
  }

  formatFamilyId(id) {
    return `F-${String(id).padStart(3, '0')}`;
  }

  parseResidentId(id) {
    const value = String(id).replace(/^R-/i, '');
    return Number.parseInt(value, 10);
  }

  toPositiveInt(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
  }
}
