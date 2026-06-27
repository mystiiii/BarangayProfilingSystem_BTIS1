import { Injectable } from '@nestjs/common';

@Injectable()
export class HouseholdsService {
  constructor() {
    this.mockHouseholds = [
      { id: 'HH-2026-0012', name: 'Mauri Family', head: 'Julianne Mauri', members: 4, zone: 'Zone 3', status: 'Active' },
      { id: 'HH-2026-0043', name: 'Dela Cruz Family', head: 'Juan Dela Cruz', members: 5, zone: 'Zone 1', status: 'Active' },
      { id: 'HH-2026-0089', name: 'Santos Family', head: 'Roberto Santos', members: 3, zone: 'Zone 2', status: 'Pending' }
    ];
  }

  findAll() {
    return this.mockHouseholds;
  }

  findOne(id) {
    return this.mockHouseholds.find(h => h.id === id) || { message: 'Household not found' };
  }

  create(createHouseholdDto) {
    const newHousehold = {
      id: `HH-2026-00${this.mockHouseholds.length + 10}`,
      ...createHouseholdDto,
      status: 'Pending'
    };
    this.mockHouseholds.push(newHousehold);
    return newHousehold;
  }

  update(id, updateHouseholdDto) {
    const index = this.mockHouseholds.findIndex(h => h.id === id);
    if (index > -1) {
      this.mockHouseholds[index] = { ...this.mockHouseholds[index], ...updateHouseholdDto };
      return this.mockHouseholds[index];
    }
    return { message: 'Household not found' };
  }

  remove(id) {
    const index = this.mockHouseholds.findIndex(h => h.id === id);
    if (index > -1) {
      const deleted = this.mockHouseholds.splice(index, 1);
      return { message: 'Household deleted successfully', deleted };
    }
    return { message: 'Household not found' };
  }
}
