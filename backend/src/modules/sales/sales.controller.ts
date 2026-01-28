import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { SalesService } from './sales.service';
import { CreateSaleDto, QuerySaleDto } from './dto';
import { Sale } from './entities';
import { PaginatedResult } from '@common/index';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';

@ApiTags('Sales')
@Controller('sales')
@Auth(ValidRoles.cashier, ValidRoles.admin)
export class SalesController {
  constructor(private readonly salesService: SalesService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new sale' })
  @ApiResponse({ status: 201, description: 'Sale created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or insufficient stock',
  })
  async create(@Body() createSaleDto: CreateSaleDto): Promise<Sale> {
    const sale = await this.salesService.create(createSaleDto);
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
    return await this.salesService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a sale (restores stock)' })
  @ApiResponse({ status: 200, description: 'Sale deleted' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    return await this.salesService.remove(id);
  }
}
