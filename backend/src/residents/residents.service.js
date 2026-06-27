import { Injectable, Dependencies } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Resident } from './resident.entity';

@Injectable()
@Dependencies(getRepositoryToken(Resident))
export class ResidentsService {
  constructor(residentRepository) {
    this.residentRepository = residentRepository;
  }

  // Example DB retrieval: return await this.residentRepository.find();
  findAll() {
    return [];
  }

  // Example DB retrieval: return await this.residentRepository.findOneBy({ ResidentID: id });
  findOne(id) {
    return { id, message: 'Resident details placeholder' };
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
}
