import { Injectable } from '@nestjs/common';

@Injectable()
export class ResidentsService {
  constructor() {
    this.mockResidents = [];
  }

  findAll() {
    return this.mockResidents;
  }

  findOne(id) {
    return this.mockResidents.find(r => r.id === id) || { message: 'Resident not found' };
  }

  create(createResidentDto) {
    const newResident = {
      id: `RES-2026-000${this.mockResidents.length + 1}`,
      ...createResidentDto,
      status: 'Pending'
    };
    this.mockResidents.push(newResident);
    return newResident;
  }

  update(id, updateResidentDto) {
    const index = this.mockResidents.findIndex(r => r.id === id);
    if (index > -1) {
      this.mockResidents[index] = { ...this.mockResidents[index], ...updateResidentDto };
      return this.mockResidents[index];
    }
    return { message: 'Resident not found' };
  }

  remove(id) {
    const index = this.mockResidents.findIndex(r => r.id === id);
    if (index > -1) {
      const deleted = this.mockResidents.splice(index, 1);
      return { message: 'Resident deleted successfully', deleted };
    }
    return { message: 'Resident not found' };
  }
}
