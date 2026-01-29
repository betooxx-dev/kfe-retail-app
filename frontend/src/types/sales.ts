export interface CreateSaleItemDto {
    productId: string;
    quantity: number;
}

export interface CreateSaleDto {
    items: CreateSaleItemDto[];
}

export interface SaleItem {
    id: string;
    quantity: number;
    price: number;
    productId: string;
    productName?: string;
}

export interface Sale {
    id: string;
    total: number;
    createdAt: string;
    items: SaleItem[];
}

export interface CartItem {
    product: {
        id: string;
        name: string;
        price: number;
    };
    quantity: number;
}
