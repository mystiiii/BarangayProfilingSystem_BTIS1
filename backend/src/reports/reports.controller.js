import { Controller, Get, Post, Body, Dependencies } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
@Dependencies(ReportsService)
export class ReportsController {
  constructor(reportsService) {
    this.reportsService = reportsService;
  }

  @Get('history')
  getHistory() {
    return this.reportsService.getHistory();
  }

  @Post('generate')
  generate(@Body() generateReportDto) {
    return this.reportsService.generate(generateReportDto);
  }
}
