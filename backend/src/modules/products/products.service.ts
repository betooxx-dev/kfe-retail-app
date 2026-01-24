import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, ILike } from 'typeorm';

import { CreateProductDto, UpdateProductDto, QueryProductDto } from './dto';
import { Product } from './entities/product.entity';
import { DEFAULT_PER_PAGE, PaginatedResult } from '@common/index';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    return await this.productRepository.save(createProductDto);
  }

  async findAll(query: QueryProductDto): Promise<PaginatedResult<Product>> {
    const { search, page = 1, perPage = DEFAULT_PER_PAGE } = query;

    const where: any = { isActive: true };

    if (search) where.name = ILike(`%${search}%`);

    const [data, total] = await this.productRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    return {
      data,
      meta: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, isActive: true, deletedAt: IsNull() },
    });

    if (!product)
      throw new NotFoundException(`Product with ID ${id} not found`);

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);

    Object.assign(product, updateProductDto);

    return await this.productRepository.save(product);
  }

  async remove(id: string, softDelete: boolean = false): Promise<{ message: string }> {
    const product = await this.findOne(id);

    if (softDelete) {
      await this.productRepository.softRemove(product);
      return { message: `Product with ID ${id} successfully soft deleted` };
    }

    product.isActive = false;
    await this.productRepository.save(product);

    return { message: `Product with ID ${id} successfully deactivated` };
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.findOne(id);

    if (product.stock + quantity < 0)
      throw new BadRequestException(
        `Insufficient stock for product ${product.name}`,
      );

    product.stock += quantity;

    return await this.productRepository.save(product);
  }
}
