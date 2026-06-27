import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DashboardModule } from './dashboard/dashboard.module';
import { ResidentsModule } from './residents/residents.module';
import { HouseholdsModule } from './households/households.module';
import { ReportsModule } from './reports/reports.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    DashboardModule,
    ResidentsModule,
    HouseholdsModule,
    ReportsModule,
    SettingsModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
