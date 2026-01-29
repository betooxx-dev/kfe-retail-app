import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, DataSource } from 'typeorm';

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
    private readonly dataSource: DataSource,
  ) { }

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    const { items } = createSaleDto;

    if (!items || items.length === 0)
      throw new BadRequestException('Sale must have at least one item');

    return await this.dataSource.transaction(async (manager) => {
      let total = 0;
      const productsToProcess: { product: any; quantity: number; price: number }[] = [];

      for (const item of items) {
        const product = await this.productsService.findOne(item.productId);

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${product.name}. Available: ${product.stock}`,
          );
        }

        const itemTotal = Number(product.price) * item.quantity;
        total += itemTotal;
        productsToProcess.push({ product, quantity: item.quantity, price: product.price });
      }

      const sale = manager.create(Sale, {
        total,
        items: [],
      });
      const savedSale = await manager.save(sale);

      const savedItems: SaleItem[] = [];

      for (const itemData of productsToProcess) {
        const saleItem = manager.create(SaleItem, {
          quantity: itemData.quantity,
          price: itemData.price,
          sale: savedSale,
          product: itemData.product,
        });

        const savedItem = await manager.save(saleItem);
        savedItems.push(savedItem);

        const product = itemData.product;
        product.stock -= itemData.quantity;
        await manager.save(product);
      }

      savedSale.items = savedItems;

      return savedSale;
    });
  }

  async findAll(query: QuerySaleDto): Promise<PaginatedResult<Sale>> {
    const { page = 1, perPage = DEFAULT_PER_PAGE, startDate, endDate } = query;

    const where: any = {};

    if (startDate && endDate) {
      where.createdAt = Between(
        `${startDate} 00:00:00`,
        `${endDate} 23:59:59`,
      );
    } else if (startDate) {
      where.createdAt = MoreThanOrEqual(`${startDate} 00:00:00`);
    } else if (endDate) {
      where.createdAt = LessThanOrEqual(`${endDate} 23:59:59`);
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
