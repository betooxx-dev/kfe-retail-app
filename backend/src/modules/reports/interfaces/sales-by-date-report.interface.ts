import { Sale } from '@sales/entities';

export interface SalesByDateReport {
  totalSales: number;
  totalRevenue: number;
  sales: Sale[];
}
