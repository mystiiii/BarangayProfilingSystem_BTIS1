import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportsService {
  constructor() {
    this.mockHistory = [
      { filename: 'demographics_zone_all.pdf', timestamp: 'Today, 10:14 AM', size: '2.4 MB' },
      { filename: 'households_list.csv', timestamp: 'Yesterday, 4:32 PM', size: '45 KB' },
      { filename: 'age_distribution.pdf', timestamp: 'June 24, 2026', size: '1.8 MB' }
    ];
  }

  getHistory() {
    return this.mockHistory;
  }

  generate(dto) {
    const filename = `${dto.type || 'demographics'}_zone_${dto.zone || 'all'}.${dto.format || 'pdf'}`;
    const newReport = {
      filename,
      timestamp: 'Just now',
      size: '1.2 MB'
    };
    this.mockHistory.unshift(newReport);
    return {
      message: 'Report generated successfully',
      report: newReport
    };
  }
}
