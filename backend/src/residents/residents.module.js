import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResidentsController } from './residents.controller';
import { ResidentsService } from './residents.service';
import { Resident } from './resident.entity';
import { Address } from '../households/address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Resident, Address])],
  controllers: [ResidentsController],
  providers: [ResidentsService],
  exports: [ResidentsService]
})
export class ResidentsModule {}
