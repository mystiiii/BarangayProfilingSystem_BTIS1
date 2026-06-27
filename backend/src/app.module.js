import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResidentsModule } from './residents/residents.module';
import { HouseholdsModule } from './households/households.module';

@Module({
  imports: [
    ResidentsModule,
    HouseholdsModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
