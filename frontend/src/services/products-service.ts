import { api } from "@/api/api";
import {
    Product,
    PaginatedResult,
    ProductQueryParams,
    CreateProductDto,
    UpdateProductDto
} from "@/types/products";

export class ProductsService {
    static getAll = async (params?: ProductQueryParams): Promise<PaginatedResult<Product>> => {
        const { data } = await api.get<PaginatedResult<Product>>("/products", { params });
        return data;
    }

    static getById = async (id: string): Promise<Product> => {
        const { data } = await api.get<Product>(`/products/${id}`);
        return data;
    }

    static create = async (product: CreateProductDto): Promise<Product> => {
        const { data } = await api.post<Product>("/products", product);
        return data;
    }

    static update = async (id: string, product: UpdateProductDto): Promise<Product> => {
        const { data } = await api.patch<Product>(`/products/${id}`, product);
        return data;
    }

    static remove = async (id: string): Promise<void> => {
        await api.delete(`/products/${id}`);
    }
}
