import { BadRequestException, ConflictException, Injectable, NotFoundException, Dependencies } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Family } from './family.entity';
import { Address } from './address.entity';

@Injectable()
@Dependencies(getRepositoryToken(Family), getRepositoryToken(Address))
export class HouseholdsService {
  constructor(familyRepository, addressRepository) {
    this.familyRepository = familyRepository;
    this.addressRepository = addressRepository;
  }

  async getProfileOptions() {
    const households = await this.addressRepository.query(`
      SELECT
        AddressID,
        Barangay,
        HouseNo,
        Street,
        ResidencyLength,
        HouseholdType,
        Status
      FROM Addresses
      WHERE LOWER(LTRIM(RTRIM(ISNULL(Status, '')))) = 'active'
      ORDER BY Barangay, Street, HouseNo, AddressID
    `);

    return {
      households: households.map((household) => ({
        addressId: household.AddressID,
        householdId: this.formatHouseholdId(household.AddressID),
        barangay: household.Barangay,
        houseNo: household.HouseNo,
        street: household.Street,
        residencyLength: household.ResidencyLength,
        householdType: household.HouseholdType,
        status: household.Status,
        label: `${this.formatHouseholdId(household.AddressID)}: ${[household.HouseNo, household.Street].filter(Boolean).join(' ')} (Brgy. ${household.Barangay})`
      })),
      initialStatuses: ['Active', 'Inactive', 'Moved', 'Deceased']
    };
  }

  async getFamilyUnits(addressId) {
    const parsedAddressId = this.parseId(addressId, 'H-');

    if (!parsedAddressId) {
      throw new BadRequestException('A valid household ID is required.');
    }

    const household = await this.addressRepository.query(`
      SELECT AddressID
      FROM Addresses
      WHERE AddressID = @0
        AND LOWER(LTRIM(RTRIM(ISNULL(Status, '')))) = 'active'
    `, [parsedAddressId]);

    if (household.length === 0) {
      throw new NotFoundException('The selected active household was not found.');
    }

    const families = await this.addressRepository.query(`
      SELECT
        family.FamilyID,
        family.Head AS FamilyHeadID,
        family.MemberCount,
        family.Status,
        resident.Name AS FamilyHeadName,
        resident.Address AS AddressID
      FROM Families family
      INNER JOIN Residents resident ON resident.ResidentID = family.Head
      WHERE resident.Address = @0
        AND LOWER(LTRIM(RTRIM(ISNULL(family.Status, '')))) = 'active'
        AND LOWER(LTRIM(RTRIM(ISNULL(resident.Status, '')))) = 'active'
      ORDER BY resident.Name, family.FamilyID
    `, [parsedAddressId]);

    return {
      householdId: this.formatHouseholdId(parsedAddressId),
      familyUnits: families.map((family) => ({
        familyId: family.FamilyID,
        displayFamilyId: this.formatFamilyId(family.FamilyID),
        familyHeadId: family.FamilyHeadID,
        displayFamilyHeadId: this.formatResidentId(family.FamilyHeadID),
        familyHeadName: family.FamilyHeadName,
        memberCount: family.MemberCount,
        status: family.Status,
        label: `${this.formatFamilyId(family.FamilyID)}: Head - ${family.FamilyHeadName}`
      }))
    };
  }

