import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  getStats() {
    return {
      totalResidents: 1248,
      totalHouseholds: 312,
      pendingApprovals: 18,
      exportedReports: 42
    };
  }
}
