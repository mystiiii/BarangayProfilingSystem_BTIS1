import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      status: 'healthy',
      message: 'Barangay Profiling System Backend API is online.'
    };
  }
}
