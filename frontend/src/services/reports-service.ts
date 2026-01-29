import { api } from "@/api/api";
import { SalesByDateReport, TopProductReport, DailySalesChart } from "@/types/reports";

export class ReportsService {
    static getSalesByDate = async (
        start: string,
        end: string,
        page: number = 1,
        limit: number = 10,
        search?: string
    ): Promise<SalesByDateReport> => {
        const { data } = await api.get("/reports/sales-by-date", {
            params: { start, end, page, limit, search }
        });
        return data.data;
    }

    static getTopProducts = async (limit: number = 3): Promise<TopProductReport[]> => {
        const { data } = await api.get("/reports/top-products", {
            params: { limit }
        });
        return data.data;
    }

    static getDailySalesChart = async (start: string, end: string): Promise<DailySalesChart[]> => {
        const { data } = await api.get("/reports/daily-sales-chart", {
            params: { start, end }
        });
        return data.data;
    }
}
