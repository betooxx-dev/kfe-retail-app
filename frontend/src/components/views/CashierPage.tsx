"use client";

import { useState, useEffect, useMemo } from "react";
import AuthGuard from "@/components/common/AuthGuard";
import DashboardLayout from "@/components/common/DashboardLayout";
import { ProductsService } from "@/services/products-service";
import { SalesService } from "@/services/sales-service";
import { Product } from "@/types/products";
import { CartItem, CreateSaleDto } from "@/types/sales";
import { FaShoppingCart, FaSearch, FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import { Toaster, toast } from 'react-hot-toast';

export default function CashierPage() {
    const navItems = [
        { name: "Punto de Venta", href: "/cashier", icon: <FaShoppingCart className="w-5 h-5" /> },
    ];

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setIsLoading(true);
        try {
            const result = await ProductsService.getAll({ limit: 100 });
            setProducts(result.data.filter(p => p.isActive && p.stock > 0));
        } catch (error) {
            console.error("Failed to load products", error);
            toast.error("Error al cargar productos");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const cartTotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
    }, [cart]);

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) {
                    toast.error("Stock insuficiente");
                    return prev;
                }
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product: { id: product.id, name: product.name, price: Number(product.price) }, quantity: 1 }];
        });
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => {
            return prev.map(item => {
                if (item.product.id === productId) {
                    const newQuantity = item.quantity + delta;
                    if (newQuantity <= 0) return null; // Remove if 0

                    return { ...item, quantity: newQuantity };
                }
                return item;
            }).filter(Boolean) as CartItem[];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setIsProcessing(true);

        const createSaleDto: CreateSaleDto = {
            items: cart.map(item => ({
                productId: item.product.id,
                quantity: item.quantity
            }))
        };

        try {
            await SalesService.create(createSaleDto);
            toast.success("¡Venta completada con éxito!");
            setCart([]);
            setIsCheckoutModalOpen(false);
            loadProducts();
        } catch (error: any) {
            console.error("Checkout failed", error);
            const msg = error.response?.data?.message || "Error al procesar la venta";
            toast.error(typeof msg === 'string' ? msg : "Error al procesar la venta");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <AuthGuard>
            <DashboardLayout titleSuffix="Caja" navItems={navItems}>
                <Toaster position="top-right" />
                <div className="flex h-[calc(100vh-8rem)] gap-6">
                    {/* Product Grid Area */}
                    <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Search Header */}
                        <div className="p-4 border-b border-gray-100">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar productos..."
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A3B32]/20 focus:border-[#4A3B32] transition-colors"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-full text-gray-400">Cargando productos...</div>
                            ) : filteredProducts.length === 0 ? (
                                <div className="flex justify-center items-center h-full text-gray-400">No se encontraron productos</div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {filteredProducts.map(product => (
                                        <button
                                            key={product.id}
                                            onClick={() => addToCart(product)}
                                            className="group flex flex-col items-start bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#4A3B32]/30 transition-all text-left"
                                        >
                                            <div className="w-12 h-12 bg-[#D4A373]/10 rounded-lg flex items-center justify-center text-[#D4A373] mb-3 group-hover:bg-[#4A3B32] group-hover:text-white transition-colors">
                                                <span className="font-bold text-lg">{product.name.charAt(0)}</span>
                                            </div>
                                            <h3 className="font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
                                            <div className="mt-2 flex justify-between w-full items-end">
                                                <span className="text-lg font-bold text-[#4A3B32]">${Number(product.price).toFixed(2)}</span>
                                                <span className="text-xs text-gray-500">{product.stock} disponibles</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cart Sidebar */}
                    <div className="w-96 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                <FaShoppingCart className="text-[#4A3B32]" />
                                Orden Actual
                            </h2>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                                    <FaShoppingCart className="text-4xl opacity-20" />
                                    <p>El carrito está vacío</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.product.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                                            <p className="text-[#4A3B32] font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, -1)}
                                                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                                                >
                                                    {item.quantity === 1 ? <FaTrash size={12} /> : <FaMinus size={12} />}
                                                </button>
                                                <span className="w-8 text-center font-medium text-gray-900 text-sm">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, 1)}
                                                    className="p-2 text-gray-500 hover:text-[#4A3B32] transition-colors"
                                                >
                                                    <FaPlus size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-4">
                            <div className="flex justify-between items-center text-gray-600">
                                <span>Subtotal</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xl font-bold text-[#4A3B32]">
                                <span>Total</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <button
                                onClick={() => setIsCheckoutModalOpen(true)}
                                disabled={cart.length === 0}
                                className="w-full py-3 bg-[#4A3B32] text-white rounded-lg font-medium hover:bg-[#3A2E27] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#4A3B32]/20"
                            >
                                Procesar Venta
                            </button>
                        </div>
                    </div>
                </div>

                {/* Checkout Confirmation Modal */}
                {isCheckoutModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 m-4 animate-in fade-in zoom-in duration-200">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmar Venta</h3>

                            <div className="space-y-4 mb-6">
                                <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Items</span>
                                        <span>{cart.reduce((a, b) => a + b.quantity, 0)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold text-[#4A3B32] pt-2 border-t border-gray-200">
                                        <span>Total a Pagar</span>
                                        <span>${cartTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 text-center">
                                    Proceder completará la venta y actualizará el inventario.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsCheckoutModalOpen(false)}
                                    className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleCheckout}
                                    disabled={isProcessing}
                                    className="flex-1 py-2.5 bg-[#4A3B32] text-white rounded-lg hover:bg-[#3A2E27] font-medium transition-colors disabled:opacity-70 flex justify-center items-center"
                                >
                                    {isProcessing ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : "Confirmar Pago"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </AuthGuard>
    );
}
