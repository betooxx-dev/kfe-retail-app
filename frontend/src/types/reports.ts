export interface Sale {
    id: string;
    total: number;
    items: any[];
    createdAt: string;
}

export interface SalesByDateReport {
    totalSales: number;
    totalRevenue: number;
    sales: Sale[];
}

export interface TopProductReport {
    productId: string;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
}

export interface DailySalesChart {
    date: string;
    totalSales: number;
    totalRevenue: number;
}
