"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/common/DashboardLayout";
import ProductTable from "@/components/admin/ProductTable";
import ProductModal from "@/components/admin/ProductModal";
import { ProductsService } from "@/services/products-service";
import { Product, Meta, CreateProductDto, UpdateProductDto } from "@/types/products";

export default function AdminPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, lastPage: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 2000);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const loadProducts = useCallback(async (page: number = 1, search: string = "") => {
        setIsLoading(true);
        try {
            const result = await ProductsService.getAll({ page, perPage: 10, search });
            setProducts(result.data);
            setMeta(result.meta);
        } catch (error) {
            console.error("Failed to load products", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProducts(1, debouncedSearch);
    }, [debouncedSearch, loadProducts]);

    const handleCreate = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await ProductsService.remove(id);
            loadProducts(meta.page, debouncedSearch);
        } catch (error) {
            console.error("Failed to delete product", error);
            alert("Failed to delete product");
        }
    };

    const handleFormSubmit = async (data: CreateProductDto | UpdateProductDto) => {
        setIsSubmitting(true);
        try {
            if (editingProduct) {
                await ProductsService.update(editingProduct.id, data);
            } else {
                await ProductsService.create(data as CreateProductDto);
            }
            setIsModalOpen(false);
            loadProducts(meta.page, debouncedSearch);
        } catch (error) {
            console.error("Failed to save product", error);
            alert("Failed to save product");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePageChange = (page: number) => {
        loadProducts(page, debouncedSearch);
    };

    const navItems = [
        {
            name: "Products",
            href: "/admin",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            )
        }
    ];

    return (
        <DashboardLayout titleSuffix="Admin" navItems={navItems}>
            <div className="flex flex-col space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-light text-[#4A3B32]">Products</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage your coffee shop inventory</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A3B32] focus:border-[#4A3B32] transition-colors"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <button
                            onClick={handleCreate}
                            className="flex items-center space-x-2 px-4 py-2 bg-[#4A3B32] text-white rounded-lg hover:bg-[#3E3028] shadow-md transition-all cursor-pointer whitespace-nowrap"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Add Product</span>
                        </button>
                    </div>
                </div>

                <ProductTable
                    products={products}
                    meta={meta}
                    onPageChange={handlePageChange}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isLoading={isLoading}
                />

                <ProductModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleFormSubmit}
                    initialData={editingProduct}
                    isSubmitting={isSubmitting}
                />
            </div>
        </DashboardLayout>
    );
}
