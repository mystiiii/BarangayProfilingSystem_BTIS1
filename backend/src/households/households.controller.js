import { Controller, Get, Post, Patch, Delete, Body, Param, Dependencies } from '@nestjs/common';
import { HouseholdsService } from './households.service';

@Controller('households')
@Dependencies(HouseholdsService)
export class HouseholdsController {
  constructor(householdsService) {
    this.householdsService = householdsService;
  }

  @Get()
  findAll() {
    return this.householdsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id) {
    return this.householdsService.findOne(id);
  }

  @Post()
  create(@Body() createHouseholdDto) {
    return this.householdsService.create(createHouseholdDto);
  }

  @Patch(':id')
  update(@Param('id') id, @Body() updateHouseholdDto) {
    return this.householdsService.update(id, updateHouseholdDto);
  }

  @Delete(':id')
  remove(@Param('id') id) {
    return this.householdsService.remove(id);
  }
}
