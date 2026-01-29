"use client";

import { useState, useEffect, useCallback } from "react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from "recharts";

import { ReportsService } from "@/services/reports-service";
import { SalesByDateReport, TopProductReport, DailySalesChart } from "@/types/reports";
import AuthGuard from "@/components/common/AuthGuard";
import DashboardLayout from "@/components/common/DashboardLayout";

export default function ReportsContent() {
    const [startDate, setStartDate] = useState<string>(
        format(startOfDay(subDays(new Date(), 7)), "yyyy-MM-dd")
    );
    const [endDate, setEndDate] = useState<string>(
        format(endOfDay(new Date()), "yyyy-MM-dd")
    );

    const [salesReport, setSalesReport] = useState<SalesByDateReport | null>(null);
    const [topProducts, setTopProducts] = useState<TopProductReport[]>([]);
    const [dailySales, setDailySales] = useState<DailySalesChart[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [salesData, topData, chartData] = await Promise.all([
                ReportsService.getSalesByDate(startDate, endDate),
                ReportsService.getTopProducts(3),
                ReportsService.getDailySalesChart(startDate, endDate)
            ]);

            setSalesReport(salesData);
            setTopProducts(topData);
            setDailySales(chartData);
        } catch (error) {
            console.error("Failed to load reports", error);
        } finally {
            setIsLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleRangeChange = (days: number) => {
        setStartDate(format(startOfDay(subDays(new Date(), days)), "yyyy-MM-dd"));
        setEndDate(format(endOfDay(new Date()), "yyyy-MM-dd"));
    };

    const navItems = [
        {
            name: "Reportes",
            href: "/manager",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
            )
        }
    ];


    return (
        <AuthGuard>
            <DashboardLayout titleSuffix="Gerente" navItems={navItems}>
                <div className="flex flex-col space-y-6">
                    {/* Header & Filters */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-light text-[#4A3B32]">Reportes de Ventas</h2>
                            <p className="text-sm text-gray-500 mt-1">Visualiza el rendimiento de tu negocio</p>
                        </div>
                        <div className="flex bg-white rounded-lg shadow-sm border border-gray-100 p-1">
                            <button
                                onClick={() => handleRangeChange(7)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${startDate === format(startOfDay(subDays(new Date(), 7)), "yyyy-MM-dd")
                                    ? "bg-[#4A3B32] text-white shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                Últimos 7 Días
                            </button>
                            <button
                                onClick={() => handleRangeChange(30)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${startDate === format(startOfDay(subDays(new Date(), 30)), "yyyy-MM-dd")
                                    ? "bg-[#4A3B32] text-white shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                Últimos 30 Días
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="h-64 flex items-center justify-center text-gray-400">Cargando reportes...</div>
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-sm font-medium text-gray-500">Ingresos Totales</h3>
                                    <p className="text-3xl font-light text-[#4A3B32] mt-2">
                                        ${(salesReport?.totalRevenue ?? 0).toFixed(2)}
                                    </p>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-sm font-medium text-gray-500">Ventas Totales</h3>
                                    <p className="text-3xl font-light text-[#4A3B32] mt-2">
                                        {salesReport?.totalSales || 0}
                                    </p>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-sm font-medium text-gray-500">Ticket Promedio</h3>
                                    <p className="text-3xl font-light text-[#4A3B32] mt-2">
                                        ${(salesReport?.totalSales ? (salesReport.totalRevenue / salesReport.totalSales) : 0).toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            {/* Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Revenue Chart */}
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-medium text-gray-900 mb-6">Tendencia de Ingresos</h3>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={dailySales || []}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                <XAxis
                                                    dataKey="date"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                                    tickFormatter={(str) => format(new Date(str), 'MMM d')}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                                    tickFormatter={(val) => `$${val}`}
                                                />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    formatter={(value: number | undefined) => [`$${value || 0}`, 'Ingresos']}
                                                    labelFormatter={(label) => format(new Date(label), 'dd MMM yyyy')}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="totalRevenue"
                                                    name="Ingresos"
                                                    stroke="#4A3B32"
                                                    strokeWidth={3}
                                                    dot={{ fill: '#4A3B32', strokeWidth: 2 }}
                                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Top Products Chart */}
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-medium text-gray-900 mb-6">Top 3 Productos</h3>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={topProducts || []} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                                                <XAxis type="number" hide />
                                                <YAxis
                                                    dataKey="productName"
                                                    type="category"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#4b5563', fontSize: 14, fontWeight: 500 }}
                                                    width={100}
                                                />
                                                <Tooltip
                                                    cursor={{ fill: 'transparent' }}
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    formatter={(value: number | undefined) => [value || 0, 'Unidades Vendidas']}
                                                />
                                                <Bar dataKey="totalQuantity" name="Unidades Vendidas" fill="#D4A373" radius={[0, 4, 4, 0]} barSize={32} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Sales Table */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h3 className="text-lg font-medium text-gray-900">Ventas Recientes</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 text-gray-500 font-medium">
                                            <tr>
                                                <th className="px-6 py-3">Fecha</th>
                                                <th className="px-6 py-3 text-center">Items</th>
                                                <th className="px-6 py-3 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {(salesReport?.sales || []).slice(0, 10).map((sale) => (
                                                <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-3 text-gray-900">
                                                        {format(new Date(sale.createdAt), "dd MMM yyyy, h:mm a")}
                                                    </td>
                                                    <td className="px-6 py-3 text-gray-600">
                                                        <div className="flex flex-col gap-1">
                                                            {sale.items?.map((item) => (
                                                                <span key={item.id} className="text-xs">
                                                                    {item.quantity}x {item.product?.name || "Producto"}
                                                                </span>
                                                            )) || <span className="text-xs italic">Sin items</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3 text-right font-medium text-gray-900">
                                                        ${Number(sale.total).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!(salesReport?.sales || []).length) && (
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                                                        No hay ventas en este periodo
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </DashboardLayout>
        </AuthGuard>
    );
}
