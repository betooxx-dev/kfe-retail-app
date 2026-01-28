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

  async getSalesByDate(start: Date, end: Date): Promise<SalesByDateReport> {
    const endOfDay = new Date(end);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const sales = await this.saleRepository.find({
      where: {
        createdAt: Between(start, endOfDay),
      },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });

    const totalRevenue = sales.reduce(
      (sum, sale) => sum + Number(sale.total),
      0,
    );

    return {
      totalSales: sales.length,
      totalRevenue,
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
    const endOfDay = new Date(end);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const result = await this.saleRepository
      .createQueryBuilder('sale')
      .select('DATE(sale.createdAt)', 'date')
      .addSelect('COUNT(sale.id)', 'totalSales')
      .addSelect('SUM(sale.total)', 'totalRevenue')
      .where('sale.createdAt BETWEEN :start AND :end', {
        start,
        end: endOfDay,
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