  async createNewProfile(newProfileDto) {
    const profile = this.validateProfile(newProfileDto);
    const queryRunner = this.addressRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const householdRows = await queryRunner.manager.query(`
        SELECT AddressID, Barangay, HouseNo, Street, Status
        FROM Addresses WITH (UPDLOCK, HOLDLOCK)
        WHERE AddressID = @0
      `, [profile.householdId]);

      if (householdRows.length === 0) {
        throw new NotFoundException('The selected household was not found.');
      }

      const household = householdRows[0];

      if (!this.isActiveStatus(household.Status)) {
        throw new BadRequestException('A resident profile can only be linked to an active household.');
      }

      const familyRows = await queryRunner.manager.query(`
        SELECT
          family.FamilyID,
          family.Head AS FamilyHeadID,
          family.Status AS FamilyStatus,
          headResident.Name AS FamilyHeadName,
          headResident.Address AS HeadAddressID,
          headResident.Status AS FamilyHeadStatus
        FROM Families family WITH (UPDLOCK, HOLDLOCK)
        INNER JOIN Residents headResident ON headResident.ResidentID = family.Head
        WHERE family.FamilyID = @0
      `, [profile.familyId]);

      if (familyRows.length === 0) {
        throw new NotFoundException('The selected family unit was not found.');
      }

      const family = familyRows[0];

      if (!this.isActiveStatus(family.FamilyStatus) || !this.isActiveStatus(family.FamilyHeadStatus)) {
        throw new BadRequestException('A resident profile can only be linked to an active family unit.');
      }

      // The current SQL schema has no Families.AddressID column.
      // A family is matched to a household through the household of its family head.
      if (Number(family.HeadAddressID) !== Number(profile.householdId)) {
        throw new BadRequestException('The selected family unit does not belong to the selected household.');
      }

      const duplicateRows = await queryRunner.manager.query(`
        SELECT TOP 1 ResidentID
        FROM Residents WITH (UPDLOCK, HOLDLOCK)
        WHERE LOWER(LTRIM(RTRIM(Name))) = LOWER(@0)
          AND BirthDate = @1
          AND Address = @2
      `, [profile.fullName, profile.birthDate, profile.householdId]);

      if (duplicateRows.length > 0) {
        throw new ConflictException('A resident with the same name, birth date, and household already exists.');
      }

      const nextResidentRows = await queryRunner.manager.query(`
        SELECT ISNULL(MAX(ResidentID), 0) + 1 AS NextResidentID
        FROM Residents WITH (UPDLOCK, HOLDLOCK)
      `);

      const residentId = Number(nextResidentRows[0].NextResidentID);

      await queryRunner.manager.query(`
        INSERT INTO Residents
          (ResidentID, Name, BirthDate, Age, Sex, ContactNo, Occupation, Citizenship, CivilStatus, Status, Address)
        VALUES
          (@0, @1, @2, @3, @4, @5, @6, @7, @8, @9, @10)
      `, [
        residentId,
        profile.fullName,
        profile.birthDate,
        profile.age,
        profile.sex,
        profile.contactNumber || null,
        profile.occupation,
        profile.citizenship,
        profile.civilStatus,
        profile.initialStatus,
        profile.householdId
      ]);

      await queryRunner.manager.query(`
        INSERT INTO FamilyRelations (FamilyID, ResidentID, Relation)
        VALUES (@0, @1, @2)
      `, [profile.familyId, residentId, profile.relationshipToFamilyHead]);

      await queryRunner.manager.query(`
        UPDATE Families
        SET MemberCount = (
          SELECT COUNT(*)
          FROM FamilyRelations
          WHERE FamilyID = @0
        )
        WHERE FamilyID = @0
      `, [profile.familyId]);

      await queryRunner.commitTransaction();

      return {
        message: 'Resident profile saved successfully.',
        data: {
          residentId: this.formatResidentId(residentId),
          dbResidentId: residentId,
          fullName: profile.fullName,
          birthDate: profile.birthDate,
          age: profile.age,
          sex: profile.sex,
          civilStatus: profile.civilStatus,
          contactNumber: profile.contactNumber,
          occupation: profile.occupation,
          citizenship: profile.citizenship,
          residencyStatus: profile.initialStatus,
          householdId: this.formatHouseholdId(profile.householdId),
          addressId: profile.householdId,
          barangay: household.Barangay,
          streetAddress: [household.HouseNo, household.Street].filter(Boolean).join(' '),
          familyId: this.formatFamilyId(profile.familyId),
          dbFamilyId: profile.familyId,
          familyHeadId: this.formatResidentId(family.FamilyHeadID),
          familyHeadName: family.FamilyHeadName,
          relationshipToFamilyHead: profile.relationshipToFamilyHead
        }
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    return [
      {
        AddressID: 1,
        Barangay: "Fort Bonifacio", 
        HouseNo: "12-A",
        Street: "5th Avenue",
        ResidencyLength: "2 years",
        HouseholdType: "Nuclear Family",
        Status: "Rented"
      },
      {
        AddressID: 2,
        Barangay: "Pinagsama", 
        HouseNo: "45",
        Street: "Bayani Road",
        ResidencyLength: "8 years",
        HouseholdType: "Extended Family",
        Status: "Owned"
      },
      {
        AddressID: 3,
        Barangay: "Ususan", 
        HouseNo: "108",
        Street: "Gen. Luna St.",
        ResidencyLength: "15 years",
        HouseholdType: "Nuclear Family",
        Status: "Owned"
      },
      {
        AddressID: 4,
        Barangay: "Tuktukan", 
        HouseNo: "22-B",
        Street: "M.L. Quezon St.",
        ResidencyLength: "6 months",
        HouseholdType: "Single Person",
        Status: "Rented"
      },
      {
        AddressID: 5,
        Barangay: "Wawa", 
        HouseNo: "7",
        Street: "Guerrero St.",
        ResidencyLength: "25 years",
        HouseholdType: "Extended Family",
        Status: "Rented-free"
      },
    ];
  }

  findOne(id) {
    return { id, message: 'Household details placeholder' };
  }

  create(createHouseholdDto) {
    return { message: 'Household creation placeholder', data: createHouseholdDto };
  }

  update(id, updateHouseholdDto) {
    return { id, message: 'Household update placeholder', data: updateHouseholdDto };
  }

  remove(id) {
    return { id, message: 'Household deletion placeholder' };
  }

  validateProfile(dto = {}) {
    const fullName = this.requiredText(dto.fullName || dto.name, 'Full name', 150);
    const birthDate = this.validateBirthDate(dto.birthDate || dto.dateOfBirth);
    const sex = this.requiredText(dto.sex, 'Sex', 20);
    const civilStatus = this.requiredText(dto.civilStatus, 'Civil status', 20);
    const occupation = this.requiredText(dto.occupation, 'Occupation', 50);
    const citizenship = this.requiredText(dto.citizenship, 'Citizenship', 50);
    const householdId = this.parseId(dto.householdId || dto.addressId, 'H-');
    const familyId = this.parseId(dto.familyId, 'F-');
    const contactNumber = this.validateContactNumber(dto.contactNumber || dto.contactNo);
    const initialStatus = this.normalizeResidentStatus(dto.initialStatus || dto.residencyStatus || dto.status);
    const relationshipToFamilyHead = this.optionalText(dto.relationshipToFamilyHead || dto.relation || 'Member', 20);

    if (!householdId) {
      throw new BadRequestException('A valid household link is required.');
    }

    if (!familyId) {
      throw new BadRequestException('A valid family unit link is required.');
    }

    if (relationshipToFamilyHead.toLowerCase() === 'head') {
      throw new BadRequestException('Use the family-management process to change a family head.');
    }

    return {
      fullName,
      birthDate,
      age: this.calculateAge(birthDate),
      sex,
      civilStatus,
      contactNumber,
      occupation,
      citizenship,
      householdId,
      familyId,
      initialStatus,
      relationshipToFamilyHead
    };
  }

  requiredText(value, fieldName, maxLength) {
    const text = this.optionalText(value, maxLength);

    if (!text) {
      throw new BadRequestException(`${fieldName} is required.`);
    }

    return text;
  }

  optionalText(value, maxLength) {
    const text = value === undefined || value === null ? '' : String(value).trim().replace(/\s+/g, ' ');

    if (text.length > maxLength) {
      throw new BadRequestException(`The value must not exceed ${maxLength} characters.`);
    }

    return text;
  }

  validateBirthDate(value) {
    const dateText = this.optionalText(value, 10);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
      throw new BadRequestException('Birth date must use the YYYY-MM-DD format.');
    }

    const date = new Date(`${dateText}T00:00:00`);

    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dateText) {
      throw new BadRequestException('Birth date is invalid.');
    }

