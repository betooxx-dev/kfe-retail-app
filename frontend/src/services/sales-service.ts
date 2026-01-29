import { api } from "@/api/api";
import { CreateSaleDto, Sale } from "@/types/sales";
import { PaginatedResult } from "@/types/products";
import { format, subMonths } from "date-fns";

export class SalesService {
    static create = async (createSaleDto: CreateSaleDto): Promise<Sale> => {
        const { data } = await api.post("/sales", createSaleDto);
        return data.data;
    }

    static getAll = async (params: { page?: number; perPage?: number; startDate?: string; endDate?: string } = {}): Promise<PaginatedResult<Sale>> => {
        const defaultStart = format(subMonths(new Date(), 1), "yyyy-MM-dd");
        const defaultEnd = format(new Date(), "yyyy-MM-dd");

        const finalParams = {
            ...params,
            startDate: params.startDate || defaultStart,
            endDate: params.endDate || defaultEnd
        };

        const { data } = await api.get("/sales", { params: finalParams });
        return data.data;
    }

    static getById = async (id: string): Promise<Sale> => {
        const { data } = await api.get(`/sales/${id}`);
        return data.data;
    }
}
