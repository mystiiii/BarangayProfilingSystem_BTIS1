import { Controller, Get, Dependencies } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@Dependencies(DashboardService)
export class DashboardController {
  constructor(dashboardService) {
    this.dashboardService = dashboardService;
  }

  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }
}