    if (date > new Date()) {
      throw new BadRequestException('Birth date cannot be in the future.');
    }

    const age = this.calculateAge(dateText);

    if (age > 120) {
      throw new BadRequestException('Birth date produces an invalid age.');
    }

    return dateText;
  }

  validateContactNumber(value) {
    const contactNumber = this.optionalText(value, 20);

    if (!contactNumber) {
      return '';
    }

    if (!/^\d{11}$/.test(contactNumber)) {
      throw new BadRequestException('Contact number must contain exactly 11 digits.');
    }

    return contactNumber;
  }

  normalizeResidentStatus(value) {
    const status = this.optionalText(value || 'Active', 20).toLowerCase();
    const allowedStatuses = {
      active: 'Active',
      'active record': 'Active',
      inactive: 'Inactive',
      'inactive record': 'Inactive',
      moved: 'Moved',
      transferred: 'Moved',
      deceased: 'Deceased'
    };

    if (!allowedStatuses[status]) {
      throw new BadRequestException('Initial status must be Active, Inactive, Moved, or Deceased.');
    }

    return allowedStatuses[status];
  }

  calculateAge(birthDate) {
    const birth = new Date(`${birthDate}T00:00:00`);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();
    const hasNotReachedBirthday = monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate());

    if (hasNotReachedBirthday) {
      age -= 1;
    }

    return age;
  }

  parseId(value, prefix) {
    if (value === undefined || value === null || value === '') {
      return 0;
    }

    const cleanedValue = String(value).trim().replace(new RegExp(`^${prefix}`, 'i'), '');
    const id = Number.parseInt(cleanedValue, 10);

    return Number.isInteger(id) && id > 0 ? id : 0;
  }

  isActiveStatus(value) {
    return String(value || '').trim().toLowerCase() === 'active';
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
}
