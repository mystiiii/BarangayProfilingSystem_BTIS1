import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResidentsController } from './residents.controller';
import { ResidentsService } from './residents.service';
import { Resident } from './resident.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Resident])],
  controllers: [ResidentsController],
  providers: [ResidentsService],
  exports: [ResidentsService]
})
export class ResidentsModule {}
