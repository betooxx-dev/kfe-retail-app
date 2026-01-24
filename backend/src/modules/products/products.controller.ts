import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Logger,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from './dto';
import { Product } from './entities/product.entity';
import { PaginatedResult } from '@common/index';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  private readonly logger = new Logger(ProductsController.name);

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    this.logger.log('Creating a new product');
    const product = await this.productsService.create(createProductDto);
    this.logger.log(`Product created with ID: ${product.id}`);
    return product;
  }

  @Get()
  @ApiOperation({ summary: 'Get all active products' })
  @ApiResponse({ status: 200, description: 'List of products' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'perPage', required: false, description: 'Items per page' })
  async findAll(@Query() query: QueryProductDto): Promise<PaginatedResult<Product>> {
    return await this.productsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Product> {
    this.logger.log(`Fetching product with ID: ${id}`);
    const product = await this.productsService.findOne(id);
    this.logger.log(`Product with ID: ${id} fetched successfully`);
    return product;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'Product updated' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    this.logger.log(`Updating product with ID: ${id}`);
    const updatedProduct = await this.productsService.update(
      id,
      updateProductDto,
    );
    this.logger.log(`Product with ID: ${id} updated successfully`);
    return updatedProduct;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product (soft delete)' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    this.logger.log(`Deleting product with ID: ${id}`);
    const result = await this.productsService.remove(id);
    this.logger.log(`Product with ID: ${id} deleted successfully`);
    return result;
  }
}
