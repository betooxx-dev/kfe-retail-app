import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { SalesService } from './sales.service';
import { CreateSaleDto, QuerySaleDto } from './dto';
import { Sale } from './entities';
import { PaginatedResult } from '@common/index';

@ApiTags('Sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  private readonly logger = new Logger(SalesController.name);

  @Post()
  @ApiOperation({ summary: 'Create a new sale' })
  @ApiResponse({ status: 201, description: 'Sale created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or insufficient stock',
  })
  async create(@Body() createSaleDto: CreateSaleDto): Promise<Sale> {
    this.logger.log('Creating a new sale');
    const sale = await this.salesService.create(createSaleDto);
    this.logger.log(`Sale created with ID: ${sale.id}`);
    return sale;
  }

  @Get()
  @ApiOperation({ summary: 'Get all sales' })
  @ApiResponse({ status: 200, description: 'List of sales' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter by start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter by end date (YYYY-MM-DD)',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'perPage', required: false, description: 'Items per page' })
  async findAll(@Query() query: QuerySaleDto): Promise<PaginatedResult<Sale>> {
    return await this.salesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a sale by ID' })
  @ApiResponse({ status: 200, description: 'Sale found' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Sale> {
    this.logger.log(`Fetching sale with ID: ${id}`);
    return await this.salesService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a sale (restores stock)' })
  @ApiResponse({ status: 200, description: 'Sale deleted' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    this.logger.log(`Deleting sale with ID: ${id}`);
    return await this.salesService.remove(id);
  }
}
