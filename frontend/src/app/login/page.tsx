"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/api/api";
import { useState } from "react";

const loginSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const login = useAuthStore((state: any) => state.login);
    const router = useRouter();
    const [submitError, setSubmitError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        setSubmitError(null);
        try {
            await login(data.email, data.password);
            const user = useAuthStore.getState().user;
            if (!user) return router.push("/");
            if (user.role === "ADMIN") return router.push("/admin");
            if (user.role === "MANAGER") return router.push("/manager");
            if (user.role === "CASHIER") return router.push("/cashier");
        } catch (error) {
            console.error("Login failed", error);
            setSubmitError("Login failed. Please check your credentials.");
        }
    };

    const handleSeed = async () => {
        try {
            await api.post("/seed");
            alert("Database seeded successfully!");
        } catch (error) {
            console.error("Seed failed", error);
            alert("Failed to seed database.");
        }
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#F5F5F0]">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-light tracking-wide text-[#4A3B32]">KFE</h1>
                    <p className="text-sm text-gray-500 mt-2">Premium Coffee Experience</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {submitError && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500 text-center">
                            {submitError}
                        </div>
                    )}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                        <input
                            {...register("email")}
                            type="email"
                            className={`w-full rounded-lg border px-4 py-3 text-gray-900 outline-none transition-all ${errors.email
                                ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                : "border-gray-200 bg-gray-50 focus:border-[#4A3B32] focus:ring-1 focus:ring-[#4A3B32]"
                                }`}
                            placeholder="your@email.com"
                        />
                        {errors.email && (
                            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
                        <input
                            {...register("password")}
                            type="password"
                            className={`w-full rounded-lg border px-4 py-3 text-gray-900 outline-none transition-all ${errors.password
                                ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                : "border-gray-200 bg-gray-50 focus:border-[#4A3B32] focus:ring-1 focus:ring-[#4A3B32]"
                                }`}
                            placeholder="••••••••"
                        />
                        {errors.password && (
                            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-lg bg-[#4A3B32] px-4 py-3 font-semibold text-white shadow-md hover:bg-[#3E3028] focus:outline-none focus:ring-2 focus:ring-[#4A3B32] focus:ring-offset-2 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <div className="mt-8 border-t border-gray-100 pt-6 text-center">
                    <button
                        onClick={handleSeed}
                        className="text-xs font-medium text-gray-400 hover:text-[#4A3B32] transition-colors cursor-pointer"
                    >
                        Load Seed Data
                    </button>
                </div>
            </div>
        </div>
    );
}
