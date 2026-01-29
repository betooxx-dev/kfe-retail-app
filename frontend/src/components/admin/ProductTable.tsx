import { Product, Meta } from "@/types/products";

interface ProductTableProps {
    products: Product[];
    meta: Meta;
    onPageChange: (page: number) => void;
    onEdit: (product: Product) => void;
    onDelete: (id: string) => void;
    isLoading: boolean;
}

export default function ProductTable({
    products,
    meta,
    onPageChange,
    onEdit,
    onDelete,
    isLoading
}: ProductTableProps) {
    if (isLoading) {
        return (
            <div className="w-full h-64 flex items-center justify-center text-gray-400">
                Cargando productos...
            </div>
        )
    }

    if (products.length === 0) {
        return (
            <div className="w-full h-64 flex items-center justify-center text-gray-400">
                No se encontraron productos.
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Nombre</th>
                            <th className="px-6 py-4">Precio</th>
                            <th className="px-6 py-4">Stock</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                <td className="px-6 py-4 text-gray-600">${Number(product.price).toFixed(2)}</td>
                                <td className="px-6 py-4 text-gray-600">{product.stock}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {product.isActive ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button
                                        onClick={() => onEdit(product)}
                                        className="text-blue-600 hover:text-blue-800 font-medium text-xs transition-colors cursor-pointer"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => onDelete(product.id)}
                                        className="text-red-500 hover:text-red-700 font-medium text-xs transition-colors cursor-pointer"
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                <div className="text-xs text-gray-500">
                    Mostrando página {meta.page} de {meta.lastPage} ({meta.total} total)
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => onPageChange(meta.page - 1)}
                        disabled={meta.page <= 1}
                        className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                    >
                        Anterior
                    </button>
                    <button
                        onClick={() => onPageChange(meta.page + 1)}
                        disabled={meta.page >= meta.lastPage}
                        className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        </div>
    );
}
