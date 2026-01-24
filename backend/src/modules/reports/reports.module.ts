import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Sale } from '@sales/entities';
import { SaleItem } from '@sales/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, SaleItem])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
