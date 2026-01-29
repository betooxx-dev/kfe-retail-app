import { useEffect } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Product } from "@/types/products";

// ... imports unchanged

const productSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    price: z.coerce.number().min(0, "El precio debe ser positivo"),
    stock: z.coerce.number().min(0, "El stock debe ser positivo"),
    isActive: z.boolean().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ProductFormValues) => void;
    initialData?: Product | null;
    isSubmitting: boolean;
}

export default function ProductModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isSubmitting,
}: ProductModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as Resolver<ProductFormValues>,
        defaultValues: {
            name: "",
            price: 0,
            stock: 0,
            isActive: true,
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    name: initialData.name,
                    price: Number(initialData.price),
                    stock: initialData.stock,
                    isActive: initialData.isActive,
                });
            } else {
                reset({
                    name: "",
                    price: 0,
                    stock: 0,
                    isActive: true,
                });
            }
        }
    }, [isOpen, initialData, reset]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                        {initialData ? "Editar Producto" : "Nuevo Producto"}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
                        <span className="sr-only">Cerrar</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                            {...register("name")}
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 outline-none focus:border-[#4A3B32] focus:ring-1 focus:ring-[#4A3B32] transition-all"
                            placeholder="Nombre del Producto"
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                            <input
                                {...register("price")}
                                type="number"
                                step="0.01"
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 outline-none focus:border-[#4A3B32] focus:ring-1 focus:ring-[#4A3B32] transition-all"
                            />
                            {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                            <input
                                {...register("stock")}
                                type="number"
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 outline-none focus:border-[#4A3B32] focus:ring-1 focus:ring-[#4A3B32] transition-all"
                            />
                            {errors.stock && <p className="mt-1 text-xs text-red-500">{errors.stock.message}</p>}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            {...register("isActive")}
                            type="checkbox"
                            id="isActive"
                            className="h-4 w-4 rounded border-gray-300 text-[#4A3B32] focus:ring-[#4A3B32]"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Producto Activo</label>
                    </div>

                    <div className="pt-4 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-[#4A3B32] rounded-lg hover:bg-[#3E3028] focus:outline-none focus:ring-2 focus:ring-[#4A3B32] focus:ring-offset-2 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                        >
                            {isSubmitting ? "Guardando..." : "Guardar Producto"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
