export interface Product {
    id: string;
    name: string;
    price: number | string;
    stock: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateProductDto {
    name: string;
    price: number;
    stock?: number;
    isActive?: boolean;
}

export interface UpdateProductDto extends Partial<CreateProductDto> { }

export interface Meta {
    total: number;
    page: number;
    lastPage: number;
}

export interface PaginatedResult<T> {
    data: T[];
    meta: Meta;
}

export interface ProductQueryParams {
    page?: number;
    perPage?: number;
    limit?: number;
    search?: string;
}
