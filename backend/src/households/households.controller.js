import { Controller, Get, Post, Patch, Delete, Body, Param, Dependencies, Bind } from '@nestjs/common';
import { HouseholdsService } from './households.service';

@Controller('households')
@Dependencies(HouseholdsService)
export class HouseholdsController {
  constructor(householdsService) {
    this.householdsService = householdsService;
  }

  @Get('profile-options')
  getProfileOptions() {
    return this.householdsService.getProfileOptions();
  }

  @Get(':addressId/family-units')
  @Bind(Param('addressId'))
  getFamilyUnits(addressId) {
    return this.householdsService.getFamilyUnits(addressId);
  }

  @Post('new-profile')
  @Bind(Body())
  createNewProfile(newProfileDto) {
    return this.householdsService.createNewProfile(newProfileDto);
  }

  @Get()
  findAll() {
    return this.householdsService.findAll();
  }

  @Get(':id')
  @Bind(Param('id'))
  findOne(id) {
    return this.householdsService.findOne(id);
  }

  @Post()
  @Bind(Body())
  create(createHouseholdDto) {
    return this.householdsService.create(createHouseholdDto);
  }

  @Patch(':id')
  @Bind(Param('id'), Body())
  update(id, updateHouseholdDto) {
    return this.householdsService.update(id, updateHouseholdDto);
  }

  @Delete(':id')
  @Bind(Param('id'))
  remove(id) {
    return this.householdsService.remove(id);
  }
}
