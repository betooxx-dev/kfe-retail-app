import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { ReportsService } from './reports.service';
import {
  SalesByDateReport,
  TopProductReport,
  DailySalesChart,
} from './interfaces';
import { ParseDatePipe } from '@common/index';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';

@ApiTags('Reports')
@Controller('reports')
@Auth(ValidRoles.manager, ValidRoles.admin)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Get('sales-by-date')
  @ApiOperation({ summary: 'Get sales report by date range' })
  @ApiResponse({
    status: 200,
    description: 'Sales report for the given date range',
  })
  @ApiQuery({
    name: 'start',
    required: true,
    description: 'Start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'end',
    required: true,
    description: 'End date (YYYY-MM-DD)',
  })
  async getSalesByDate(
    @Query('start', ParseDatePipe) start: Date,
    @Query('end', ParseDatePipe) end: Date,
  ): Promise<SalesByDateReport> {
    return await this.reportsService.getSalesByDate(start, end);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Get top selling products' })
  @ApiResponse({ status: 200, description: 'List of top selling products' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of products to return (default: 10)',
  })
  async getTopProducts(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<TopProductReport[]> {
    return await this.reportsService.getTopProducts(limit);
  }

  @Get('daily-sales-chart')
  @ApiOperation({ summary: 'Get daily sales data for charts' })
  @ApiResponse({ status: 200, description: 'Daily sales aggregated data' })
  @ApiQuery({
    name: 'start',
    required: true,
    description: 'Start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'end',
    required: true,
    description: 'End date (YYYY-MM-DD)',
  })
  async getDailySalesChart(
    @Query('start', ParseDatePipe) start: Date,
    @Query('end', ParseDatePipe) end: Date,
  ): Promise<DailySalesChart[]> {
    return await this.reportsService.getDailySalesChart(start, end);
  }
}
