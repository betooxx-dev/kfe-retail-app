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

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  private readonly logger = new Logger(ReportsController.name);

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
    this.logger.log(
      `Generating sales report from ${start.toISOString()} to ${end.toISOString()}`,
    );
    const sales = await this.reportsService.getSalesByDate(start, end);
    this.logger.log(`Generated sales report with ${sales.totalSales} sales`);
    return sales;
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
    this.logger.log(`Fetching top ${limit} products`);
    const products = await this.reportsService.getTopProducts(limit);
    this.logger.log(`Fetched top ${products.length} products`);
    return products;
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
    this.logger.log(
      `Generating daily sales chart from ${start.toISOString()} to ${end.toISOString()}`,
    );
    const chart = await this.reportsService.getDailySalesChart(start, end);
    this.logger.log(`Generated daily sales chart with ${chart.length} entries`);
    return chart;
  }
}
