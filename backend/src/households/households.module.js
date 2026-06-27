import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HouseholdsController } from './households.controller';
import { HouseholdsService } from './households.service';
import { Family } from './family.entity';
import { Address } from './address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Family, Address])],
  controllers: [HouseholdsController],
  providers: [HouseholdsService],
  exports: [HouseholdsService]
})
export class HouseholdsModule {}
