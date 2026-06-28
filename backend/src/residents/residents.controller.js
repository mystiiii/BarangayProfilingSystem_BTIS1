import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Dependencies, Bind } from '@nestjs/common';
import { ResidentsService } from './residents.service';

@Controller('residents')
@Dependencies(ResidentsService)
export class ResidentsController {
  constructor(residentsService) {
    this.residentsService = residentsService;
  }

  @Get()
  @Bind(Query())
  findAll(query) {
    return this.residentsService.findAll(query);
  }

  @Get('table')
  @Bind(Query())
  findTable(query) {
    return this.residentsService.findTable(query);
  }

  @Get(':id')
  @Bind(Param('id'))
  findOne(id) {
    return this.residentsService.findOne(id);
  }

  @Post()
  @Bind(Body())
  create(createResidentDto) {
    return this.residentsService.create(createResidentDto);
  }

  @Patch(':id')
  @Bind(Param('id'), Body())
  update(id, updateResidentDto) {
    return this.residentsService.update(id, updateResidentDto);
  }

  @Delete(':id')
  @Bind(Param('id'))
  remove(id) {
    return this.residentsService.remove(id);
  }
}
