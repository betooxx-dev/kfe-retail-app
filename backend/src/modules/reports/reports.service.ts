import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';

import { Sale } from '@sales/entities';
import { SaleItem } from '@sales/entities';
import {
  SalesByDateReport,
  TopProductReport,
  DailySalesChart,
} from './interfaces';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private readonly saleItemRepository: Repository<SaleItem>,
  ) { }

  async getSalesByDate(
    start: Date,
    end: Date,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<SalesByDateReport> {
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    // Using string literals for the day range ensures we query "Wall Time" stored in DB
    // e.g. 2026-01-28 00:00:00 to 2026-01-28 23:59:59.999
    const qb = this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.items', 'saleItem')
      .leftJoinAndSelect('saleItem.product', 'product')
      .where('sale.createdAt BETWEEN :start AND :end', {
        start: `${startStr} 00:00:00`,
        end: `${endStr} 23:59:59.999`
      });

    if (search) {
      qb.andWhere(
        'sale.id IN (SELECT "si"."saleId" FROM "sale_items" "si" LEFT JOIN "products" "p" ON "si"."productId" = "p"."id" WHERE "p"."name" ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const totalsQb = qb.clone();
    const totalSalesCount = await totalsQb.getCount();

    const { totalRevenue } = await totalsQb
      .select('SUM(sale.total)', 'totalRevenue')
      .orderBy()
      .getRawOne();

    const sales = await qb
      .orderBy('sale.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      totalSales: totalSalesCount,
      totalRevenue: Number(totalRevenue) || 0,
      sales,
    };
  }

  async getTopProducts(limit: number = 10): Promise<TopProductReport[]> {
    const result = await this.saleItemRepository
      .createQueryBuilder('saleItem')
      .select('saleItem.productId', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('SUM(saleItem.quantity)', 'totalQuantity')
      .addSelect('SUM(saleItem.quantity * saleItem.price)', 'totalRevenue')
      .innerJoin('saleItem.product', 'product')
      .groupBy('saleItem.productId')
      .addGroupBy('product.name')
      .orderBy('"totalQuantity"', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map((row) => ({
      productId: row.productId,
      productName: row.productName,
      totalQuantity: Number(row.totalQuantity),
      totalRevenue: Number(row.totalRevenue),
    }));
  }

  async getDailySalesChart(start: Date, end: Date): Promise<DailySalesChart[]> {
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    const result = await this.saleRepository
      .createQueryBuilder('sale')
      .select('DATE(sale.createdAt)', 'date')
      .addSelect('COUNT(sale.id)', 'totalSales')
      .addSelect('SUM(sale.total)', 'totalRevenue')
      .where('sale.createdAt BETWEEN :start AND :end', {
        start: `${startStr} 00:00:00`,
        end: `${endStr} 23:59:59.999`,
      })
      .groupBy('DATE(sale.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return result.map((row) => ({
      date: row.date,
      totalSales: Number(row.totalSales),
      totalRevenue: Number(row.totalRevenue),
    }));
  }
}
