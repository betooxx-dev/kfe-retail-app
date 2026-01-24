import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';

import { CreateSaleDto, QuerySaleDto } from './dto';
import { Sale, SaleItem } from './entities';
import { ProductsService } from '@products/products.service';
import { DEFAULT_PER_PAGE, PaginatedResult } from '@common/index';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private readonly saleItemRepository: Repository<SaleItem>,
    private readonly productsService: ProductsService,
  ) {}

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    const { items } = createSaleDto;

    if (!items || items.length === 0)
      throw new BadRequestException('Sale must have at least one item');

    let total = 0;
    const saleItems: Partial<SaleItem>[] = [];

    for (const item of items) {
      const product = await this.productsService.findOne(item.productId);

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}. Available: ${product.stock}`,
        );
      }

      const itemTotal = Number(product.price) * item.quantity;
      total += itemTotal;

      saleItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });

      await this.productsService.updateStock(item.productId, -item.quantity);
    }

    const sale = this.saleRepository.create({
      total,
      items: saleItems as SaleItem[],
    });

    return await this.saleRepository.save(sale);
  }

  async findAll(query: QuerySaleDto): Promise<PaginatedResult<Sale>> {
    const { page = 1, perPage = DEFAULT_PER_PAGE, startDate, endDate } = query;

    const where: any = {};

    if (startDate && endDate) {
      where.createdAt = Between(
        new Date(startDate),
        new Date(endDate + 'T23:59:59'),
      );
    } else if (startDate) {
      where.createdAt = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      where.createdAt = LessThanOrEqual(new Date(endDate + 'T23:59:59'));
    }

    const [data, total] = await this.saleRepository.findAndCount({
      where,
      relations: ['items', 'items.product'],
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

  async findOne(id: string): Promise<Sale> {
    const sale = await this.saleRepository.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    });

    if (!sale) throw new NotFoundException(`Sale with ID ${id} not found`);

    return sale;
  }

  async remove(id: string): Promise<{ message: string }> {
    const sale = await this.findOne(id);

    for (const item of sale.items)
      await this.productsService.updateStock(item.productId, item.quantity);

    await this.saleRepository.remove(sale);

    return { message: `Sale with ID ${id} successfully deleted` };
  }
}
