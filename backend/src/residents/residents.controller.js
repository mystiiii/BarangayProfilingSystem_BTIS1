import { Controller, Get, Post, Patch, Delete, Body, Param, Dependencies } from '@nestjs/common';
import { ResidentsService } from './residents.service';

@Controller('residents')
@Dependencies(ResidentsService)
export class ResidentsController {
  constructor(residentsService) {
    this.residentsService = residentsService;
  }

  @Get()
  findAll() {
    return this.residentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id) {
    return this.residentsService.findOne(id);
  }

  @Post()
  create(@Body() createResidentDto) {
    return this.residentsService.create(createResidentDto);
  }

  @Patch(':id')
  update(@Param('id') id, @Body() updateResidentDto) {
    return this.residentsService.update(id, updateResidentDto);
  }

  @Delete(':id')
  remove(@Param('id') id) {
    return this.residentsService.remove(id);
  }
}
